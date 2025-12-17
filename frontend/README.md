# Interface Web - Système de Vote Blockchain

Interface web moderne et intuitive pour interagir avec le système de vote déployé sur Sepolia.

## 🚀 Utilisation

### Méthode 1 : Ouvrir directement dans le navigateur

1. Assurez-vous d'avoir MetaMask installé dans votre navigateur
2. Ouvrez le fichier `index.html` dans votre navigateur
3. Connectez votre wallet MetaMask
4. Commencez à utiliser l'interface !

### Méthode 2 : Serveur local (recommandé)

Pour éviter les problèmes CORS, utilisez un serveur local :

```bash
# Avec Python 3
cd frontend
python3 -m http.server 8000

# Avec Python 2
python -m SimpleHTTPServer 8000

# Avec Node.js (si installé)
npx http-server
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## 📋 Fonctionnalités

### Pour tous les utilisateurs
- ✅ Connexion avec MetaMask
- ✅ Visualisation des candidats et de leurs statistiques
- ✅ Voir le statut du workflow
- ✅ Timer pour le début des votes

### Pour les ADMIN
- ✅ Enregistrer de nouveaux candidats
- ✅ Changer le statut du workflow
- ✅ Attribuer le rôle FOUNDER à d'autres adresses

### Pour les FOUNDER
- ✅ Financer des candidats avec de l'ETH

### Pour les VOTANTS
- ✅ Voter pour un candidat (après 1 heure d'activation)
- ✅ Vérifier si vous avez déjà voté

### Pour tous (phase COMPLETED)
- ✅ Déterminer et voir le vainqueur

## 🔧 Configuration

Les adresses des contrats sont configurées dans `config.js` :

```javascript
VOTE_NFT_ADDRESS: "0xdb9fcDD0006f1EafDC54d289d4593175F23dDbbd"
VOTING_SYSTEM_ADDRESS: "0x11a88B3Ba383F46B014Fcfd9FFB4457AD5211BEb"
```

Si vous avez déployé sur un autre réseau, modifiez ces adresses dans `config.js`.

## 🎨 Caractéristiques de l'Interface

- **Design moderne** : Interface sombre avec dégradés et animations
- **Responsive** : Fonctionne sur mobile, tablette et desktop
- **Temps réel** : Mise à jour automatique des données
- **Notifications** : Feedback visuel pour toutes les transactions
- **Liens Etherscan** : Accès direct aux transactions sur Etherscan

## 📱 Prérequis

- **MetaMask** : Extension de navigateur installée
- **Réseau Sepolia** : Configuré dans MetaMask
- **ETH Sepolia** : Pour payer les frais de transaction

## 🔐 Sécurité

- Les clés privées ne quittent jamais votre navigateur
- Toutes les transactions sont signées via MetaMask
- L'interface ne stocke aucune donnée sensible

## 🐛 Dépannage

### MetaMask ne se connecte pas
- Vérifiez que MetaMask est installé et déverrouillé
- Assurez-vous d'être sur le réseau Sepolia
- Rafraîchissez la page

### Les transactions échouent
- Vérifiez que vous avez suffisamment d'ETH Sepolia
- Vérifiez que vous êtes dans la bonne phase du workflow
- Vérifiez que vous avez les bons rôles (ADMIN, FOUNDER)

### Les données ne se chargent pas
- Vérifiez votre connexion internet
- Vérifiez que les adresses des contrats sont correctes dans `config.js`
- Ouvrez la console du navigateur (F12) pour voir les erreurs

## 📝 Notes

- L'interface utilise ethers.js via CDN (pas besoin d'installation)
- Toutes les interactions sont directement avec les smart contracts
- Les données sont lues en temps réel depuis la blockchain

## 🎯 Workflow d'Utilisation

1. **Connexion** : Connectez votre wallet MetaMask
2. **Enregistrement** (ADMIN) : Enregistrez les candidats
3. **Financement** (FOUNDER) : Financez les candidats
4. **Vote** : Activez la phase de vote et attendez 1 heure
5. **Résultats** : Terminez le vote et déterminez le vainqueur

---

**Développé pour le système de vote blockchain sur Sepolia**

