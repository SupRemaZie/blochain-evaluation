async function loadWinner() {
    const contract = getVotingSystemContract();

    try {
        if (!State.provider) {
            State.provider = new ethers.BrowserProvider(window.ethereum);
        }

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
                const result = await State.provider.call({
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

async function determineWinner() {
    if (!State.userAddress) {
        alert('Veuillez vous connecter');
        return;
    }

    if (!State.userRoles.admin) {
        alert('Vous devez être ADMIN pour déterminer le vainqueur');
        return;
    }

    const contract = new ethers.Contract(
        CONFIG.VOTING_SYSTEM_ADDRESS,
        CONFIG.VOTING_SYSTEM_ABI,
        State.signer || State.provider
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

window.loadWinner = loadWinner;
window.determineWinner = determineWinner;

