function initializeContracts() {
    State.votingSystem = new ethers.Contract(
        CONFIG.VOTING_SYSTEM_ADDRESS,
        CONFIG.VOTING_SYSTEM_ABI,
        State.signer
    );

    State.voteNFT = new ethers.Contract(
        CONFIG.VOTE_NFT_ADDRESS,
        CONFIG.VOTE_NFT_ABI,
        State.provider
    );
}

function getVotingSystemContract() {
    if (!State.provider) {
        State.provider = new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.Contract(
        CONFIG.VOTING_SYSTEM_ADDRESS,
        CONFIG.VOTING_SYSTEM_ABI,
        State.provider
    );
}

window.initializeContracts = initializeContracts;
window.getVotingSystemContract = getVotingSystemContract;

