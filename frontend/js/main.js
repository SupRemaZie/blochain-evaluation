async function loadAllData() {
    await loadWorkflowStatus();
    await loadCandidates();
    await checkVotingStatus();
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

window.loadAllData = loadAllData;

