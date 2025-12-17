let provider, signer, votingSystem, voteNFT;
let userAddress = null;
let userRoles = { admin: false, founder: false };

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

document.addEventListener('DOMContentLoaded', async () => {
    await waitForEthers();
    
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask n\'est pas installé. Veuillez l\'installer pour utiliser cette application.');
        return;
    }

    CONFIG.ROLES.ADMIN_ROLE = ethers.id("ADMIN_ROLE");
    CONFIG.ROLES.FOUNDER_ROLE = ethers.id("FOUNDER_ROLE");

    document.getElementById('connect-wallet').addEventListener('click', connectWallet);
    document.getElementById('change-account')?.addEventListener('click', changeAccount);
    document.getElementById('register-candidate').addEventListener('click', registerCandidate);
    document.getElementById('set-workflow').addEventListener('click', setWorkflowStatus);
    document.getElementById('grant-founder').addEventListener('click', grantFounderRole);
    document.getElementById('fund-candidate').addEventListener('click', fundCandidate);
    document.getElementById('determine-winner').addEventListener('click', determineWinner);
    document.getElementById('refresh-status').addEventListener('click', loadAllData);

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
        await connectWallet();
    }

    await loadAllData();

    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            await connectWallet();
        }
    });
});

async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();

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

        document.getElementById('wallet-address').textContent = 'Connecté';
        document.getElementById('connected-address').textContent = userAddress;
        document.getElementById('connect-wallet').style.display = 'none';
        document.getElementById('wallet-info').style.display = 'block';

        await loadWalletInfo();
        await checkUserRoles();
        await loadAllData();

    } catch (error) {
        console.error('Erreur de connexion:', error);
        showTransactionStatus('Erreur de connexion: ' + error.message, 'error');
    }
}

async function changeAccount() {
    try {
        try {
            await window.ethereum.request({ 
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }]
            });
        } catch (permError) {
            if (permError.code === 4001) {
                showTransactionStatus('Changement de compte annulé', 'error');
                return;
            }
            
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                await connectWallet();
                showTransactionStatus('Compte changé avec succès !', 'success');
            }
        }
    } catch (error) {
        console.error('Erreur lors du changement de compte:', error);
        showTransactionStatus('Erreur lors du changement de compte: ' + error.message, 'error');
    }
}

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
    document.getElementById('winner-section').style.display = 'none';
}

async function loadWalletInfo() {
    if (!provider || !userAddress) return;

    const balance = await provider.getBalance(userAddress);
    const balanceEth = ethers.formatEther(balance);
    document.getElementById('wallet-balance').textContent = parseFloat(balanceEth).toFixed(4);
}

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

        document.getElementById('admin-section').style.display = userRoles.admin ? 'block' : 'none';
        document.getElementById('founder-section').style.display = userRoles.founder ? 'block' : 'none';
        
        const winnerSection = document.getElementById('winner-section');
        if (winnerSection && winnerSection.style.display !== 'none') {
            document.getElementById('determine-winner').style.display = userRoles.admin ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des rôles:', error);
    }
}

async function loadAllData() {
    await loadWorkflowStatus();
    await loadCandidates();
    await checkVotingStatus();
}

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
        const statusNumber = Number(status);
        const statusName = CONFIG.WORKFLOW_STATUS[statusNumber];
        document.getElementById('current-phase').textContent = statusName;
        
        const workflowSelect = document.getElementById('workflow-select');
        if (workflowSelect) {
            workflowSelect.value = statusNumber.toString();
        }

        if (status == 2) {
            const voteStartTime = await contract.voteStartTime();
            const currentTime = Math.floor(Date.now() / 1000);
            const delaySeconds = 20;
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

        if (status == 3) {
            document.getElementById('winner-section').style.display = 'block';
            document.getElementById('determine-winner').style.display = userRoles.admin ? 'block' : 'none';
            await loadWinner();
            document.getElementById('founder-section').style.display = 'none';
        } else {
            document.getElementById('winner-section').style.display = 'none';
            if (userRoles.founder) {
                document.getElementById('founder-section').style.display = 'block';
            }
        }

    } catch (error) {
        console.error('Erreur lors du chargement du statut:', error);
    }
}

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

        let idsArray;
        if (Array.isArray(candidateIds)) {
            idsArray = candidateIds;
        } else if (candidateIds && typeof candidateIds === 'object') {
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
        
        for (let i = 0; i < idsArray.length; i++) {
            const id = idsArray[i];
            let candidateId, candidateName, amountReceived, voteCount;
            try {
                const iface = contract.interface;
                const data = iface.encodeFunctionData("getCandidate", [id]);
                const result = await provider.call({
                    to: CONFIG.VOTING_SYSTEM_ADDRESS,
                    data: data
                });
                
                const abiCoder = ethers.AbiCoder.defaultAbiCoder();
                const hexData = result.startsWith('0x') ? result.slice(2) : result;
                const offset = parseInt(hexData.slice(0, 64), 16);
                const tupleData = "0x" + hexData.slice(offset * 2);
                const types = ["uint256", "string", "uint256", "uint256"];
                const decoded = abiCoder.decode(types, tupleData);
                
                candidateId = decoded[0];
                candidateName = decoded[1];
                amountReceived = decoded[2];
                voteCount = decoded[3];
            } catch (error) {
                console.error(`Erreur lors de la récupération du candidat ${id}:`, error);
                candidateId = id;
                candidateName = null;
                amountReceived = 0n;
                voteCount = 0n;
            }
            
            if (!candidateName || candidateName === '' || candidateName === null || candidateName === undefined) {
                try {
                    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
                    const iface = contract.interface;
                    const data = iface.encodeFunctionData("getCandidate", [id]);
                    const result = await provider.call({
                        to: CONFIG.VOTING_SYSTEM_ADDRESS,
                        data: data
                    });
                    
                    const types = ["uint256", "string", "uint256", "uint256"];
                    const hexData = result.startsWith('0x') ? result.slice(2) : result;
                    const offset = parseInt(hexData.slice(0, 64), 16);
                    const tupleData = "0x" + hexData.slice(offset * 2);
                    const decoded = abiCoder.decode(types, tupleData);
                    
                    if (decoded && decoded[1]) {
                        candidateName = decoded[1];
                        candidateId = decoded[0];
                        amountReceived = decoded[2];
                        voteCount = decoded[3];
                    }
                } catch (e) {
                    console.error('Erreur avec AbiCoder:', e);
                }
                
                if (!candidateName || candidateName === '' || candidateName === null || candidateName === undefined) {
                    candidateName = `Candidat ${candidateId}`;
                }
            }
            
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

            const option = `<option value="${candidateIdStr}">${candidateName} (ID: ${candidateIdStr})</option>`;
            fundOptions.push(option);

            const voteOption = `
                <button class="vote-btn" onclick="vote(${candidateId})">
                    Voter pour ${candidateName}
                </button>
            `;
            voteOptionsHTML.push(voteOption);
        }

        candidatesList.innerHTML = candidatesHTML.join('');
        
        if (fundOptions.length > 0) {
            const selectHTML = '<option value="">Sélectionner un candidat</option>' + fundOptions.join('');
            fundSelect.innerHTML = selectHTML;
        } else {
            fundSelect.innerHTML = '<option value="">Aucun candidat disponible</option>';
        }
        
        voteOptions.innerHTML = voteOptionsHTML.join('');

    } catch (error) {
        console.error('Erreur lors du chargement des candidats:', error);
        document.getElementById('candidates-list').innerHTML = '<p class="error">Erreur lors du chargement</p>';
    }
}

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
        
        if (errorMessage.includes('InvalidWorkflowStatus') || errorMessage.includes('0x0e10df3f')) {
            errorMessage = 'Vous devez être en phase REGISTER_CANDIDATES pour enregistrer un candidat.';
        } else if (errorMessage.includes('AccessControl')) {
            errorMessage = 'Vous devez être ADMIN pour enregistrer un candidat.';
        }
        
        showTransactionStatus('Erreur: ' + errorMessage, 'error');
    }
}

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

async function fundCandidate() {
    if (!userRoles.founder) {
        alert('Vous devez être FOUNDER pour financer un candidat');
        return;
    }

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
        if (Number(status) === 3) {
            showTransactionStatus('Impossible de financer : la campagne de vote est terminée (phase COMPLETED)', 'error');
            return;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
    }

    const candidateId = document.getElementById('fund-candidate-select').value;
    const amount = document.getElementById('fund-amount').value;

    if (!candidateId || !amount) {
        alert('Veuillez sélectionner un candidat et entrer un montant');
        return;
    }

    try {
        const amountWei = ethers.parseEther(amount);
        
        if (!provider || !userAddress) {
            alert('Veuillez vous connecter');
            return;
        }
        
        const balance = await provider.getBalance(userAddress);
        const estimatedGasCost = ethers.parseEther("0.001");
        const totalNeeded = amountWei + estimatedGasCost;
        
        if (balance < totalNeeded) {
            const balanceEth = ethers.formatEther(balance);
            const neededEth = ethers.formatEther(totalNeeded);
            const shortfallEth = ethers.formatEther(totalNeeded - balance);
            
            const errorMessage = `Solde insuffisant !\n\n` +
                  `Solde disponible: ${parseFloat(balanceEth).toFixed(4)} ETH\n` +
                  `Montant requis: ${parseFloat(amount).toFixed(4)} ETH\n` +
                  `Frais de gas estimés: ~0.001 ETH\n` +
                  `Total nécessaire: ${parseFloat(neededEth).toFixed(4)} ETH\n` +
                  `Manque: ${parseFloat(shortfallEth).toFixed(4)} ETH\n\n` +
                  `Veuillez réduire le montant ou ajouter des fonds à votre wallet.`;
            
            showTransactionStatus(errorMessage, 'error');
            return;
        }
        
        showTransactionStatus('Financement du candidat...', 'pending');
        const tx = await votingSystem.fundCandidate(candidateId, { value: amountWei });
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Candidat financé avec succès !', 'success', tx.hash);
        
        document.getElementById('fund-amount').value = '';
        await loadCandidates();
        await loadWalletInfo();
    } catch (error) {
        console.error('Erreur:', error);
        let errorMessage = error.message;
        
        if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
            errorMessage = 'Solde insuffisant. Vérifiez que vous avez assez d\'ETH pour le financement et les frais de gas.';
        }
        
        showTransactionStatus('Erreur: ' + errorMessage, 'error');
    }
}

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

        const status = await votingSystem.workflowStatus();
        if (Number(status) !== 2) {
            alert('Le vote n\'est pas encore ouvert. Phase actuelle: ' + CONFIG.WORKFLOW_STATUS[Number(status)]);
            return;
        }

        const voteStartTime = await votingSystem.voteStartTime();
        const voteStartTimeNum = Number(voteStartTime);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeElapsed = currentTime - voteStartTimeNum;
        
        if (voteStartTimeNum === 0) {
            alert('La phase VOTE n\'a pas encore été activée. Le voteStartTime est 0.');
            return;
        }
        
        if (timeElapsed < 20) {
            const remaining = 20 - timeElapsed;
            alert(`Vous devez attendre encore ${remaining} seconde(s) avant de pouvoir voter. Temps écoulé: ${timeElapsed}s / 20s requis.`);
            return;
        }

        try {
            const candidate = await votingSystem.getCandidate(candidateId);
            if (candidate && Number(candidate[0]) !== Number(candidateId)) {
                alert('Candidat invalide');
                return;
            }
        } catch (e) {
            // Ignorer si on ne peut pas vérifier le candidat
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
        let errorMessage = error.message;
        
        const errorData = error.data || error.reason?.data || (error.reason && typeof error.reason === 'string' && error.reason.includes('0xc62abcd6') ? '0xc62abcd6' : null);
        if (errorMessage.includes('VoteNotStarted') || errorMessage.includes('0xc62abcd6') || errorData === '0xc62abcd6' || (error.data && error.data.toString().includes('0xc62abcd6'))) {
            try {
                const voteStartTime = await votingSystem.voteStartTime();
                const voteStartTimeNum = Number(voteStartTime);
                const currentTime = Math.floor(Date.now() / 1000);
                const timeElapsed = currentTime - voteStartTimeNum;
                
                if (voteStartTimeNum === 0) {
                    errorMessage = 'La phase VOTE n\'a pas encore été activée. Veuillez activer la phase VOTE d\'abord.';
                } else {
                    const remaining20 = Math.max(0, 20 - timeElapsed);
                    const remaining3600 = Math.max(0, 3600 - timeElapsed);
                    
                    if (timeElapsed < 20) {
                        errorMessage = `Le vote n'a pas encore commencé. Temps écoulé: ${timeElapsed}s / 20s requis. Il reste ${remaining20} seconde(s) à attendre.`;
                    } else if (timeElapsed < 3600) {
                        errorMessage = `Le contrat déployé utilise encore l'ancienne version (3600s). Temps écoulé: ${timeElapsed}s / 3600s requis. Il reste ${remaining3600} seconde(s) (${Math.floor(remaining3600/60)} minutes) à attendre. Veuillez redéployer le contrat avec la nouvelle version (20s) ou attendre.`;
                    } else {
                        errorMessage = `Le vote n'a pas encore commencé. Temps écoulé: ${timeElapsed}s.`;
                    }
                }
            } catch (e) {
                console.error('Erreur lors de la récupération des infos de temps:', e);
                errorMessage = 'Le vote n\'a pas encore commencé. Le contrat déployé peut utiliser 3600s (ancien) ou 20s (nouveau). Vérifiez le temps écoulé depuis l\'activation de la phase VOTE.';
            }
        } else if (errorMessage.includes('AlreadyVoted')) {
            errorMessage = 'Vous avez déjà voté !';
        } else if (errorMessage.includes('InvalidCandidate')) {
            errorMessage = 'Candidat invalide.';
        } else if (errorMessage.includes('InvalidWorkflowStatus')) {
            errorMessage = 'Le vote n\'est pas ouvert. Vérifiez le statut du workflow.';
        }
        
        showTransactionStatus('Erreur: ' + errorMessage, 'error');
    }
}

async function determineWinner() {
    if (!userAddress) {
        alert('Veuillez vous connecter');
        return;
    }

    if (!userRoles.admin) {
        alert('Vous devez être ADMIN pour déterminer le vainqueur');
        return;
    }

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
        
        const receipt = await tx.wait();
        
        const iface = contract.interface;
        for (const log of receipt.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                if (parsedLog && parsedLog.name === 'WinnerDetermined') {
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
                // Ignorer les logs qui n'appartiennent pas à ce contrat
            }
        }
        
        showTransactionStatus('Vainqueur déterminé avec succès !', 'success', tx.hash);
        await loadWinner();
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

async function loadWinner() {
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
        if (Number(status) !== 3) {
            return;
        }

        const candidateIds = await contract.getAllCandidateIds();
        
        if (candidateIds.length === 0) {
            document.getElementById('winner-info').innerHTML = '<p class="error">Aucun candidat enregistré</p>';
            return;
        }

        let maxVotes = 0n;
        let winnerId = null;
        let winnerName = '';
        let winnerVoteCount = 0n;

        for (let i = 0; i < candidateIds.length; i++) {
            const id = candidateIds[i];
            
            try {
                const iface = contract.interface;
                const data = iface.encodeFunctionData("getCandidate", [id]);
                const result = await provider.call({
                    to: CONFIG.VOTING_SYSTEM_ADDRESS,
                    data: data
                });
                
                const abiCoder = ethers.AbiCoder.defaultAbiCoder();
                const hexData = result.startsWith('0x') ? result.slice(2) : result;
                const offset = parseInt(hexData.slice(0, 64), 16);
                const tupleData = "0x" + hexData.slice(offset * 2);
                const types = ["uint256", "string", "uint256", "uint256"];
                const decoded = abiCoder.decode(types, tupleData);
                
                const candidateId = decoded[0];
                const candidateName = decoded[1];
                const voteCount = decoded[3];

                if (voteCount > maxVotes) {
                    maxVotes = voteCount;
                    winnerId = candidateId;
                    winnerName = candidateName;
                    winnerVoteCount = voteCount;
                }
            } catch (e) {
                console.error('Erreur lors du décodage du candidat:', e);
                continue;
            }
        }

        if (winnerId && maxVotes > 0n) {
            document.getElementById('winner-info').innerHTML = `
                <div class="winner-card">
                    <h3>🏆 ${winnerName}</h3>
                    <p><strong>ID:</strong> ${winnerId.toString()}</p>
                    <p><strong>Votes:</strong> ${winnerVoteCount.toString()}</p>
                </div>
            `;
        } else {
            document.getElementById('winner-info').innerHTML = '<p class="error">Aucun vote enregistré</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement du vainqueur:', error);
        document.getElementById('winner-info').innerHTML = '<p class="error">Erreur lors du chargement du vainqueur</p>';
    }
}

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
