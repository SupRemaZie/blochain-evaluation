#!/bin/bash

# Script pour vérifier le solde du déployeur sur Sepolia

source .env

# Extraire l'adresse depuis la clé privée
DEPLOYER_ADDRESS=$(cast wallet address $PRIVATE_KEY)

echo "=== Vérification du solde Sepolia ==="
echo "Adresse du déployeur: $DEPLOYER_ADDRESS"
echo ""

BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $SEPOLIA_RPC_URL 2>/dev/null)
BALANCE_ETH=$(echo "scale=6; $BALANCE / 1000000000000000000" | bc)

echo "Solde actuel: $BALANCE_ETH ETH"
echo ""

if (( $(echo "$BALANCE_ETH < 0.0005" | bc -l) )); then
    echo "⚠️  Solde insuffisant pour le déploiement"
    echo "   Montant nécessaire: ~0.0005 ETH"
    echo ""
    echo "Pour obtenir des ETH Sepolia:"
    echo "1. https://sepoliafaucet.com/"
    echo "2. https://www.infura.io/faucet/sepolia"
    echo ""
    echo "Adresse à financer: $DEPLOYER_ADDRESS"
else
    echo "✅ Solde suffisant pour le déploiement"
    echo ""
    echo "Vous pouvez maintenant déployer avec:"
    echo "forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast --verify"
fi

