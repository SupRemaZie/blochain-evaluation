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

- **Gestion des rôles** : Système de rôles basé sur OpenZeppelin AccessControl (ADMIN, FOUNDER, VOTANT)
- **Workflow structuré** : 4 phases distinctes (REGISTER_CANDIDATES, FOUND_CANDIDATES, VOTE, COMPLETED)
- **Financement des candidats** : Les founders peuvent financer les candidats pendant la phase FOUND_CANDIDATES
- **Système de vote sécurisé** : Utilisation de NFTs pour prévenir le double vote
- **Délai de vote** : Les votes ne peuvent commencer qu'20 secondes après l'activation de la phase VOTE (configurable pour les tests)
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
- ✅ Restriction temporelle (20 secondes pour les tests)
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

## 🌐 Guide d'Utilisation de l'Interface Web

Cette section explique comment utiliser l'interface web pour gérer le système de vote de bout en bout.

### Prérequis

1. **MetaMask installé** : Assurez-vous d'avoir l'extension MetaMask installée dans votre navigateur
2. **Réseau Sepolia** : Configurez MetaMask pour utiliser le réseau de test Sepolia
3. **ETH Sepolia** : Ayez suffisamment d'ETH Sepolia pour payer les frais de transaction (obtenez-en sur un [faucet Sepolia](https://sepoliafaucet.com/))
4. **Adresses des contrats** : Mettez à jour `frontend/config.js` avec les adresses des contrats déployés

### Accès à l'Interface

1. Ouvrez le fichier `frontend/index.html` dans votre navigateur
   - Vous pouvez utiliser un serveur local (ex: `python -m http.server 8000` dans le dossier `frontend/`)
   - Ou ouvrez directement le fichier HTML

### Étape 1 : Connexion MetaMask

1. **Cliquez sur "Connecter MetaMask"**
   - Une popup MetaMask s'ouvrira
   - Sélectionnez le compte que vous souhaitez utiliser
   - Approuvez la connexion

2. **Vérification de la connexion**
   - Votre adresse s'affiche dans la section "Connexion Wallet"
   - Le solde ETH est affiché
   - Les rôles attribués à votre compte sont indiqués

3. **Changer de compte** (optionnel)
   - Cliquez sur "Changer de compte" pour sélectionner un autre compte MetaMask

### Étape 2 : Configuration Initiale (ADMIN uniquement)

Si vous êtes le déployeur (ADMIN), vous devez configurer le système :

#### 2.1 Attribuer le rôle FOUNDER

1. Dans la section "Administration", trouvez "Attribuer le rôle FOUNDER"
2. Entrez l'adresse du compte qui doit recevoir le rôle FOUNDER
3. Cliquez sur "Attribuer"
4. Confirmez la transaction dans MetaMask
5. Attendez la confirmation (un lien Etherscan s'affichera)

#### 2.2 Enregistrer les candidats

1. Assurez-vous que le workflow est en phase **REGISTER_CANDIDATES** (vérifiez dans "Statut du Workflow")
2. Dans la section "Administration", trouvez "Enregistrer un Candidat"
3. Entrez le nom du candidat (ex: "Alice", "Bob")
4. Cliquez sur "Enregistrer"
5. Confirmez la transaction dans MetaMask
6. Répétez pour chaque candidat
7. Les candidats apparaîtront dans la section "Candidats"

### Étape 3 : Phase de Financement (FOUNDER uniquement)

#### 3.1 Passer à la phase FOUND_CANDIDATES

1. **En tant qu'ADMIN**, dans la section "Administration"
2. Sélectionnez "FOUND_CANDIDATES" dans le menu déroulant "Changer le Statut du Workflow"
3. Cliquez sur "Changer"
4. Confirmez la transaction dans MetaMask

#### 3.2 Financer un candidat

1. **En tant que FOUNDER**, la section "Financement" devient visible
2. Sélectionnez un candidat dans le menu déroulant
3. Entrez le montant en ETH à envoyer (ex: 0.1, 0.5, 1.0)
4. Cliquez sur "Financer"
5. Confirmez la transaction dans MetaMask
6. Le financement sera visible dans les informations du candidat

**Note** : Vous pouvez financer plusieurs candidats ou le même candidat plusieurs fois.

### Étape 4 : Phase de Vote

#### 4.1 Activer la phase VOTE

1. **En tant qu'ADMIN**, dans la section "Administration"
2. Sélectionnez "VOTE" dans le menu déroulant "Changer le Statut du Workflow"
3. Cliquez sur "Changer"
4. Confirmez la transaction dans MetaMask
5. **Important** : Un timer de 20 secondes démarre. Les votes ne seront possibles qu'après ce délai.

#### 4.2 Voter pour un candidat

1. **Attendez 20 secondes** après l'activation de la phase VOTE
   - Un compte à rebours s'affiche dans "Statut du Workflow"
   - Le message "Temps avant vote" indique le temps restant

2. Une fois le délai écoulé, la section "Vote" devient visible

3. Cliquez sur le bouton "Voter pour [Nom du candidat]" du candidat de votre choix

4. Confirmez la transaction dans MetaMask

5. **Important** : 
   - Vous ne pouvez voter qu'une seule fois
   - Un NFT de vote vous sera automatiquement attribué
   - Le message "✅ Vous avez déjà voté !" s'affichera après votre vote

6. Les résultats sont mis à jour en temps réel dans la section "Candidats"

### Étape 5 : Détermination du Vainqueur

#### 5.1 Terminer la phase de vote

1. **En tant qu'ADMIN**, dans la section "Administration"
2. Sélectionnez "COMPLETED" dans le menu déroulant "Changer le Statut du Workflow"
3. Cliquez sur "Changer"
4. Confirmez la transaction dans MetaMask

#### 5.2 Déterminer le vainqueur

1. La section "Vainqueur" devient visible
2. Cliquez sur "Déterminer le Vainqueur"
3. Confirmez la transaction dans MetaMask
4. Le vainqueur s'affiche avec :
   - Son ID
   - Son nom
   - Son nombre de votes

### Fonctionnalités Supplémentaires

#### Actualiser les données

- Cliquez sur "Actualiser" dans la section "Statut du Workflow" pour recharger toutes les données
- Les informations sont également mises à jour automatiquement après chaque transaction

#### Vérifier le statut de vote

- La section "Vote" affiche automatiquement si vous avez déjà voté
- Si vous avez voté, le message "✅ Vous avez déjà voté !" s'affiche

#### Suivre les transactions

- Après chaque transaction, un lien Etherscan s'affiche pour suivre la transaction sur le blockchain
- Cliquez sur le lien pour voir les détails sur Etherscan

### Dépannage

#### "Vous devez être ADMIN pour..."
- Vérifiez que vous êtes connecté avec le compte déployeur (ADMIN)
- Vérifiez que le rôle ADMIN est bien attribué à votre compte

#### "Le vote n'est pas encore ouvert"
- Vérifiez que la phase VOTE est activée
- Attendez 20 secondes après l'activation de la phase VOTE
- Le timer affiche le temps restant

#### "Vous avez déjà voté !"
- Chaque adresse ne peut voter qu'une seule fois
- Un NFT de vote a été créé pour votre adresse
- Utilisez un autre compte MetaMask pour voter à nouveau

#### Les candidats n'apparaissent pas
- Vérifiez que vous êtes en phase REGISTER_CANDIDATES pour enregistrer
- Cliquez sur "Actualiser" pour recharger les données
- Vérifiez que les adresses des contrats dans `config.js` sont correctes

#### Erreur de connexion MetaMask
- Vérifiez que MetaMask est installé et activé
- Vérifiez que vous êtes sur le réseau Sepolia
- Rafraîchissez la page et réessayez

## 🔗 Adresses des Contrats Déployés sur Sepolia

### VoteNFT
- **Adresse** : `0x16e480d56DA571A689141C043e132AFDD1028ad6`
- **Etherscan** : [Voir sur Etherscan](https://sepolia.etherscan.io/address/0x16e480d56DA571A689141C043e132AFDD1028ad6)
- **Transaction de déploiement** : [Voir transaction](https://sepolia.etherscan.io/tx/0xfbccc7a61cfdb506ff7d11a91126fa42fce4bb2697c8cf26c26e75b8fe7d90d4)

### VotingSystem
- **Adresse** : `0x338158D4663775b98952Ce4E159E83025cF60693`
- **Etherscan** : [Voir sur Etherscan](https://sepolia.etherscan.io/address/0x338158D4663775b98952Ce4E159E83025cF60693)
- **Transaction de déploiement** : [Voir transaction](https://sepolia.etherscan.io/tx/0x469f3f323c95cf437242d6268f39817a76dc5fa1aa5c6b08578a4f1418727213)
- **⚠️ Nouvelle version avec délai de vote de 20 secondes** (au lieu de 1 heure)

### Déployeur (ADMIN)
- **Adresse** : `0xD1EAFbE4d8145e1eab93002933a0F40aC674C5a0`
- **Transaction de configuration** : [Voir transaction](https://sepolia.etherscan.io/tx/0xc650f8ec962126dde151f973b5a73d22129bdc428d64000bf587a4227c715843)

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



**Note** : Ce projet est à des fins éducatives.
