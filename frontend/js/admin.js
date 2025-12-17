async function grantFounderRole() {
    if (!State.userRoles.admin) {
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
        const tx = await State.votingSystem.grantRole(CONFIG.ROLES.FOUNDER_ROLE, address);
        showTransactionStatus('Transaction envoyée...', 'pending', tx.hash);
        
        await tx.wait();
        showTransactionStatus('Rôle attribué avec succès !', 'success', tx.hash);
        
        document.getElementById('founder-address').value = '';
    } catch (error) {
        console.error('Erreur:', error);
        showTransactionStatus('Erreur: ' + error.message, 'error');
    }
}

window.grantFounderRole = grantFounderRole;

