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

async function loadWorkflowStatus() {
    const contract = getVotingSystemContract();

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
            document.getElementById('determine-winner').style.display = State.userRoles.admin ? 'block' : 'none';
            await loadWinner();
            document.getElementById('founder-section').style.display = 'none';
        } else {
            document.getElementById('winner-section').style.display = 'none';
            if (State.userRoles.founder) {
                document.getElementById('founder-section').style.display = 'block';
            }
        }

    } catch (error) {
        console.error('Erreur lors du chargement du statut:', error);
    }
}

async function setWorkflowStatus() {
    if (!State.userRoles.admin) {
        alert('Vous devez être ADMIN pour changer le statut');
        return;
    }

    const status = parseInt(document.getElementById('workflow-select').value);
    
    try {
        showTransactionStatus('Changement du statut...', 'pending');
        const tx = await State.votingSystem.setWorkflowStatus(status);
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Statut changé avec succès !', 'success', tx.hash);
        
        await loadWorkflowStatus();
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

window.startTimer = startTimer;
window.loadWorkflowStatus = loadWorkflowStatus;
window.setWorkflowStatus = setWorkflowStatus;

