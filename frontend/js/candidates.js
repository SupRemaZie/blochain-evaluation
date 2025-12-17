function decodeCandidateData(result) {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const hexData = result.startsWith('0x') ? result.slice(2) : result;
    const offset = parseInt(hexData.slice(0, 64), 16);
    const tupleData = "0x" + hexData.slice(offset * 2);
    const types = ["uint256", "string", "uint256", "uint256"];
    return abiCoder.decode(types, tupleData);
}

async function getCandidateData(contract, id) {
    try {
        if (!State.provider) {
            State.provider = new ethers.BrowserProvider(window.ethereum);
        }
        const iface = contract.interface;
        const data = iface.encodeFunctionData("getCandidate", [id]);
        const result = await State.provider.call({
            to: CONFIG.VOTING_SYSTEM_ADDRESS,
            data: data
        });
        return decodeCandidateData(result);
    } catch (error) {
        console.error(`Erreur lors de la récupération du candidat ${id}:`, error);
        return null;
    }
}

async function loadCandidates() {
    const contract = getVotingSystemContract();

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
            
            const decoded = await getCandidateData(contract, id);
            
            if (decoded) {
                candidateId = decoded[0];
                candidateName = decoded[1];
                amountReceived = decoded[2];
                voteCount = decoded[3];
            } else {
                candidateId = id;
                candidateName = null;
                amountReceived = 0n;
                voteCount = 0n;
            }
            
            if (!candidateName || candidateName === '' || candidateName === null || candidateName === undefined) {
                const retryDecoded = await getCandidateData(contract, id);
                if (retryDecoded && retryDecoded[1]) {
                    candidateName = retryDecoded[1];
                    candidateId = retryDecoded[0];
                    amountReceived = retryDecoded[2];
                    voteCount = retryDecoded[3];
                } else {
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

async function registerCandidate() {
    if (!State.userRoles.admin) {
        alert('Vous devez être ADMIN pour enregistrer un candidat');
        return;
    }

    const name = document.getElementById('candidate-name').value.trim();
    if (!name) {
        alert('Veuillez entrer un nom de candidat');
        return;
    }

    try {
        const status = await State.votingSystem.workflowStatus();
        if (Number(status) !== 0) {
            alert('Vous devez être en phase REGISTER_CANDIDATES pour enregistrer un candidat. Phase actuelle: ' + CONFIG.WORKFLOW_STATUS[Number(status)]);
            return;
        }

        showTransactionStatus('Enregistrement du candidat...', 'pending');
        const tx = await State.votingSystem.registerCandidate(name);
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

window.loadCandidates = loadCandidates;
window.registerCandidate = registerCandidate;

