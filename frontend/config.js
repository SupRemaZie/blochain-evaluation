// Configuration des adresses des contrats déployés sur Sepolia
const CONFIG = {
    VOTE_NFT_ADDRESS: "0xdb9fcDD0006f1EafDC54d289d4593175F23dDbbd",
    VOTING_SYSTEM_ADDRESS: "0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb",
    SEPOLIA_RPC_URL: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // À remplacer si nécessaire
    ETHERSCAN_URL: "https://sepolia.etherscan.io",
    
    // ABI simplifiés (les fonctions principales)
    VOTING_SYSTEM_ABI: [
        "function workflowStatus() view returns (uint8)",
        "function voteStartTime() view returns (uint256)",
        "function getCandidateCount() view returns (uint256)",
        "function getCandidate(uint256) view returns (uint256 id, string memory name, uint256 amountReceived, uint256 voteCount)",
        "function getAllCandidateIds() view returns (uint256[])",
        "function registerCandidate(string memory name)",
        "function setWorkflowStatus(uint8 newStatus)",
        "function fundCandidate(uint256 candidateId) payable",
        "function vote(uint256 candidateId)",
        "function determineWinner() returns (uint256 candidateId, string memory name)",
        "function hasRole(bytes32 role, address account) view returns (bool)",
        "function grantRole(bytes32 role, address account)",
        "function voteNFT() view returns (address)",
        "event CandidateRegistered(uint256 indexed candidateId, string name)",
        "event WorkflowStatusChanged(uint8 oldStatus, uint8 newStatus)",
        "event CandidateFunded(uint256 indexed candidateId, address indexed founder, uint256 amount)",
        "event Voted(address indexed voter, uint256 indexed candidateId)",
        "event WinnerDetermined(uint256 indexed candidateId, string name, uint256 voteCount)"
    ],
    
    VOTE_NFT_ABI: [
        "function hasVoted(address voter) view returns (bool)",
        "function balanceOf(address owner) view returns (uint256)"
    ],
    
    // Rôles
    ROLES: {
        ADMIN_ROLE: "0x" + ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE")).slice(0, 2) + ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE")).slice(2),
        FOUNDER_ROLE: "0x" + ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FOUNDER_ROLE")).slice(0, 2) + ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FOUNDER_ROLE")).slice(2)
    },
    
    // Statuts du workflow
    WORKFLOW_STATUS: {
        0: "REGISTER_CANDIDATES",
        1: "FOUND_CANDIDATES",
        2: "VOTE",
        3: "COMPLETED"
    }
};

