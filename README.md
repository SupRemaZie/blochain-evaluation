# Système de Vote Blockchain avec Foundry

Un système de vote complet et sécurisé implémenté en Solidity avec Foundry, utilisant des NFTs pour garantir l'unicité des votes.

## 📋 Description du Projet

Ce projet implémente un système de vote décentralisé avec les fonctionnalités suivantes :

### 🌐 Interface Web Incluse

Une interface web moderne et intuitive est disponible dans le dossier `frontend/` pour interagir facilement avec le système :
- Connexion MetaMask
- Visualisation des candidats en temps réel
- Actions selon les rôles (ADMIN, FOUNDER, VOTANT)
- Design moderne et responsive

**Voir [frontend/README.md](frontend/README.md) pour plus d'informations.**

- **Gestion des rôles** : Système de rôles basé sur OpenZeppelin AccessControl (ADMIN, FOUNDER, VOTANT)
- **Workflow structuré** : 4 phases distinctes (REGISTER_CANDIDATES, FOUND_CANDIDATES, VOTE, COMPLETED)
- **Financement des candidats** : Les founders peuvent financer les candidats pendant la phase FOUND_CANDIDATES
- **Système de vote sécurisé** : Utilisation de NFTs pour prévenir le double vote
- **Délai de vote** : Les votes ne peuvent commencer qu'1 heure après l'activation de la phase VOTE
- **Détermination du vainqueur** : Fonction automatique pour identifier le candidat avec le plus de votes

## 🏗️ Architecture des Contrats

### VoteNFT.sol

Contrat ERC721 représentant un vote. Chaque votant reçoit un NFT unique après avoir voté.

**Fonctionnalités principales :**
- Mint de NFT uniquement par le contrat VotingSystem
- Vérification si un votant a déjà voté (`hasVoted`)
- Un seul NFT par adresse

### VotingSystem.sol

Contrat principal gérant tout le processus de vote.

**Fonctionnalités principales :**
- Enregistrement des candidats (ADMIN uniquement)
- Gestion du workflow (ADMIN uniquement)
- Financement des candidats (FOUNDER uniquement)
- Vote avec vérifications de sécurité
- Détermination du vainqueur

## 🚀 Installation

### Prérequis

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js (optionnel, pour les outils supplémentaires)

### Installation des dépendances

```bash
# Installer OpenZeppelin Contracts (déjà fait si vous avez cloné le repo)
forge install OpenZeppelin/openzeppelin-contracts
```

### Configuration

Créez un fichier `.env` à la racine du projet :

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## 🧪 Tests

Exécuter tous les tests :

```bash
forge test
```

Exécuter les tests avec une verbosité élevée :

```bash
forge test -vvv
```

Exécuter un test spécifique :

```bash
forge test --match-test test_Vote -vvv
```

### Couverture des Tests

Les tests couvrent :
- ✅ Déploiement et initialisation
- ✅ Attribution des rôles
- ✅ Enregistrement des candidats (succès et échecs)
- ✅ Transitions de workflow
- ✅ Financement des candidats
- ✅ Processus de vote complet
- ✅ Restriction temporelle (1 heure)
- ✅ Prévention du double vote via NFT
- ✅ Détermination du vainqueur
- ✅ Tests de sécurité et cas limites

## 📦 Compilation

```bash
forge build
```

## 🚢 Déploiement sur Sepolia

### Préparation

1. Assurez-vous d'avoir configuré votre fichier `.env`
2. Vérifiez que vous avez suffisamment d'ETH sur Sepolia pour le déploiement

### Déploiement

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast --verify
```

### Commandes de déploiement détaillées

```bash
# Déploiement sans vérification
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast

# Déploiement avec vérification (nécessite ETHERSCAN_API_KEY)
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast --verify

# Simulation du déploiement (sans broadcast)
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia
```

## 📝 Utilisation du Système

### 1. Déploiement

Après le déploiement, notez les adresses des contrats :
- `VoteNFT` : Adresse du contrat NFT
- `VotingSystem` : Adresse du contrat principal

### 2. Configuration Initiale

#### Attribuer le rôle FOUNDER

```solidity
// Via cast ou interface
votingSystem.grantRole(FOUNDER_ROLE, founderAddress)
```

#### Enregistrer les candidats

```solidity
votingSystem.registerCandidate("Alice")
votingSystem.registerCandidate("Bob")
votingSystem.registerCandidate("Charlie")
```

### 3. Phase de Financement

#### Passer à la phase FOUND_CANDIDATES

```solidity
votingSystem.setWorkflowStatus(WorkflowStatus.FOUND_CANDIDATES)
```

#### Financer un candidat

```solidity
votingSystem.fundCandidate{value: 5 ether}(candidateId)
```

### 4. Phase de Vote

#### Activer la phase de vote

```solidity
votingSystem.setWorkflowStatus(WorkflowStatus.VOTE)
```

**Important** : Les votes ne peuvent commencer qu'1 heure après l'activation de cette phase.

#### Voter

```solidity
votingSystem.vote(candidateId)
```

### 5. Détermination du Vainqueur

#### Terminer le vote

```solidity
votingSystem.setWorkflowStatus(WorkflowStatus.COMPLETED)
```

#### Déterminer le vainqueur

```solidity
(uint256 winnerId, string memory winnerName) = votingSystem.determineWinner()
```

## 🔗 Adresses des Contrats Déployés sur Sepolia

### VoteNFT
- **Adresse** : `0xdb9fcDD0006f1EafDC54d289d4593175F23dDbbd`
- **Etherscan** : [Voir sur Etherscan](https://sepolia.etherscan.io/address/0xdb9fcDD0006f1EafDC54d289d4593175F23dDbbd)
- **Transaction de déploiement** : [Voir transaction](https://sepolia.etherscan.io/tx/0x969479a3efcefd5efbb106a7c626a1e3aa49c9d8b0b08471440093485be6c28a)

### VotingSystem
- **Adresse** : `0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb`
- **Etherscan** : [Voir sur Etherscan](https://sepolia.etherscan.io/address/0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb)
- **Transaction de déploiement** : [Voir transaction](https://sepolia.etherscan.io/tx/0x690bb564a0dadf8c8b6a1506ae9611622e047cd8d86e6572171a350298c69ad8)

### Déployeur (ADMIN)
- **Adresse** : `0xD1EAFbE4d8145e1eab93002933a0F40aC674C5a0`
- **Transaction de configuration** : [Voir transaction](https://sepolia.etherscan.io/tx/0xcb3acd84ef1cc19e99699d9d31a6f763d6e277f02c4fdf8149b3664849dd98c0)

## 📊 Transactions Importantes sur Sepolia

### Déploiement des Contrats ✅
- **VoteNFT** : [Transaction](https://sepolia.etherscan.io/tx/0x969479a3efcefd5efbb106a7c626a1e3aa49c9d8b0b08471440093485be6c28a)
- **VotingSystem** : [Transaction](https://sepolia.etherscan.io/tx/0x690bb564a0dadf8c8b6a1506ae9611622e047cd8d86e6572171a350298c69ad8)
- **Configuration VoteNFT** : [Transaction](https://sepolia.etherscan.io/tx/0xcb3acd84ef1cc19e99699d9d31a6f763d6e277f02c4fdf8149b3664849dd98c0)

### Prochaines Étapes
Les transactions suivantes seront ajoutées au fur et à mesure de l'utilisation :

- **Enregistrement d'un Candidat** : Événement `CandidateRegistered`
- **Financement d'un Candidat** : Événement `CandidateFunded`
- **Vote** : Événement `Voted`
- **Détermination du Vainqueur** : Événement `WinnerDetermined`

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

- ✅ **Custom Errors** : Utilisation d'erreurs personnalisées au lieu de `require` avec strings
- ✅ **Modifiers** : Vérifications de rôles et de phases via modifiers
- ✅ **Checks-Effects-Interactions** : Pattern respecté pour éviter les reentrancy
- ✅ **Access Control** : Système de rôles robuste avec OpenZeppelin
- ✅ **Time Locks** : Délai de 1 heure avant le début des votes
- ✅ **NFT Uniqueness** : Prévention du double vote via NFT
- ✅ **Solidity 0.8.24** : Version moderne avec toutes les fonctionnalités de sécurité

### Rôles et Permissions

- **ADMIN_ROLE** : 
  - Enregistrer des candidats
  - Changer le statut du workflow
  - Attribuer des rôles FOUNDER
  
- **FOUNDER_ROLE** :
  - Financer des candidats
  
- **VOTANT** (par défaut) :
  - Voter pour un candidat

## 📚 Structure du Projet

```
blochain-evaluation/
├── src/
│   ├── VoteNFT.sol          # Contrat NFT pour les votes
│   └── VotingSystem.sol      # Contrat principal de vote
├── test/
│   └── VotingSystem.t.sol    # Tests complets
├── script/
│   └── Deploy.s.sol          # Script de déploiement
├── frontend/                 # Interface web
│   ├── index.html           # Page principale
│   ├── app.js               # Logique JavaScript
│   ├── config.js            # Configuration des contrats
│   ├── styles.css           # Styles CSS
│   ├── README.md            # Documentation frontend
│   └── QUICK_START.md       # Guide de démarrage rapide
├── lib/
│   ├── forge-std/            # Bibliothèque Foundry
│   └── openzeppelin-contracts/ # OpenZeppelin
├── foundry.toml              # Configuration Foundry
└── README.md                 # Ce fichier
```

## 🛠️ Commandes Utiles

```bash
# Formater le code
forge fmt

# Générer un snapshot de gas
forge snapshot

# Vérifier les contrats
forge verify-contract <ADDRESS> <CONTRACT> --chain sepolia --etherscan-api-key $ETHERSCAN_API_KEY

# Lancer Anvil (blockchain locale)
anvil

# Utiliser Cast pour interagir avec les contrats
cast send <CONTRACT_ADDRESS> "functionName()" --rpc-url sepolia --private-key $PRIVATE_KEY
```

## 📖 Documentation des Fonctions

### VotingSystem

#### `registerCandidate(string memory name)`
Enregistre un nouveau candidat. Accessible uniquement par ADMIN en phase REGISTER_CANDIDATES.

#### `setWorkflowStatus(WorkflowStatus newStatus)`
Change le statut du workflow. Accessible uniquement par ADMIN.

#### `fundCandidate(uint256 candidateId)`
Finance un candidat. Accessible uniquement par FOUNDER en phase FOUND_CANDIDATES.

#### `vote(uint256 candidateId)`
Vote pour un candidat. Accessible en phase VOTE, après 1 heure d'activation.

#### `determineWinner()`
Détermine le vainqueur. Accessible uniquement en phase COMPLETED.

### VoteNFT

#### `mint(address voter)`
Mint un NFT de vote. Accessible uniquement par VotingSystem.

#### `hasVoted(address voter)`
Vérifie si un votant a déjà voté.

## 🤝 Contribution

Ce projet est un exemple éducatif. Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

- [Foundry](https://book.getfoundry.sh/) pour le framework de développement
- [OpenZeppelin](https://www.openzeppelin.com/) pour les contrats sécurisés
- La communauté Ethereum pour les ressources et le support

---

**Note** : Ce projet est à des fins éducatives. Assurez-vous de faire auditer vos contrats avant un déploiement en production.
