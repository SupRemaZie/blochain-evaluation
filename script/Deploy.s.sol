// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {VoteNFT} from "../src/VoteNFT.sol";
import {VotingSystem} from "../src/VotingSystem.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "ETH");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Déployer VoteNFT
        console.log("\n=== Deploying VoteNFT ===");
        VoteNFT voteNFT = new VoteNFT("Vote NFT", "VOTE");
        console.log("VoteNFT deployed at:", address(voteNFT));
        
        // Déployer VotingSystem
        console.log("\n=== Deploying VotingSystem ===");
        VotingSystem votingSystem = new VotingSystem(address(voteNFT));
        console.log("VotingSystem deployed at:", address(votingSystem));
        
        // Configurer le minter dans VoteNFT
        console.log("\n=== Configuring VoteNFT minter ===");
        voteNFT.setVotingSystem(address(votingSystem));
        console.log("VoteNFT minter set to:", address(votingSystem));
        
        // Le déployeur est automatiquement ADMIN
        console.log("\n=== Configuration Summary ===");
        console.log("Deployer (ADMIN):", deployer);
        console.log("VoteNFT address:", address(voteNFT));
        console.log("VotingSystem address:", address(votingSystem));
        console.log("\nNext steps:");
        console.log("1. Grant FOUNDER_ROLE to founders using:");
        console.log("   votingSystem.grantRole(FOUNDER_ROLE, founderAddress)");
        console.log("2. Register candidates using:");
        console.log("   votingSystem.registerCandidate('Candidate Name')");
        console.log("3. Set workflow status using:");
        console.log("   votingSystem.setWorkflowStatus(WorkflowStatus.FOUND_CANDIDATES)");
        
        vm.stopBroadcast();
    }
}

