# 🚀 Démarrage Rapide

## Étape 1 : Préparer MetaMask

1. Installez [MetaMask](https://metamask.io/) si ce n'est pas déjà fait
2. Créez ou importez un compte
3. Ajoutez le réseau Sepolia :
   - Nom : Sepolia
   - RPC URL : https://sepolia.infura.io/v3/YOUR_KEY (ou utilisez un autre provider)
   - Chain ID : 11155111
   - Symbole : ETH
   - Explorer : https://sepolia.etherscan.io

4. Obtenez des ETH Sepolia depuis un faucet :
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia

## Étape 2 : Ouvrir l'Interface

### Option A : Serveur Local (Recommandé)

```bash
cd frontend
python3 -m http.server 8000
```

Puis ouvrez : http://localhost:8000

### Option B : Directement

Ouvrez simplement `index.html` dans votre navigateur (peut avoir des problèmes CORS)

## Étape 3 : Utiliser l'Interface

1. **Connecter le wallet** : Cliquez sur "Connecter MetaMask"
2. **Vérifier les rôles** : Votre rôle s'affichera automatiquement
3. **Commencer** : Utilisez les sections selon vos permissions

## 📋 Checklist pour un Vote Complet

### En tant qu'ADMIN :

- [ ] Connecter le wallet (vous êtes automatiquement ADMIN)
- [ ] Enregistrer des candidats (ex: "Alice", "Bob", "Charlie")
- [ ] Attribuer le rôle FOUNDER à une adresse
- [ ] Passer à la phase FOUND_CANDIDATES
- [ ] Passer à la phase VOTE
- [ ] Attendre 1 heure (ou utiliser `vm.warp()` en test)
- [ ] Passer à la phase COMPLETED
- [ ] Déterminer le vainqueur

### En tant que FOUNDER :

- [ ] Se connecter avec le wallet ayant le rôle FOUNDER
- [ ] Financer des candidats avec de l'ETH

### En tant que VOTANT :

- [ ] Se connecter avec n'importe quel wallet
- [ ] Attendre que la phase VOTE soit active + 1 heure
- [ ] Voter pour un candidat
- [ ] Vérifier que vous avez reçu un NFT de vote

## 🎯 Test Rapide

Pour tester rapidement sans attendre 1 heure, vous pouvez utiliser Foundry :

```bash
# Dans un autre terminal, connectez-vous à Anvil ou Sepolia
# Puis utilisez cast pour manipuler le temps (si sur Anvil)
# Ou attendez simplement 1 heure sur Sepolia
```

## ⚠️ Notes Importantes

- Les transactions coûtent du gas (ETH Sepolia)
- Le vote nécessite 1 heure après l'activation de la phase VOTE
- Chaque votant ne peut voter qu'une seule fois (vérifié via NFT)
- Les rôles sont vérifiés automatiquement

## 🐛 Problèmes Courants

**"User rejected the request"** : Vous avez annulé la transaction dans MetaMask

**"insufficient funds"** : Vous n'avez pas assez d'ETH Sepolia

**"execution reverted"** : La transaction a échoué (vérifiez les conditions)

**Les données ne se chargent pas** : Vérifiez que vous êtes sur Sepolia dans MetaMask

---

**Bon vote ! 🗳️**

