// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {VotingSystem} from "../src/VotingSystem.sol";
import {VoteNFT} from "../src/VoteNFT.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract VotingSystemTest is Test {
    VotingSystem public votingSystem;
    VoteNFT public voteNFT;
    
    address public admin = address(0x1);
    address public founder = address(0x2);
    address public voter1 = address(0x3);
    address public voter2 = address(0x4);
    address public voter3 = address(0x5);
    address public unauthorized = address(0x6);
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FOUNDER_ROLE = keccak256("FOUNDER_ROLE");
    
    event CandidateRegistered(uint256 indexed candidateId, string name);
    event WorkflowStatusChanged(
        VotingSystem.WorkflowStatus oldStatus,
        VotingSystem.WorkflowStatus newStatus
    );
    event CandidateFunded(uint256 indexed candidateId, address indexed founder, uint256 amount);
    event Voted(address indexed voter, uint256 indexed candidateId);
    event WinnerDetermined(uint256 indexed candidateId, string name, uint256 voteCount);
    
    function setUp() public {
        // Distribuer de l'ETH aux comptes
        vm.deal(admin, 100 ether);
        vm.deal(founder, 100 ether);
        vm.deal(voter1, 10 ether);
        vm.deal(voter2, 10 ether);
        vm.deal(voter3, 10 ether);
        
        // Déployer VoteNFT
        vm.prank(admin);
        voteNFT = new VoteNFT("Vote NFT", "VOTE");
        
        // Déployer VotingSystem
        vm.prank(admin);
        votingSystem = new VotingSystem(address(voteNFT));
        
        // Configurer le minter dans VoteNFT
        vm.prank(admin);
        voteNFT.setVotingSystem(address(votingSystem));
        
        // Attribuer le rôle FOUNDER
        vm.prank(admin);
        votingSystem.grantRole(FOUNDER_ROLE, founder);
    }
    
    // ============ Tests de Déploiement ============
    
    function test_Deployment() public {
        assertEq(address(votingSystem.voteNFT()), address(voteNFT));
        assertTrue(votingSystem.hasRole(ADMIN_ROLE, admin));
        assertTrue(votingSystem.hasRole(0x00, admin)); // DEFAULT_ADMIN_ROLE = 0x00
        assertEq(
            uint256(votingSystem.workflowStatus()),
            uint256(VotingSystem.WorkflowStatus.REGISTER_CANDIDATES)
        );
    }
    
    // ============ Tests de Rôles ============
    
    function test_AdminCanGrantFounderRole() public {
        vm.prank(admin);
        votingSystem.grantRole(FOUNDER_ROLE, unauthorized);
        assertTrue(votingSystem.hasRole(FOUNDER_ROLE, unauthorized));
    }
    
    function test_UnauthorizedCannotGrantRole() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        votingSystem.grantRole(FOUNDER_ROLE, unauthorized);
    }
    
    // ============ Tests d'Enregistrement des Candidats ============
    
    function test_RegisterCandidate() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        VotingSystem.Candidate memory candidate = votingSystem.getCandidate(1);
        assertEq(candidate.id, 1);
        assertEq(candidate.name, "Alice");
        assertEq(candidate.amountReceived, 0);
        assertEq(candidate.voteCount, 0);
        assertEq(votingSystem.getCandidateCount(), 1);
    }
    
    function test_RegisterMultipleCandidates() public {
        vm.startPrank(admin);
        votingSystem.registerCandidate("Alice");
        votingSystem.registerCandidate("Bob");
        votingSystem.registerCandidate("Charlie");
        vm.stopPrank();
        
        assertEq(votingSystem.getCandidateCount(), 3);
        
        VotingSystem.Candidate memory alice = votingSystem.getCandidate(1);
        VotingSystem.Candidate memory bob = votingSystem.getCandidate(2);
        VotingSystem.Candidate memory charlie = votingSystem.getCandidate(3);
        
        assertEq(alice.name, "Alice");
        assertEq(bob.name, "Bob");
        assertEq(charlie.name, "Charlie");
    }
    
    function test_RegisterCandidateEmitEvent() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, false);
        emit CandidateRegistered(1, "Alice");
        votingSystem.registerCandidate("Alice");
    }
    
    function test_NonAdminCannotRegisterCandidate() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        votingSystem.registerCandidate("Alice");
    }
    
    function test_CannotRegisterCandidateInWrongPhase() public {
        // Passer à la phase FOUND_CANDIDATES
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        // Essayer d'enregistrer un candidat
        vm.prank(admin);
        vm.expectRevert();
        votingSystem.registerCandidate("Alice");
    }
    
    // ============ Tests de Workflow ============
    
    function test_SetWorkflowStatus() public {
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        assertEq(
            uint256(votingSystem.workflowStatus()),
            uint256(VotingSystem.WorkflowStatus.FOUND_CANDIDATES)
        );
    }
    
    function test_SetWorkflowStatusEmitEvent() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit WorkflowStatusChanged(
            VotingSystem.WorkflowStatus.REGISTER_CANDIDATES,
            VotingSystem.WorkflowStatus.FOUND_CANDIDATES
        );
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
    }
    
    function test_WorkflowStatusRecordsVoteStartTime() public {
        uint256 startTime = block.timestamp;
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        assertEq(votingSystem.voteStartTime(), startTime);
    }
    
    function test_NonAdminCannotSetWorkflowStatus() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
    }
    
    // ============ Tests de Financement ============
    
    function test_FundCandidate() public {
        // Enregistrer un candidat
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        // Passer à la phase FOUND_CANDIDATES
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        // Financer le candidat
        vm.prank(founder);
        votingSystem.fundCandidate{value: 5 ether}(1);
        
        VotingSystem.Candidate memory candidate = votingSystem.getCandidate(1);
        assertEq(candidate.amountReceived, 5 ether);
    }
    
    function test_FundCandidateMultipleTimes() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        vm.startPrank(founder);
        votingSystem.fundCandidate{value: 2 ether}(1);
        votingSystem.fundCandidate{value: 3 ether}(1);
        votingSystem.fundCandidate{value: 1 ether}(1);
        vm.stopPrank();
        
        VotingSystem.Candidate memory candidate = votingSystem.getCandidate(1);
        assertEq(candidate.amountReceived, 6 ether);
    }
    
    function test_FundCandidateEmitEvent() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        vm.prank(founder);
        vm.expectEmit(true, true, false, false);
        emit CandidateFunded(1, founder, 5 ether);
        votingSystem.fundCandidate{value: 5 ether}(1);
    }
    
    function test_NonFounderCannotFund() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        // Vérifier que unauthorized n'a pas le rôle FOUNDER
        assertFalse(votingSystem.hasRole(FOUNDER_ROLE, unauthorized));
        
        // unauthorized ne peut pas financer
        vm.prank(unauthorized);
        vm.expectRevert();
        (bool success, ) = address(votingSystem).call{value: 5 ether}(
            abi.encodeWithSignature("fundCandidate(uint256)", 1)
        );
        assertFalse(success);
        
        // Vérifier que le candidat n'a pas été financé
        assertEq(votingSystem.getCandidate(1).amountReceived, 0);
    }
    
    function test_CannotFundInWrongPhase() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        // Rester en phase REGISTER_CANDIDATES
        vm.prank(founder);
        vm.expectRevert();
        votingSystem.fundCandidate{value: 5 ether}(1);
    }
    
    function test_CannotFundNonExistentCandidate() public {
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        vm.prank(founder);
        vm.expectRevert();
        votingSystem.fundCandidate{value: 5 ether}(999);
    }
    
    // ============ Tests de Vote ============
    
    function test_Vote() public {
        // Setup
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        // Avancer le temps de 1 heure
        vm.warp(block.timestamp + 3601);
        
        // Voter
        vm.prank(voter1);
        votingSystem.vote(1);
        
        VotingSystem.Candidate memory candidate = votingSystem.getCandidate(1);
        assertEq(candidate.voteCount, 1);
        assertTrue(voteNFT.hasVoted(voter1));
    }
    
    function test_VoteEmitEvent() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        vm.expectEmit(true, true, false, false);
        emit Voted(voter1, 1);
        votingSystem.vote(1);
    }
    
    function test_MultipleVotes() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        vm.prank(admin);
        votingSystem.registerCandidate("Bob");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        votingSystem.vote(1);
        
        vm.prank(voter2);
        votingSystem.vote(1);
        
        vm.prank(voter3);
        votingSystem.vote(2);
        
        assertEq(votingSystem.getCandidate(1).voteCount, 2);
        assertEq(votingSystem.getCandidate(2).voteCount, 1);
    }
    
    function test_CannotVoteBeforeOneHour() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        // Essayer de voter immédiatement
        vm.prank(voter1);
        vm.expectRevert();
        votingSystem.vote(1);
    }
    
    function test_CanVoteAfterOneHour() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        uint256 voteStartTime = votingSystem.voteStartTime();
        
        // Avancer de 3599 secondes (moins d'1 heure)
        vm.warp(voteStartTime + 3599);
        
        // Moins d'1 heure ne suffit pas
        vm.prank(voter1);
        vm.expectRevert();
        votingSystem.vote(1);
        
        // Avancer à exactement 1 heure (3600 secondes)
        // La condition est block.timestamp < voteStartTime + ONE_HOUR
        // Donc à 3600, block.timestamp n'est pas < voteStartTime + 3600, donc ça fonctionne
        vm.warp(voteStartTime + 3600);
        
        // Maintenant ça devrait fonctionner
        vm.prank(voter1);
        votingSystem.vote(1);
        
        assertEq(votingSystem.getCandidate(1).voteCount, 1);
    }
    
    function test_CannotVoteTwice() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        votingSystem.vote(1);
        
        // Essayer de voter une deuxième fois
        vm.prank(voter1);
        vm.expectRevert();
        votingSystem.vote(1);
    }
    
    function test_CannotVoteInWrongPhase() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        // Rester en phase REGISTER_CANDIDATES
        vm.prank(voter1);
        vm.expectRevert();
        votingSystem.vote(1);
    }
    
    function test_CannotVoteForNonExistentCandidate() public {
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        vm.expectRevert();
        votingSystem.vote(999);
    }
    
    function test_VoteMintsNFT() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        votingSystem.vote(1);
        
        assertEq(voteNFT.balanceOf(voter1), 1);
        assertTrue(voteNFT.hasVoted(voter1));
    }
    
    // ============ Tests de Détermination du Vainqueur ============
    
    function test_DetermineWinner() public {
        // Setup
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        vm.prank(admin);
        votingSystem.registerCandidate("Bob");
        vm.prank(admin);
        votingSystem.registerCandidate("Charlie");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        // Votes : Alice = 2, Bob = 1, Charlie = 0
        vm.prank(voter1);
        votingSystem.vote(1);
        vm.prank(voter2);
        votingSystem.vote(1);
        vm.prank(voter3);
        votingSystem.vote(2);
        
        // Passer à COMPLETED
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.COMPLETED);
        
        // Déterminer le vainqueur
        (uint256 winnerId, string memory winnerName) = votingSystem.determineWinner();
        
        assertEq(winnerId, 1);
        assertEq(winnerName, "Alice");
    }
    
    function test_DetermineWinnerEmitEvent() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        votingSystem.vote(1);
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.COMPLETED);
        
        vm.expectEmit(true, false, false, false);
        emit WinnerDetermined(1, "Alice", 1);
        votingSystem.determineWinner();
    }
    
    function test_CannotDetermineWinnerInWrongPhase() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.expectRevert();
        votingSystem.determineWinner();
    }
    
    function test_DetermineWinnerWithTie() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        vm.prank(admin);
        votingSystem.registerCandidate("Bob");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        votingSystem.vote(1);
        vm.prank(voter2);
        votingSystem.vote(2);
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.COMPLETED);
        
        // En cas d'égalité, le premier candidat avec le max de votes gagne
        (uint256 winnerId, ) = votingSystem.determineWinner();
        assertTrue(winnerId == 1 || winnerId == 2);
    }
    
    function test_CannotDetermineWinnerWithNoCandidates() public {
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.COMPLETED);
        
        vm.expectRevert();
        votingSystem.determineWinner();
    }
    
    function test_CannotDetermineWinnerWithNoVotes() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.COMPLETED);
        
        vm.expectRevert();
        votingSystem.determineWinner();
    }
    
    // ============ Tests de Sécurité et Cas Limites ============
    
    function test_GetAllCandidateIds() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        vm.prank(admin);
        votingSystem.registerCandidate("Bob");
        vm.prank(admin);
        votingSystem.registerCandidate("Charlie");
        
        uint256[] memory ids = votingSystem.getAllCandidateIds();
        assertEq(ids.length, 3);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
        assertEq(ids[2], 3);
    }
    
    function test_GetCandidate() public {
        vm.prank(admin);
        votingSystem.registerCandidate("Alice");
        
        VotingSystem.Candidate memory candidate = votingSystem.getCandidate(1);
        assertEq(candidate.id, 1);
        assertEq(candidate.name, "Alice");
        assertEq(candidate.amountReceived, 0);
        assertEq(candidate.voteCount, 0);
    }
    
    function test_WorkflowCompleteFlow() public {
        // 1. Enregistrer les candidats
        vm.startPrank(admin);
        votingSystem.registerCandidate("Alice");
        votingSystem.registerCandidate("Bob");
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.FOUND_CANDIDATES);
        vm.stopPrank();
        
        // 2. Financer les candidats
        vm.startPrank(founder);
        votingSystem.fundCandidate{value: 10 ether}(1);
        votingSystem.fundCandidate{value: 5 ether}(2);
        vm.stopPrank();
        
        // 3. Passer à la phase de vote
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.VOTE);
        
        // 4. Attendre 1 heure et voter
        vm.warp(block.timestamp + 3601);
        
        vm.prank(voter1);
        votingSystem.vote(1);
        vm.prank(voter2);
        votingSystem.vote(1);
        vm.prank(voter3);
        votingSystem.vote(2);
        
        // 5. Terminer le vote
        vm.prank(admin);
        votingSystem.setWorkflowStatus(VotingSystem.WorkflowStatus.COMPLETED);
        
        // 6. Déterminer le vainqueur
        (uint256 winnerId, string memory winnerName) = votingSystem.determineWinner();
        
        assertEq(winnerId, 1);
        assertEq(winnerName, "Alice");
        assertEq(votingSystem.getCandidate(1).voteCount, 2);
        assertEq(votingSystem.getCandidate(2).voteCount, 1);
    }
}

