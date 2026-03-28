# 🚀 Script de Configuration Locale - Sekou Draperie 🏠

Write-Host "--- Début de la configuration locale ---" -ForegroundColor Cyan

# 1. Variables d'environnement
if (-not (Test-Path ".env")) {
    Write-Host "📄 Création du fichier .env racine..."
    Copy-Item ".env.example" ".env"
}

# 2. Installation des dépendances (Si nécessaire)
# Write-Host "📦 Installation des dépendances (Veuillez attendre)..."
# npm install

# 3. Préparation de la Base de Données (Prisma)
Write-Host "💾 Initialisation de la base de données SQLite..."
cd packages/database

Write-Host "🔄 Mise à jour du schéma (db push)..."
npx prisma db push --accept-data-loss

Write-Host "⚙️ Génération du client Prisma..."
npx prisma generate

Write-Host "🌱 Remplissage de la base de données (seeding)..."
# npx tsx prisma/seed.ts
npm run build # generate + build
npx prisma db seed

cd ../..

Write-Host "✅ Configuration terminée avec succès !" -ForegroundColor Green
Write-Host "👉 Lancez 'npm run dev' pour démarrer l'application." -ForegroundColor Yellow
