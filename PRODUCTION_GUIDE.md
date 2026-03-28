# 🚀 Guide de Production - Sekou Draperie

Ce document répertorie les étapes critiques pour déployer l'application en production (Vercel + PostgreSQL).

## 1. 📂 Variables d'Environnement (Production)

Ces variables doivent être configurées dans votre interface de déploiement (ex: Vercel Dashboard).

| Variable | Description | Recommandation |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de votre base de données PostgreSQL | Utilisez Neon, Supabase ou Railway |
| `AUTH_SECRET` | Clé de chiffrement des sessions JWT | Générez une clé via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL canonique de votre site | Ex: `https://sekou-draperie.com` |
| `ADMIN_EMAIL` | Email de l'administrateur initial | `admin@sekou-draperie.com` |
| `ADMIN_PASSWORD` | Mot de passe de l'administrateur | Choisissez un mot de passe complexe |
| `SEED_TOKEN` | Token de protection du script de seed | Changez la valeur par défaut |
| `UPSTASH_REDIS_REST_URL`| URL Redis pour le Rate Limiting | Créez un compte gratuit sur Upstash |
| `UPSTASH_REDIS_REST_TOKEN`| Token Redis pour le Rate Limiting | Requis pour la sécurité anti-brute force |

## 2. 🗄️ Base de Données (SQLite -> PostgreSQL)

En production, **SQLite n'est pas recommandé** pour une application SaaS multi-utilisateurs.

### Étapes de migration :
1. Dans `packages/database/prisma/schema.prisma`, changez le provider :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Installez le driver PostgreSQL : `npm install pg` dans les packages concernés.
3. Exécutez `npx prisma migrate deploy` lors du build.

## 3. 🛡️ Sécurité & Hardening

- **HTTPS obligatoire** : Déjà géré par Vercel.
- **Headers de sécurité** : Configurés dans `next.config.js` (HSTS, CSP, etc.).
- **Rate Limiting** : Activé via Upstash Redis. Assurez-vous que les variables Redis sont renseignées pour éviter le fallback en mémoire (inefficace en serverless).

## 4. 📦 Commande de Build Vercel

Le projet est configuré en Monorepo. Sur Vercel, utilisez les paramètres suivants :
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && npx turbo run build --filter=web`
- **Install Command**: `cd ../.. && npm install`

## 5. 📧 Email & Notifications

Considérer l'ajout de `RESEND_API_KEY` pour l'envoi futur de factures par email.
