// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title VoteNFT
 * @dev NFT représentant un vote. Chaque votant ne peut recevoir qu'un seul NFT.
 */
contract VoteNFT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIdCounter;
    mapping(address => bool) private _hasVoted;
    
    error AlreadyVoted(address voter);
    error NotMinter();
    
    /**
     * @dev Constructeur du contrat VoteNFT
     * @param name Nom du NFT
     * @param symbol Symbole du NFT
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Définit le contrat de vote comme minter
     * @param votingSystem Adresse du contrat de vote qui aura le rôle MINTER
     * @notice Accessible uniquement par les ADMIN
     */
    function setVotingSystem(address votingSystem) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, votingSystem);
    }
    
    /**
     * @dev Mint un NFT de vote à un votant
     * @param voter Adresse du votant qui recevra le NFT
     * @notice Peut être appelé uniquement par le contrat de vote
     */
    function mint(address voter) external onlyRole(MINTER_ROLE) {
        if (_hasVoted[voter]) {
            revert AlreadyVoted(voter);
        }
        
        _hasVoted[voter] = true;
        _tokenIdCounter++;
        _safeMint(voter, _tokenIdCounter);
    }
    
    /**
     * @dev Vérifie si un votant a déjà voté
     * @param voter Adresse du votant à vérifier
     * @return true si le votant a déjà voté, false sinon
     */
    function hasVoted(address voter) external view returns (bool) {
        return _hasVoted[voter];
    }
    
    /**
     * @dev Retourne le tokenURI pour un token donné
     * @param tokenId ID du token
     * @return URI du token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return "https://example.com/vote-nft.json";
    }
    
    /**
     * @dev Supporte l'interface ERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

