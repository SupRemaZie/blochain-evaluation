// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VoteNFT.sol";

/**
 * @title VotingSystem
 * @dev Système de vote complet avec workflow, financement et NFT de vote
 */
contract VotingSystem is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FOUNDER_ROLE = keccak256("FOUNDER_ROLE");
    
    VoteNFT public voteNFT;
    
    enum WorkflowStatus {
        REGISTER_CANDIDATES,
        FOUND_CANDIDATES,
        VOTE,
        COMPLETED
    }
    
    struct Candidate {
        uint256 id;
        string name;
        uint256 amountReceived;
        uint256 voteCount;
    }
    
    WorkflowStatus public workflowStatus;
    uint256 public voteStartTime;
    uint256 private constant ONE_HOUR = 10; // 10 secondes pour les tests
    
    mapping(uint256 => Candidate) public candidates;
    uint256[] public candidateIds;
    uint256 private _candidateIdCounter;
    
    // Events
    event CandidateRegistered(uint256 indexed candidateId, string name);
    event WorkflowStatusChanged(WorkflowStatus oldStatus, WorkflowStatus newStatus);
    event CandidateFunded(uint256 indexed candidateId, address indexed founder, uint256 amount);
    event Voted(address indexed voter, uint256 indexed candidateId);
    event WinnerDetermined(uint256 indexed candidateId, string name, uint256 voteCount);
    
    // Custom Errors
    error InvalidWorkflowStatus(WorkflowStatus required, WorkflowStatus current);
    error CandidateNotFound(uint256 candidateId);
    error VoteNotStarted();
    error AlreadyVoted(address voter);
    error InvalidCandidate();
    error NoCandidates();
    error NoVotes();
    
    /**
     * @dev Constructeur du contrat VotingSystem
     * @param _voteNFT Adresse du contrat VoteNFT
     */
    constructor(address _voteNFT) {
        voteNFT = VoteNFT(_voteNFT);
        workflowStatus = WorkflowStatus.REGISTER_CANDIDATES;
        
        // Le déployeur devient ADMIN par défaut
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Modifier pour vérifier le statut du workflow
     */
    modifier onlyWorkflowStatus(WorkflowStatus _status) {
        if (workflowStatus != _status) {
            revert InvalidWorkflowStatus(_status, workflowStatus);
        }
        _;
    }
    
    /**
     * @dev Enregistre un nouveau candidat
     * @param name Nom du candidat
     * @notice Accessible uniquement par les ADMIN en phase REGISTER_CANDIDATES
     */
    function registerCandidate(string memory name) 
        external 
        onlyRole(ADMIN_ROLE) 
        onlyWorkflowStatus(WorkflowStatus.REGISTER_CANDIDATES) 
    {
        _candidateIdCounter++;
        uint256 candidateId = _candidateIdCounter;
        
        candidates[candidateId] = Candidate({
            id: candidateId,
            name: name,
            amountReceived: 0,
            voteCount: 0
        });
        
        candidateIds.push(candidateId);
        
        emit CandidateRegistered(candidateId, name);
    }
    
    /**
     * @dev Change le statut du workflow
     * @param newStatus Nouveau statut du workflow
     * @notice Accessible uniquement par les ADMIN
     */
    function setWorkflowStatus(WorkflowStatus newStatus) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        WorkflowStatus oldStatus = workflowStatus;
        workflowStatus = newStatus;
        
        // Enregistrer le timestamp quand VOTE est activé
        if (newStatus == WorkflowStatus.VOTE) {
            voteStartTime = block.timestamp;
        }
        
        emit WorkflowStatusChanged(oldStatus, newStatus);
    }
    
    /**
     * @dev Finance un candidat
     * @param candidateId ID du candidat à financer
     * @notice Accessible uniquement par les FOUNDER en phase FOUND_CANDIDATES
     */
    function fundCandidate(uint256 candidateId) 
        external 
        payable 
        onlyRole(FOUNDER_ROLE) 
        onlyWorkflowStatus(WorkflowStatus.FOUND_CANDIDATES) 
    {
        if (candidates[candidateId].id == 0) {
            revert CandidateNotFound(candidateId);
        }
        
        candidates[candidateId].amountReceived += msg.value;
        
        emit CandidateFunded(candidateId, msg.sender, msg.value);
    }
    
    /**
     * @dev Vote pour un candidat
     * @param candidateId ID du candidat pour lequel voter
     * @notice Accessible uniquement en phase VOTE, après 10 secondes d'activation
     */
    function vote(uint256 candidateId) 
        external 
        onlyWorkflowStatus(WorkflowStatus.VOTE) 
    {
        // Vérifier que 10 secondes se sont écoulées depuis l'activation de VOTE
        if (block.timestamp < voteStartTime + ONE_HOUR) {
            revert VoteNotStarted();
        }
        
        // Vérifier que le votant n'a pas déjà voté
        if (voteNFT.hasVoted(msg.sender)) {
            revert AlreadyVoted(msg.sender);
        }
        
        // Vérifier que le candidat existe
        if (candidates[candidateId].id == 0) {
            revert InvalidCandidate();
        }
        
        // Mint un NFT de vote au votant
        voteNFT.mint(msg.sender);
        
        // Incrémenter le compteur de votes
        candidates[candidateId].voteCount++;
        
        emit Voted(msg.sender, candidateId);
    }
    
    /**
     * @dev Détermine le vainqueur
     * @return candidateId ID du candidat gagnant
     * @return name Nom du candidat gagnant
     * @notice Accessible uniquement en phase COMPLETED
     */
    function determineWinner() 
        external 
        onlyWorkflowStatus(WorkflowStatus.COMPLETED) 
        returns (uint256 candidateId, string memory name) 
    {
        if (candidateIds.length == 0) {
            revert NoCandidates();
        }
        
        uint256 maxVotes = 0;
        uint256 winnerId = 0;
        
        for (uint256 i = 0; i < candidateIds.length; i++) {
            uint256 id = candidateIds[i];
            if (candidates[id].voteCount > maxVotes) {
                maxVotes = candidates[id].voteCount;
                winnerId = id;
            }
        }
        
        if (maxVotes == 0) {
            revert NoVotes();
        }
        
        candidateId = winnerId;
        name = candidates[winnerId].name;
        
        emit WinnerDetermined(winnerId, name, maxVotes);
    }
    
    /**
     * @dev Retourne le nombre total de candidats
     * @return Nombre de candidats enregistrés
     */
    function getCandidateCount() external view returns (uint256) {
        return candidateIds.length;
    }
    
    /**
     * @dev Retourne les informations d'un candidat
     * @param candidateId ID du candidat
     * @return candidate Structure Candidate
     */
    function getCandidate(uint256 candidateId) external view returns (Candidate memory) {
        return candidates[candidateId];
    }
    
    /**
     * @dev Retourne tous les IDs des candidats
     * @return Tableau des IDs des candidats
     */
    function getAllCandidateIds() external view returns (uint256[] memory) {
        return candidateIds;
    }
}

