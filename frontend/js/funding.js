async function fundCandidate() {
    if (!State.userRoles.founder) {
        alert('Vous devez être FOUNDER pour financer un candidat');
        return;
    }

    const contract = getVotingSystemContract();
    
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
        
        if (!State.provider || !State.userAddress) {
            alert('Veuillez vous connecter');
            return;
        }
        
        const balance = await State.provider.getBalance(State.userAddress);
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
        const tx = await State.votingSystem.fundCandidate(candidateId, { value: amountWei });
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

window.fundCandidate = fundCandidate;

