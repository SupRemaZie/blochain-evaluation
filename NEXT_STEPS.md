# Prochaines Étapes - Système de Vote

## ✅ Déploiement Réussi

Les contrats sont maintenant déployés sur Sepolia :

- **VoteNFT** : `0xdb9fcDD0006f1EafDC54d289d4593175F23dDbbd`
- **VotingSystem** : `0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb`
- **Admin** : `0xD1EAFbE4d8145e1eab93002933a0F40aC674C5a0`

## 🚀 Utilisation du Système

### 1. Attribuer le rôle FOUNDER

```bash
# Calculer le hash du rôle FOUNDER_ROLE
FOUNDER_ROLE=$(cast keccak "FOUNDER_ROLE")

# Attribuer le rôle à une adresse
cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "grantRole(bytes32,address)" \
  $FOUNDER_ROLE \
  0xVOTRE_ADRESSE_FOUNDER \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY
```

### 2. Enregistrer des Candidats

```bash
# Enregistrer un candidat (doit être ADMIN)
cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "registerCandidate(string)" \
  "Alice" \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY

cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "registerCandidate(string)" \
  "Bob" \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY
```

### 3. Passer à la Phase de Financement

```bash
# Calculer l'enum FOUND_CANDIDATES (valeur = 1)
cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "setWorkflowStatus(uint8)" \
  1 \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY
```

### 4. Financer un Candidat

```bash
# Financer le candidat 1 avec 1 ETH (doit être FOUNDER)
cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "fundCandidate(uint256)" \
  1 \
  --value 1ether \
  --rpc-url sepolia \
  --private-key $FOUNDER_PRIVATE_KEY
```

### 5. Activer la Phase de Vote

```bash
# Passer à la phase VOTE (valeur = 2)
cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "setWorkflowStatus(uint8)" \
  2 \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY
```

**Important** : Attendre 1 heure avant de pouvoir voter.

### 6. Voter

```bash
# Voter pour le candidat 1 (après 1 heure)
cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "vote(uint256)" \
  1 \
  --rpc-url sepolia \
  --private-key $VOTER_PRIVATE_KEY
```

### 7. Terminer le Vote et Déterminer le Vainqueur

```bash
# Passer à COMPLETED (valeur = 3)
cast send 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "setWorkflowStatus(uint8)" \
  3 \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY

# Déterminer le vainqueur
cast call 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "determineWinner()" \
  --rpc-url sepolia
```

## 📊 Vérification des États

### Vérifier le statut du workflow

```bash
cast call 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "workflowStatus()" \
  --rpc-url sepolia
```

### Vérifier un candidat

```bash
cast call 0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb \
  "getCandidate(uint256)" \
  1 \
  --rpc-url sepolia
```

### Vérifier si un votant a voté

```bash
cast call 0xdb9fcDD0006f1EafDC54d289d4593175F23dDbbd \
  "hasVoted(address)" \
  0xADRESSE_VOTANT \
  --rpc-url sepolia
```

## 🔗 Liens Utiles

- **VoteNFT sur Etherscan** : https://sepolia.etherscan.io/address/0xdb9fcDD0006f1EafDC54d289d4593175F23dDbbd
- **VotingSystem sur Etherscan** : https://sepolia.etherscan.io/address/0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb

## ⚠️ Notes Importantes

1. Le déploiement a coûté environ **0.021 ETH** en gas
2. La vérification Etherscan a échoué (problème d'API key), mais les contrats sont fonctionnels
3. Pour vérifier manuellement, allez sur Etherscan et utilisez l'option "Verify and Publish"
4. Assurez-vous d'avoir suffisamment d'ETH pour toutes les transactions

