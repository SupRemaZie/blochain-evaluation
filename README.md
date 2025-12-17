# Système de Vote Blockchain avec Foundry

Un système de vote complet et sécurisé implémenté en Solidity avec Foundry, utilisant des NFTs pour garantir l'unicité des votes.

## 🚀 Démarrage Rapide

### Prérequis

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- MetaMask installé dans votre navigateur
- ETH Sepolia pour les transactions (obtenez-en sur un [faucet Sepolia](https://sepoliafaucet.com/))

### Installation

```bash
# Installer les dépendances
forge install OpenZeppelin/openzeppelin-contracts
```

### Configuration

Créez un fichier `.env` à la racine du projet :

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## 🌐 Lancer l'Interface Web

```bash
cd frontend
python3 -m http.server 8000
```

Puis ouvrez votre navigateur à l'adresse : `http://localhost:8000`

## 🧪 Tests

```bash
# Exécuter tous les tests
forge test

# Tests avec verbosité élevée
forge test -vvv
```

## 📦 Compilation

```bash
forge build
```

## 🚢 Déploiement sur Sepolia

```bash
# Déploiement
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast

# Déploiement avec vérification
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast --verify
```


## 🔗 Contrats Déployés sur Sepolia

- **VoteNFT** : `0x16e480d56DA571A689141C043e132AFDD1028ad6`
- **VotingSystem** : `0x338158D4663775b98952Ce4E159E83025cF60693`

[Voir sur Etherscan](https://sepolia.etherscan.io/address/0x338158D4663775b98952Ce4E159E83025cF60693)

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
│   └── styles.css           # Styles CSS
└── foundry.toml              # Configuration Foundry
```

## 🔒 Rôles et Permissions

- **ADMIN_ROLE** : Enregistrer des candidats, changer le workflow, attribuer des rôles
- **FOUNDER_ROLE** : Financer des candidats
- **VOTANT** (par défaut) : Voter pour un candidat

## 📖 Workflow

1. **REGISTER_CANDIDATES** : Enregistrement des candidats (ADMIN)
2. **FOUND_CANDIDATES** : Financement des candidats (FOUNDER)
3. **VOTE** : Phase de vote (délai de 20 secondes après activation)
4. **COMPLETED** : Détermination du vainqueur (ADMIN)

**Note** : Ce projet est à des fins éducatives.
