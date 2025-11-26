# PROMPT TECHNIQUE : Application de Gestion des Élections Législatives

## 📋 CONTEXTE

Créer une application Next.js 15 pour la gestion des élections législatives avec **circonscriptions**. Chaque circonscription contient une élection avec un nombre défini de candidatures.

**IMPORTANT** : Réutiliser les mêmes pages, composants et structure que l'application actuelle (`transmission-epr-app`). Ne pas réinventer la roue.

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique (identique à l'app actuelle)

**Framework & Core:**
- Next.js 15.5.3 (App Router)
- React 19.1.0
- TypeScript 5
- Node.js 20+

**Authentification & Sécurité:**
- Next-Auth 5.0.0-beta.29
- Cookies httpOnly pour les tokens
- Middleware Next.js pour protection des routes
- JWT (jsonwebtoken 9.0.2)

**State Management:**
- Zustand 5.0.8
- React Context API (AuthContext)
- TanStack React Query 5.90.1

**Formulaires & Validation:**
- React Hook Form 7.63.0
- Zod 4.1.11
- @hookform/resolvers 5.2.2

**Data Visualization:**
- Chart.js 4.5.0
- react-chartjs-2 5.3.0
- Recharts 3.2.1

**Autres Packages:**
- Axios 1.12.2
- Sonner 2.0.7 (notifications)
- React Dropzone 14.3.8
- XLSX 0.18.5
- jsPDF 3.0.3 + jspdf-autotable 5.0.2
- @upstash/ratelimit 2.0.6

## 📁 STRUCTURE DU PROJET

```
elections-legislatives-app/
├── actions/
│   └── auth.action.ts          # ✅ COPIER depuis app actuelle
├── app/
│   ├── (protected)/            # Routes protégées
│   │   ├── dashboard/          # ✅ ADAPTER depuis app actuelle
│   │   ├── circonscriptions/   # 🆕 NOUVEAU (basé sur publications)
│   │   ├── elections/          # 🆕 NOUVEAU (basé sur upload)
│   │   ├── candidatures/       # 🆕 NOUVEAU
│   │   ├── resultats/          # ✅ COPIER depuis app actuelle (results)
│   │   └── utilisateurs/        # ✅ COPIER depuis app actuelle (users)
│   ├── api/
│   │   ├── auth/               # ✅ COPIER depuis app actuelle
│   │   ├── circonscriptions/   # 🆕 NOUVEAU
│   │   ├── elections/          # 🆕 NOUVEAU
│   │   ├── candidatures/       # 🆕 NOUVEAU
│   │   └── resultats/          # 🆕 NOUVEAU
│   ├── auth/                   # ✅ COPIER depuis app actuelle
│   ├── layout.tsx              # ✅ COPIER depuis app actuelle
│   ├── page.tsx                # ✅ COPIER depuis app actuelle
│   └── globals.css             # ✅ COPIER depuis app actuelle
├── components/
│   ├── auth/                   # ✅ COPIER TOUT depuis app actuelle
│   ├── circonscriptions/       # 🆕 ADAPTER depuis components/publications/
│   ├── elections/              # 🆕 ADAPTER depuis components/upload/
│   ├── candidatures/           # 🆕 NOUVEAU
│   ├── resultats/              # ✅ COPIER depuis components/results/
│   ├── dashboard/              # ✅ COPIER depuis app actuelle
│   ├── layout/                 # ✅ COPIER depuis app actuelle
│   ├── modals/                 # ✅ COPIER depuis app actuelle
│   ├── tables/                 # ✅ COPIER depuis app actuelle
│   └── ui/                     # ✅ COPIER TOUT depuis app actuelle
├── contexts/
│   └── AuthContext.tsx         # ✅ COPIER depuis app actuelle
├── hooks/
│   ├── use-circonscriptions.ts # 🆕 NOUVEAU (basé sur use-publications.ts)
│   ├── use-elections.ts        # 🆕 NOUVEAU (basé sur use-upload.ts)
│   ├── use-candidatures.ts     # 🆕 NOUVEAU
│   └── use-resultats.ts        # ✅ COPIER depuis app actuelle
├── lib/
│   ├── api/                    # ✅ COPIER structure depuis app actuelle
│   ├── services/               # ✅ COPIER structure depuis app actuelle
│   ├── config/                 # ✅ COPIER depuis app actuelle
│   ├── utils/                  # ✅ COPIER depuis app actuelle
│   ├── validations/            # 🆕 NOUVEAU (schémas Zod)
│   └── mock-data/              # 🆕 NOUVEAU (données mockées)
│       ├── circonscriptions.ts
│       ├── elections.ts
│       ├── candidatures.ts
│       └── resultats.ts
├── store/
│   ├── auth.ts                 # ✅ COPIER depuis app actuelle
│   └── ui.ts                   # ✅ COPIER depuis app actuelle
├── types/
│   ├── auth.ts                 # ✅ COPIER depuis app actuelle
│   ├── circonscriptions.ts     # 🆕 NOUVEAU
│   ├── elections.ts            # 🆕 NOUVEAU
│   ├── candidatures.ts         # 🆕 NOUVEAU
│   └── resultats.ts            # ✅ COPIER depuis app actuelle
├── middleware.ts               # ✅ COPIER depuis app actuelle
├── next.config.ts              # ✅ COPIER depuis app actuelle
├── tailwind.config.ts          # ✅ COPIER depuis app actuelle
├── tsconfig.json               # ✅ COPIER depuis app actuelle
├── components.json             # ✅ COPIER depuis app actuelle
└── package.json                # ✅ COPIER depuis app actuelle
```

## 🔐 SYSTÈME D'AUTHENTIFICATION

### Fichiers à COPIER INTÉGRALEMENT

1. **`middleware.ts`** → Copier tel quel
2. **`actions/auth.action.ts`** → Copier tel quel
3. **`contexts/AuthContext.tsx`** → Copier tel quel
4. **`app/api/auth/*`** → Copier tous les fichiers
5. **`lib/services/auth.service.ts`** → Copier tel quel
6. **`lib/api/auth.ts`** → Copier tel quel
7. **`components/auth/*`** → Copier tous les fichiers
8. **`store/auth.ts`** → Copier tel quel
9. **`types/auth.ts`** → Copier tel quel
10. **`app/auth/*`** → Copier toutes les pages

**Aucune modification nécessaire** - Le système d'authentification reste identique.

## 📄 MAPPING DES PAGES À COPIER/ADAPTER

### 1. Dashboard (`/dashboard`)

**Fichiers à COPIER :**
- `app/(protected)/dashboard/page.tsx` → Copier tel quel
- `components/dashboard/*` → Copier tous les fichiers
- `hooks/use-dashboard-metrics.ts` → Copier tel quel

**Adaptations nécessaires :**
- Remplacer les références aux "départements" par "circonscriptions"
- Remplacer les références aux "CECs" par "élections"
- Adapter les statistiques pour les élections législatives

### 2. Circonscriptions (`/circonscriptions`)

**Fichiers à COPIER depuis `publications` :**
- `app/(protected)/publications/page.tsx` → Adapter pour circonscriptions
- `components/publications/publications-page-header.tsx` → Adapter
- `components/publications/publications-page-content-v2.tsx` → Adapter
- `components/publications/publications-stats-cards.tsx` → Adapter
- `components/publications/departments-table.tsx` → Adapter en `circonscriptions-table.tsx`
- `components/publications/department-filters.tsx` → Adapter en `circonscriptions-filters.tsx`
- `components/publications/department-details-modal.tsx` → Adapter

**Adaptations :**
- Remplacer "département" par "circonscription"
- Remplacer "CEC" par "élection"
- Adapter les types et interfaces
- Utiliser les données mockées de `lib/mock-data/circonscriptions.ts`

### 3. Élections (`/elections`)

**Fichiers à COPIER depuis `upload` :**
- `app/(protected)/upload/page.tsx` → Adapter pour élections
- `components/upload/upload-page-header.tsx` → Adapter
- `components/upload/upload-page-content.tsx` → Adapter
- `components/upload/imports-table.tsx` → Adapter en `elections-table.tsx`
- `components/upload/import-filters.tsx` → Adapter en `elections-filters.tsx`
- `components/upload/stats-cards.tsx` → Adapter
- `hooks/use-upload.ts` → Adapter en `use-elections.ts`

**Adaptations :**
- Remplacer "import" par "élection"
- Remplacer "CEL" par "circonscription"
- Adapter pour gérer les élections par circonscription
- Utiliser les données mockées de `lib/mock-data/elections.ts`

### 4. Candidatures (`/candidatures`)

**Fichiers à CRÉER (nouveau) :**
- `app/(protected)/candidatures/page.tsx` → Créer nouveau
- `components/candidatures/candidatures-page-header.tsx` → Créer nouveau
- `components/candidatures/candidatures-page-content.tsx` → Créer nouveau
- `components/candidatures/candidatures-table.tsx` → Créer nouveau
- `components/candidatures/candidature-form-modal.tsx` → Créer nouveau
- `hooks/use-candidatures.ts` → Créer nouveau

**Inspiration :**
- Utiliser la structure de `components/users/` comme base
- Table avec CRUD complet
- Formulaires avec validation Zod
- Utiliser les données mockées de `lib/mock-data/candidatures.ts`

### 5. Résultats (`/resultats`)

**Fichiers à COPIER :**
- `app/(protected)/results/page.tsx` → Copier tel quel
- `components/results/*` → Copier tous les fichiers
- `hooks/use-election-results.ts` → Copier tel quel
- `hooks/use-zone-results.ts` → Adapter en `use-circonscription-results.ts`
- `lib/mock-data/results.ts` → Adapter pour élections législatives

**Adaptations :**
- Remplacer "zone" par "circonscription"
- Adapter les calculs pour les élections législatives
- Adapter les types pour les candidatures
- Utiliser les données mockées de `lib/mock-data/resultats.ts`

### 6. Utilisateurs (`/utilisateurs`)

**Fichiers à COPIER :**
- `app/(protected)/users/page.tsx` → Copier tel quel
- `app/(protected)/users/[id]/page.tsx` → Copier tel quel
- `components/users/*` → Copier tous les fichiers

**Aucune adaptation nécessaire** - La gestion des utilisateurs reste identique.

## 🗳️ MODÈLE DE DONNÉES

### Types à Créer

```typescript
// types/circonscriptions.ts
export interface Circonscription {
  id: string;
  code: string;
  libelle: string;
  region: string;
  departement: string;
  nombreSieges: number;
  nombreCandidaturesAttendues: number;
  nombreCandidaturesReelles?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// types/elections.ts
export interface Election {
  id: string;
  circonscriptionId: string;
  circonscription: Circonscription;
  dateElection: Date;
  statut: 'PREPARATION' | 'EN_COURS' | 'CLOTUREE' | 'PUBLIEE';
  nombreInscrits: number;
  nombreVotants?: number;
  nombreBulletinsNuls?: number;
  nombreBulletinsBlancs?: number;
  nombreBulletinsValides?: number;
  createdAt: Date;
  updatedAt: Date;
}

// types/candidatures.ts
export interface Candidature {
  id: string;
  electionId: string;
  election: Election;
  numeroOrdre: number;
  nom: string;
  prenom: string;
  partiPolitique?: string;
  liste?: string;
  photo?: string;
  biographie?: string;
  programme?: string;
  statut: 'VALIDE' | 'INVALIDE' | 'RETIREE';
  nombreVoix?: number;
  pourcentageVoix?: number;
  estElu?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// types/resultats.ts (adapter depuis app actuelle)
export interface ResultatElection {
  id: string;
  electionId: string;
  election: Election;
  circonscription: Circonscription;
  candidatures: Candidature[];
  nombreInscrits: number;
  nombreVotants: number;
  nombreBulletinsNuls: number;
  nombreBulletinsBlancs: number;
  nombreBulletinsValides: number;
  tauxParticipation: number;
  candidatsElus: Candidature[];
  datePublication?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📊 DONNÉES MOCKÉES

### Structure des fichiers mock

**`lib/mock-data/circonscriptions.ts`**
```typescript
import type { Circonscription } from '@/types/circonscriptions';

export const mockCirconscriptions: Circonscription[] = [
  {
    id: 'circ-001',
    code: 'ABJ-01',
    libelle: 'Abidjan 1ère Circonscription',
    region: 'Lagunes',
    departement: 'Abidjan',
    nombreSieges: 2,
    nombreCandidaturesAttendues: 8,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
  },
  // ... plus de données
];

export const mockCirconscriptionsStats = {
  total: 12,
  active: 10,
  inactive: 2,
  totalSieges: 24,
  totalCandidaturesAttendues: 96,
};
```

**`lib/mock-data/elections.ts`**
```typescript
import type { Election } from '@/types/elections';
import { mockCirconscriptions } from './circonscriptions';

export const mockElections: Election[] = [
  {
    id: 'elec-001',
    circonscriptionId: 'circ-001',
    circonscription: mockCirconscriptions[0],
    dateElection: new Date('2025-03-15'),
    statut: 'EN_COURS',
    nombreInscrits: 45000,
    nombreVotants: 32000,
    nombreBulletinsNuls: 500,
    nombreBulletinsBlancs: 800,
    nombreBulletinsValides: 30700,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-15'),
  },
  // ... plus de données
];
```

**`lib/mock-data/candidatures.ts`**
```typescript
import type { Candidature } from '@/types/candidatures';
import { mockElections } from './elections';

export const mockCandidatures: Candidature[] = [
  {
    id: 'cand-001',
    electionId: 'elec-001',
    election: mockElections[0],
    numeroOrdre: 1,
    nom: 'KOUAME',
    prenom: 'Jean',
    partiPolitique: 'PDCI-RDA',
    statut: 'VALIDE',
    nombreVoix: 8500,
    pourcentageVoix: 27.7,
    estElu: true,
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-15'),
  },
  // ... plus de données
];
```

**`lib/mock-data/resultats.ts`**
```typescript
import type { ResultatElection } from '@/types/resultats';
import { mockElections } from './elections';
import { mockCirconscriptions } from './circonscriptions';
import { mockCandidatures } from './candidatures';

export const mockResultats: ResultatElection[] = [
  {
    id: 'res-001',
    electionId: 'elec-001',
    election: mockElections[0],
    circonscription: mockCirconscriptions[0],
    candidatures: mockCandidatures.filter(c => c.electionId === 'elec-001'),
    nombreInscrits: 45000,
    nombreVotants: 32000,
    nombreBulletinsNuls: 500,
    nombreBulletinsBlancs: 800,
    nombreBulletinsValides: 30700,
    tauxParticipation: 71.1,
    candidatsElus: mockCandidatures.filter(c => c.electionId === 'elec-001' && c.estElu),
    isPublished: true,
    datePublication: new Date('2025-01-15'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  // ... plus de données
];
```

## 🔧 SERVICES ET API

### Services à Créer (avec données mockées)

**`lib/services/circonscriptions.service.ts`**
```typescript
import { mockCirconscriptions } from '@/lib/mock-data/circonscriptions';
import type { Circonscription } from '@/types/circonscriptions';

export const circonscriptionsService = {
  async getAll(): Promise<Circonscription[]> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCirconscriptions;
  },
  
  async getById(id: string): Promise<Circonscription | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCirconscriptions.find(c => c.id === id) || null;
  },
  
  // ... autres méthodes CRUD
};
```

**Même structure pour :**
- `lib/services/elections.service.ts`
- `lib/services/candidatures.service.ts`
- `lib/services/resultats.service.ts`

## 🚀 SCRIPT DE MIGRATION

Un script Node.js est fourni pour automatiser la migration : `scripts/migrate-to-elections.js`

**Utilisation :**
```bash
node scripts/migrate-to-elections.js <chemin-source> <chemin-cible>
```

**Exemple :**
```bash
node scripts/migrate-to-elections.js ../transmission-epr-app ./elections-legislatives-app
```

Le script :
1. Copie intégralement les fichiers qui ne nécessitent aucune modification
2. Copie récursivement les dossiers complets
3. Adapte les fichiers avec remplacements automatiques (publications → circonscriptions, etc.)
4. Crée les templates de base pour les données mockées

**Voir le guide complet :** `GUIDE_MIGRATION.md`

## 📝 NOTES IMPORTANTES

1. **Données Mockées** : Utiliser les données mockées dans `lib/mock-data/` pour toutes les fonctionnalités
2. **Pas de Backend** : Toutes les API routes doivent retourner des données mockées
3. **Réutilisation** : Copier au maximum depuis l'app actuelle, adapter seulement ce qui est nécessaire
4. **Types** : Adapter les types existants plutôt que de tout recréer
5. **Composants UI** : Copier TOUS les composants `components/ui/` sans modification
6. **Layout** : Copier `components/layout/` sans modification
7. **Auth** : Copier TOUT le système d'authentification sans modification

---

**Ce prompt est purement technique et fonctionnel, sans détails UI/design.**

