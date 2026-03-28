# 🏗️ Architecture & Stack Technique - Sekou Draperie

Ce document décrit en détail les choix techniques, l'architecture logicielle et les standards de développement adoptés pour le **Drapery Management System (DMS)**.

---

## 🚀 1. Stack Technologique (Core)

Le projet repose sur une stack moderne, typée et performante, conçue pour la scalabilité et la maintenance à long terme.

| Composant | Technologie | Version | Justification |
| :--- | :--- | :--- | :--- |
| **Monorepo Tool** | **Turborepo** | Latest | Orchestration ultra-rapide des builds (parallélisation, cache distant). Indispensable pour gérer Frontend + Backend + Libs partagées. |
| **Frontend** | **Next.js** | 15.1.7 (App Router) | Framework React de référence. Rendu hybride (Server Components + Client Components) pour performance SEO et UX fluide. |
| **Backend API** | **NestJS** | 10.x | Framework Node.js structuré (Architecture Hexagonale/Modulaire). Idéal pour la logique métier complexe (FEFO, Transactions ACID). |
| **Langage** | **TypeScript** | 5.x | Typage statique strict pour réduire les bugs et améliorer la DX (Developer Experience). |
| **Base de Données** | **SQLite** (Dev) -> **PostgreSQL** (Prod) | Latest | SQLite pour développement local rapide (zéro config). PostgreSQL via Docker pour la production (fiabilité, JSONB). |
| **ORM** | **Prisma** | 6.x | Interface Type-Safe avec la base de données. Migrations automatiques et intégrité référentielle garantie. |
| **Gestionnaire de Paquets** | **npm** | Latest | Standard de l'écosystème JS. Workspaces natifs utilisés pour le monorepo. |

---

## 🎨 2. Frontend & Design System (UI/UX)

L'interface utilisateur vise un standard "Premium / Industriel" : propre, réactif et accessible.

*   **Framework CSS** : **Tailwind CSS v3.4** (Utility-first). Permet un développement rapide et un bundle CSS minimal.
*   **Composants UI** : **Shadcn/UI** (basé sur Radix Primitives). Composants accessibles, personnalisables et copiés directement dans le code (pas de dépendance npm opaque).
*   **Icônes** : **Lucide React**. Icônes vectorielles légères et cohérentes.
*   **Graphiques** : **Recharts**. Visualisation de données (KPIs, Courbes de ventes) performante et responsive.
*   **Gestion État Serveur** : **TanStack Query (React Query)** / **fetch**. Gestion du cache, revalidation automatique et états de chargement.

---

## 🏗️ 3. Architecture Logicielle (Monorepo)

Le projet est structuré comme suit :

```bash
sekou-draperie/
├── apps/                          # Applications exécutables
│   ├── web/                       # Frontend (Next.js) - Port 3000
│   │   ├── app/                   # App Router (Pages & API Routes)
│   │   ├── components/            # Composants React (UI, Dashboard, POS)
│   │   ├── lib/                   # Utilitaires (formatage date, devise)
│   │   └── hooks/                 # Custom React Hooks
│   │   
│   └── api/                       # Backend (NestJS) - Port 3001
│       ├── src/
│       │   ├── stock/             # Module Gestion Stocks (Logique FEFO)
│       │   ├── transactions/      # Module Financier
│       │   └── users/             # Module Auth & RBAC
│       └── main.ts                # Point d'entrée serveur
│
├── packages/                      # Librairies partagées
│   ├── database/                  # Prisma Schema & Client
│   │   ├── prisma/schema.prisma   # Définition unique de la BDD
│   │   └── src/index.ts           # Export du client typé
│   │
│   ├── ui/                        # (Optionnel) Composants partagés Web/Mobile
│   └── config/                    # Eslint, TSConfig, Prettier partagés
│
├── docker-compose.yml             # Infrastructure (Postgres, Redis)
└── turbo.json                     # Pipeline de build (build, lint, dev)
```

### Principes Clés :
1.  **Séparation des Responsabilités** : Le Frontend ne contient pas de logique métier complexe (calculs financiers, règles de stock), il ne fait qu'afficher. Le Backend (NestJS + API Routes) est le garant de la Vérité.
2.  **Code Partagé** : Le package `database` est importé à la fois par `web` et `api`. Si on change le schéma, tout le monde est notifié par TypeScript.
3.  **Sécurité** : 
    *   **Middleware Next.js** pour la protection des routes Frontend (Redirection Login).
    *   **Cookies HttpOnly** pour le stockage des tokens de session (biométrique simulé).

---

## 💾 4. Modèle de Données (Schema Prisma)

Les entités principales (voir `packages/database/prisma/schema.prisma`) :

*   **Product** : Référence catalogue (Nom, DCI, Seuil Alerte, Prix).
*   **Batch** (Lot) : Instance physique d'un produit avec **Date d'Expiration** et Quantité. C'est la base du FEFO.
*   **StockMovement** : Journal immuable de chaque entrée/sortie (Traçabilité totale).
*   **Transaction** : Opération financière (Vente, Achat) liée à un ou plusieurs mouvements.
*   **AuditLog** : Sécurité (Qui a fait quoi et quand).

---

## 🔄 5. Workflow de Développement (CI/CD Ready)

1.  **Installation** : `npm install` (Installe tout le monorepo).
2.  **Base de Données** :
    *   `npx prisma generate` (Génère le client TypeScript).
    *   `npx prisma db push` (Met à jour le schéma SQLite/Postgres).
    *   `Invoke-WebRequest .../api/seed` (Peuple la base avec des données de test).
3.  **Lancement** : `npx turbo run dev` (Lance Web + API en parallèle).
4.  **Linting/Format** : `npm run lint` / `npm run format` (Assure la qualité du code).

---

## 🔮 Futurs Développements Techniques

*   **PWA (Progressive Web App)** : Configurer `next-pwa` dans `apps/web` pour le mode hors-ligne.
*   **Dockerisation Production** : Créer des `Dockerfile` optimisés pour `web` et `api`.
*   **Tests E2E** : Intégrer **Playwright** pour tester les scénarios critiques (Vente complète, Inventaire).

*Document généré le 26 Mars 2026 par Sekou - Assistant IA.*
