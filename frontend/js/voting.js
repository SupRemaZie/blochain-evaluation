async function checkVotingStatus() {
    if (!State.userAddress || !State.voteNFT) return;

    try {
        const hasVoted = await State.voteNFT.hasVoted(State.userAddress);
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

async function vote(candidateId) {
    if (!State.userAddress) {
        alert('Veuillez vous connecter');
        return;
    }

    try {
        const hasVoted = await State.voteNFT.hasVoted(State.userAddress);
        if (hasVoted) {
            alert('Vous avez déjà voté !');
            return;
        }

        const status = await State.votingSystem.workflowStatus();
        if (Number(status) !== 2) {
            alert('Le vote n\'est pas encore ouvert. Phase actuelle: ' + CONFIG.WORKFLOW_STATUS[Number(status)]);
            return;
        }

        const voteStartTime = await State.votingSystem.voteStartTime();
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
            const candidate = await State.votingSystem.getCandidate(candidateId);
            if (candidate && Number(candidate[0]) !== Number(candidateId)) {
                alert('Candidat invalide');
                return;
            }
        } catch (e) {
            // Ignorer si on ne peut pas vérifier le candidat
        }

        showTransactionStatus('Envoi du vote...', 'pending');
        const tx = await State.votingSystem.vote(candidateId);
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
                const voteStartTime = await State.votingSystem.voteStartTime();
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

window.checkVotingStatus = checkVotingStatus;
window.vote = vote;

