async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        State.provider = new ethers.BrowserProvider(window.ethereum);
        State.signer = await State.provider.getSigner();
        State.userAddress = await State.signer.getAddress();

        initializeContracts();

        document.getElementById('wallet-address').textContent = 'Connecté';
        document.getElementById('connected-address').textContent = State.userAddress;
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
    State.userAddress = null;
    State.provider = null;
    State.signer = null;
    State.votingSystem = null;
    State.voteNFT = null;
    State.userRoles = { admin: false, founder: false };

    document.getElementById('wallet-address').textContent = 'Non connecté';
    document.getElementById('connect-wallet').style.display = 'block';
    document.getElementById('wallet-info').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('founder-section').style.display = 'none';
    document.getElementById('winner-section').style.display = 'none';
}

async function loadWalletInfo() {
    if (!State.provider || !State.userAddress) return;

    const balance = await State.provider.getBalance(State.userAddress);
    const balanceEth = ethers.formatEther(balance);
    document.getElementById('wallet-balance').textContent = parseFloat(balanceEth).toFixed(4);
}

window.connectWallet = connectWallet;
window.changeAccount = changeAccount;
window.disconnectWallet = disconnectWallet;
window.loadWalletInfo = loadWalletInfo;

