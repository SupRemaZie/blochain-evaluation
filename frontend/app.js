// Application principale
let provider, signer, votingSystem, voteNFT;
let userAddress = null;
let userRoles = { admin: false, founder: false };

// Attendre que ethers.js soit chargé
function waitForEthers() {
    return new Promise((resolve) => {
        if (typeof ethers !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof ethers !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Attendre que ethers.js soit chargé
    await waitForEthers();
    
    // Vérifier si MetaMask est installé
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask n\'est pas installé. Veuillez l\'installer pour utiliser cette application.');
        return;
    }

    // Initialiser les rôles dans CONFIG (ethers v6)
    CONFIG.ROLES.ADMIN_ROLE = ethers.id("ADMIN_ROLE");
    CONFIG.ROLES.FOUNDER_ROLE = ethers.id("FOUNDER_ROLE");

    // Événements
    document.getElementById('connect-wallet').addEventListener('click', connectWallet);
    document.getElementById('register-candidate').addEventListener('click', registerCandidate);
    document.getElementById('set-workflow').addEventListener('click', setWorkflowStatus);
    document.getElementById('grant-founder').addEventListener('click', grantFounderRole);
    document.getElementById('fund-candidate').addEventListener('click', fundCandidate);
    document.getElementById('determine-winner').addEventListener('click', determineWinner);
    document.getElementById('refresh-status').addEventListener('click', loadAllData);

    // Vérifier si déjà connecté
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
        await connectWallet();
    }

    // Charger les données initiales
    await loadAllData();

    // Écouter les changements de compte
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            await connectWallet();
        }
    });
});

// Connexion au wallet
async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();

        // Initialiser les contrats
        votingSystem = new ethers.Contract(
            CONFIG.VOTING_SYSTEM_ADDRESS,
            CONFIG.VOTING_SYSTEM_ABI,
            signer
        );

        voteNFT = new ethers.Contract(
            CONFIG.VOTE_NFT_ADDRESS,
            CONFIG.VOTE_NFT_ABI,
            provider
        );

        // Mettre à jour l'UI
        document.getElementById('wallet-address').textContent = 'Connecté';
        document.getElementById('connected-address').textContent = userAddress;
        document.getElementById('connect-wallet').style.display = 'none';
        document.getElementById('wallet-info').style.display = 'block';

        // Charger les informations du wallet
        await loadWalletInfo();
        await checkUserRoles();
        await loadAllData();

    } catch (error) {
        console.error('Erreur de connexion:', error);
        showTransactionStatus('Erreur de connexion: ' + error.message, 'error');
    }
}

// Déconnexion
function disconnectWallet() {
    userAddress = null;
    provider = null;
    signer = null;
    votingSystem = null;
    voteNFT = null;
    userRoles = { admin: false, founder: false };

    document.getElementById('wallet-address').textContent = 'Non connecté';
    document.getElementById('connect-wallet').style.display = 'block';
    document.getElementById('wallet-info').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('founder-section').style.display = 'none';
}

// Charger les informations du wallet
async function loadWalletInfo() {
    if (!provider || !userAddress) return;

    const balance = await provider.getBalance(userAddress);
    const balanceEth = ethers.formatEther(balance);
    document.getElementById('wallet-balance').textContent = parseFloat(balanceEth).toFixed(4);
}

// Vérifier les rôles de l'utilisateur
async function checkUserRoles() {
    if (!votingSystem || !userAddress) return;

    try {
        userRoles.admin = await votingSystem.hasRole(CONFIG.ROLES.ADMIN_ROLE, userAddress);
        userRoles.founder = await votingSystem.hasRole(CONFIG.ROLES.FOUNDER_ROLE, userAddress);

        const rolesText = [];
        if (userRoles.admin) rolesText.push('ADMIN');
        if (userRoles.founder) rolesText.push('FOUNDER');
        if (rolesText.length === 0) rolesText.push('VOTANT');

        document.getElementById('user-roles').textContent = rolesText.join(', ');

        // Afficher les sections appropriées
        document.getElementById('admin-section').style.display = userRoles.admin ? 'block' : 'none';
        document.getElementById('founder-section').style.display = userRoles.founder ? 'block' : 'none';
    } catch (error) {
        console.error('Erreur lors de la vérification des rôles:', error);
    }
}

// Charger toutes les données
async function loadAllData() {
    await loadWorkflowStatus();
    await loadCandidates();
    await checkVotingStatus();
}

// Charger le statut du workflow
async function loadWorkflowStatus() {
    if (!provider) {
        provider = new ethers.BrowserProvider(window.ethereum);
    }

    const contract = new ethers.Contract(
        CONFIG.VOTING_SYSTEM_ADDRESS,
        CONFIG.VOTING_SYSTEM_ABI,
        provider
    );

    try {
        const status = await contract.workflowStatus();
        const statusName = CONFIG.WORKFLOW_STATUS[status];
        document.getElementById('current-phase').textContent = statusName;

        // Afficher le timer si en phase VOTE
        if (status == 2) {
            const voteStartTime = await contract.voteStartTime();
            const currentTime = Math.floor(Date.now() / 1000);
            const delaySeconds = 20; // 20 secondes pour les tests
            const timeRemaining = Number(voteStartTime) + delaySeconds - currentTime;

            if (timeRemaining > 0) {
                document.getElementById('vote-timer').style.display = 'block';
                startTimer(timeRemaining);
            } else {
                document.getElementById('vote-timer').style.display = 'none';
                document.getElementById('voting-section').style.display = 'block';
            }
        } else {
            document.getElementById('vote-timer').style.display = 'none';
        }

        // Afficher la section winner si COMPLETED
        if (status == 3) {
            document.getElementById('winner-section').style.display = 'block';
        }

    } catch (error) {
        console.error('Erreur lors du chargement du statut:', error);
    }
}

// Timer pour le vote
function startTimer(seconds) {
    const timerElement = document.getElementById('timer');
    
    const interval = setInterval(() => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        timerElement.textContent = `${hours}h ${minutes}m ${secs}s`;
        
        if (seconds <= 0) {
            clearInterval(interval);
            document.getElementById('voting-section').style.display = 'block';
            loadCandidates();
        }
        
        seconds--;
    }, 1000);
}

// Charger les candidats
async function loadCandidates() {
    if (!provider) {
        provider = new ethers.BrowserProvider(window.ethereum);
    }

    const contract = new ethers.Contract(
        CONFIG.VOTING_SYSTEM_ADDRESS,
        CONFIG.VOTING_SYSTEM_ABI,
        provider
    );

    try {
        const count = await contract.getCandidateCount();
        const candidatesList = document.getElementById('candidates-list');
        const fundSelect = document.getElementById('fund-candidate-select');
        const voteOptions = document.getElementById('vote-options');

        candidatesList.innerHTML = '';
        fundSelect.innerHTML = '<option value="">Sélectionner un candidat</option>';
        voteOptions.innerHTML = '';

        if (Number(count) === 0) {
            candidatesList.innerHTML = '<p class="no-data">Aucun candidat enregistré</p>';
            return;
        }

        const candidateIds = await contract.getAllCandidateIds();
        const candidatesHTML = [];
        const fundOptions = [];
        const voteOptionsHTML = [];

        // Dans ethers v6, les tableaux sont des objets, convertir en array
        let idsArray;
        if (Array.isArray(candidateIds)) {
            idsArray = candidateIds;
        } else if (candidateIds && typeof candidateIds === 'object') {
            // Convertir l'objet array-like en vrai array
            idsArray = [];
            try {
                const length = Number(candidateIds.length || 0);
                for (let j = 0; j < length; j++) {
                    if (candidateIds[j] !== undefined) {
                        idsArray.push(candidateIds[j]);
                    }
                }
            } catch (e) {
                console.error('Erreur lors de la conversion du tableau:', e);
                idsArray = [];
            }
        } else {
            console.error('Format de candidateIds inattendu:', candidateIds);
            idsArray = [];
        }
        
        console.log(`Nombre de candidats trouvés: ${idsArray.length}`, idsArray);
        
        for (let i = 0; i < idsArray.length; i++) {
            const id = idsArray[i];
            // Décoder les données avec AbiCoder directement (plus fiable)
            let candidateId, candidateName, amountReceived, voteCount;
            try {
                const iface = contract.interface;
                const data = iface.encodeFunctionData("getCandidate", [id]);
                const result = await provider.call({
                    to: CONFIG.VOTING_SYSTEM_ADDRESS,
                    data: data
                });
                
                console.log(`Données brutes pour candidat ${id}:`, result.substring(0, 200));
                
                // Utiliser AbiCoder directement pour décoder
                const abiCoder = ethers.AbiCoder.defaultAbiCoder();
                const hexData = result.startsWith('0x') ? result.slice(2) : result;
                
                // Le format de retour est: offset (32 bytes) puis tuple (uint256, string, uint256, uint256)
                const offset = parseInt(hexData.slice(0, 64), 16);
                console.log('Offset du tuple:', offset);
                
                // Les données du tuple commencent à l'offset
                const tupleData = "0x" + hexData.slice(offset * 2);
                
                // Décoder le tuple directement
                const types = ["uint256", "string", "uint256", "uint256"];
                const decoded = abiCoder.decode(types, tupleData);
                
                console.log('Décodage avec AbiCoder:', decoded);
                console.log('Type de decoded:', typeof decoded, 'isArray:', Array.isArray(decoded));
                console.log('Longueur:', decoded.length, 'Valeurs:', decoded[0], decoded[1], decoded[2], decoded[3]);
                
                // Dans ethers v6, decoded est un array
                candidateId = decoded[0];
                candidateName = decoded[1];
                amountReceived = decoded[2];
                voteCount = decoded[3];
                
                // Vérifier immédiatement si le nom est valide
                if (!candidateName || candidateName === '' || candidateName === null || candidateName === undefined) {
                    console.error('❌ Nom vide après décodage AbiCoder! decoded[1] =', decoded[1], 'type:', typeof decoded[1]);
                } else {
                    console.log('✅ Nom décodé avec succès:', candidateName);
                }
                
                console.log('Valeurs extraites:', { 
                    candidateId: candidateId.toString(), 
                    candidateName, 
                    amountReceived: amountReceived.toString(), 
                    voteCount: voteCount.toString() 
                });
            } catch (error) {
                console.error(`Erreur lors de la récupération du candidat ${id}:`, error);
                // En cas d'erreur, utiliser des valeurs par défaut
                candidateId = id;
                candidateName = null;
                amountReceived = 0n;
                voteCount = 0n;
            }
            
            // Vérifier que les valeurs sont valides
            if (!candidateName || candidateName === '' || candidateName === null || candidateName === undefined) {
                console.warn(`Nom de candidat invalide pour l'ID ${id}, valeurs:`, { 
                    candidateId, 
                    candidateName, 
                    amountReceived, 
                    voteCount,
                    typeCandidateName: typeof candidateName
                });
                
                // Essayer une dernière fois avec AbiCoder directement
                try {
                    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
                    const iface = contract.interface;
                    const data = iface.encodeFunctionData("getCandidate", [id]);
                    const result = await provider.call({
                        to: CONFIG.VOTING_SYSTEM_ADDRESS,
                        data: data
                    });
                    
                    // Décoder avec AbiCoder directement
                    const types = ["uint256", "string", "uint256", "uint256"];
                    // Le résultat commence après l'offset (32 bytes)
                    const hexData = result.startsWith('0x') ? result.slice(2) : result;
                    const offset = parseInt(hexData.slice(0, 64), 16);
                    const tupleData = "0x" + hexData.slice(offset * 2);
                    const decoded = abiCoder.decode(types, tupleData);
                    console.log('Décodage avec AbiCoder:', decoded);
                    
                    if (decoded && decoded[1]) {
                        candidateName = decoded[1];
                        candidateId = decoded[0];
                        amountReceived = decoded[2];
                        voteCount = decoded[3];
                        console.log('Nom récupéré avec AbiCoder:', candidateName);
                    }
                } catch (e) {
                    console.error('Erreur avec AbiCoder:', e);
                }
                
                // Si toujours pas de nom, utiliser un nom par défaut
                if (!candidateName || candidateName === '' || candidateName === null || candidateName === undefined) {
                    candidateName = `Candidat ${candidateId}`;
                }
            } else {
                console.log(`✅ Nom de candidat valide: "${candidateName}" pour l'ID ${candidateId}`);
            }
            
            // Convertir BigInt en string pour les valeurs
            const candidateIdStr = candidateId.toString ? candidateId.toString() : String(candidateId);
            
            const candidateCard = `
                <div class="candidate-card">
                    <h3>${candidateName}</h3>
                    <div class="candidate-info">
                        <p><strong>ID:</strong> ${candidateIdStr}</p>
                        <p><strong>Financement:</strong> ${ethers.formatEther(amountReceived)} ETH</p>
                        <p><strong>Votes:</strong> ${voteCount.toString()}</p>
                    </div>
                </div>
            `;
            candidatesHTML.push(candidateCard);

            // Ajouter l'option au select de financement
            const option = `<option value="${candidateIdStr}">${candidateName} (ID: ${candidateIdStr})</option>`;
            fundOptions.push(option);
            console.log(`Candidat ajouté au select: ${candidateName} (ID: ${candidateIdStr})`);

            const voteOption = `
                <button class="vote-btn" onclick="vote(${candidateId})">
                    Voter pour ${candidateName}
                </button>
            `;
            voteOptionsHTML.push(voteOption);
        }

        candidatesList.innerHTML = candidatesHTML.join('');
        
        // Mettre à jour le select de financement
        console.log(`Nombre d'options de financement: ${fundOptions.length}`);
        if (fundOptions.length > 0) {
            const selectHTML = '<option value="">Sélectionner un candidat</option>' + fundOptions.join('');
            fundSelect.innerHTML = selectHTML;
            console.log('Select de financement mis à jour avec', fundOptions.length, 'options');
            console.log('Contenu du select:', fundSelect.innerHTML.substring(0, 200));
        } else {
            fundSelect.innerHTML = '<option value="">Aucun candidat disponible</option>';
            console.warn('Aucune option à ajouter au select de financement');
        }
        
        voteOptions.innerHTML = voteOptionsHTML.join('');

    } catch (error) {
        console.error('Erreur lors du chargement des candidats:', error);
        document.getElementById('candidates-list').innerHTML = '<p class="error">Erreur lors du chargement</p>';
    }
}

// Vérifier le statut de vote
async function checkVotingStatus() {
    if (!userAddress || !voteNFT) return;

    try {
        const hasVoted = await voteNFT.hasVoted(userAddress);
        const votingInfo = document.getElementById('voting-info');
        
        if (hasVoted) {
            votingInfo.innerHTML = '<p class="success">✅ Vous avez déjà voté !</p>';
        } else {
            votingInfo.innerHTML = '<p>Vous pouvez voter pour un candidat ci-dessous.</p>';
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du vote:', error);
    }
}

// Enregistrer un candidat
async function registerCandidate() {
    if (!userRoles.admin) {
        alert('Vous devez être ADMIN pour enregistrer un candidat');
        return;
    }

    const name = document.getElementById('candidate-name').value.trim();
    if (!name) {
        alert('Veuillez entrer un nom de candidat');
        return;
    }

    try {
        // Vérifier d'abord le statut du workflow
        const status = await votingSystem.workflowStatus();
        if (Number(status) !== 0) {
            alert('Vous devez être en phase REGISTER_CANDIDATES pour enregistrer un candidat. Phase actuelle: ' + CONFIG.WORKFLOW_STATUS[Number(status)]);
            return;
        }

        showTransactionStatus('Enregistrement du candidat...', 'pending');
        const tx = await votingSystem.registerCandidate(name);
        showTransactionStatus('Transaction envoyée, attente de confirmation...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Candidat enregistré avec succès !', 'success', tx.hash);
        
        document.getElementById('candidate-name').value = '';
        await loadCandidates();
    } catch (error) {
        console.error('Erreur:', error);
        let errorMessage = error.message;
        
        // Améliorer les messages d'erreur
        if (errorMessage.includes('InvalidWorkflowStatus') || errorMessage.includes('0x0e10df3f')) {
            errorMessage = 'Vous devez être en phase REGISTER_CANDIDATES pour enregistrer un candidat.';
        } else if (errorMessage.includes('AccessControl')) {
            errorMessage = 'Vous devez être ADMIN pour enregistrer un candidat.';
        }
        
        showTransactionStatus('Erreur: ' + errorMessage, 'error');
    }
}

// Changer le statut du workflow
async function setWorkflowStatus() {
    if (!userRoles.admin) {
        alert('Vous devez être ADMIN pour changer le statut');
        return;
    }

    const status = parseInt(document.getElementById('workflow-select').value);
    
    try {
        showTransactionStatus('Changement du statut...', 'pending');
        const tx = await votingSystem.setWorkflowStatus(status);
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Statut changé avec succès !', 'success', tx.hash);
        
        await loadWorkflowStatus();
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

// Attribuer le rôle FOUNDER
async function grantFounderRole() {
    if (!userRoles.admin) {
        alert('Vous devez être ADMIN pour attribuer le rôle FOUNDER');
        return;
    }

    const address = document.getElementById('founder-address').value.trim();
    if (!ethers.isAddress(address)) {
        alert('Adresse invalide');
        return;
    }

    try {
        showTransactionStatus('Attribution du rôle FOUNDER...', 'pending');
        const tx = await votingSystem.grantRole(CONFIG.ROLES.FOUNDER_ROLE, address);
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Rôle attribué avec succès !', 'success', tx.hash);
        
        document.getElementById('founder-address').value = '';
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

// Financer un candidat
async function fundCandidate() {
    if (!userRoles.founder) {
        alert('Vous devez être FOUNDER pour financer un candidat');
        return;
    }

    const candidateId = document.getElementById('fund-candidate-select').value;
    const amount = document.getElementById('fund-amount').value;

    if (!candidateId || !amount) {
        alert('Veuillez sélectionner un candidat et entrer un montant');
        return;
    }

    try {
        const amountWei = ethers.parseEther(amount);
        showTransactionStatus('Financement du candidat...', 'pending');
        const tx = await votingSystem.fundCandidate(candidateId, { value: amountWei });
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Candidat financé avec succès !', 'success', tx.hash);
        
        document.getElementById('fund-amount').value = '';
        await loadCandidates();
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

// Voter
async function vote(candidateId) {
    if (!userAddress) {
        alert('Veuillez vous connecter');
        return;
    }

    try {
        const hasVoted = await voteNFT.hasVoted(userAddress);
        if (hasVoted) {
            alert('Vous avez déjà voté !');
            return;
        }

        showTransactionStatus('Envoi du vote...', 'pending');
        const tx = await votingSystem.vote(candidateId);
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Vote enregistré avec succès !', 'success', tx.hash);
        
        await loadCandidates();
        await checkVotingStatus();
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

// Déterminer le vainqueur
async function determineWinner() {
    if (!provider) {
        provider = new ethers.BrowserProvider(window.ethereum);
    }

    const contract = new ethers.Contract(
        CONFIG.VOTING_SYSTEM_ADDRESS,
        CONFIG.VOTING_SYSTEM_ABI,
        signer || provider
    );

    try {
        showTransactionStatus('Détermination du vainqueur...', 'pending');
        const tx = await contract.determineWinner();
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        // Dans ethers v6, determineWinner() retourne directement les valeurs
        // On peut aussi parser les logs si nécessaire
        const receipt = await tx.wait();
        
        // Dans ethers v6, determineWinner() retourne directement un tuple [candidateId, name]
        // Mais comme c'est une transaction, on doit parser les logs pour l'événement
        const iface = contract.interface;
        for (const log of receipt.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                if (parsedLog && parsedLog.name === 'WinnerDetermined') {
                    // Dans ethers v6, les args sont accessibles par index ou nom
                    const winnerId = parsedLog.args[0] || parsedLog.args.candidateId;
                    const winnerName = parsedLog.args[1] || parsedLog.args.name;
                    const voteCount = parsedLog.args[2] || parsedLog.args.voteCount;
                    
                    document.getElementById('winner-info').innerHTML = `
                        <div class="winner-card">
                            <h3>🏆 ${winnerName}</h3>
                            <p><strong>ID:</strong> ${winnerId.toString()}</p>
                            <p><strong>Votes:</strong> ${voteCount.toString()}</p>
                        </div>
                    `;
                    break;
                }
            } catch (e) {
                // Ce log n'appartient pas à ce contrat
                console.log('Log parsing error:', e);
            }
        }
        
        showTransactionStatus('Vainqueur déterminé avec succès !', 'success', tx.hash);
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

// Afficher le statut des transactions
function showTransactionStatus(message, type, txHash = null) {
    const statusDiv = document.getElementById('transaction-status');
    const messageP = document.getElementById('transaction-message');
    const linkA = document.getElementById('transaction-link');

    messageP.textContent = message;
    statusDiv.className = `transaction-status ${type}`;
    statusDiv.style.display = 'block';

    if (txHash) {
        linkA.href = `${CONFIG.ETHERSCAN_URL}/tx/${txHash}`;
        linkA.style.display = 'block';
    } else {
        linkA.style.display = 'none';
    }

    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

