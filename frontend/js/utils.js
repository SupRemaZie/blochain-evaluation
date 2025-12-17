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

window.waitForEthers = waitForEthers;
window.showTransactionStatus = showTransactionStatus;

