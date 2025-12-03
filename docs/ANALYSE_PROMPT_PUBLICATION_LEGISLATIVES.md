# 📋 Analyse du Prompt : Publication des Résultats Législatives

## 🎯 Vue d'Ensemble

Ce document analyse le prompt `PROMPT_FRONTEND_PUBLICATION_LEGISLATIVES.md` et identifie les éléments à implémenter pour le frontend, en tenant compte des spécifications pour les utilisateurs USER.

---

## 🔑 Différences Clés avec l'API Présidentielle

### 1. Entité de Publication
- **Présidentielle** : Départements
- **Législatives** : **Circonscriptions** (COD_CE)

### 2. Structure Hiérarchique
- **Présidentielle** : Région → Département → Commune → CEL
- **Législatives** : **Circonscription → CEL** (structure simplifiée)

### 3. Candidats
- **Présidentielle** : Candidats fixes au niveau national
- **Législatives** : **Candidats variables par circonscription** (NUM_DOS dynamiques)

### 4. Statuts de Publication
- **Présidentielle** : `PUBLISHED`, `CANCELLED`, `PENDING`
- **Législatives** : `'0'` (Non publié), `'1'` (Publié), `'C'` (Annulé)

---

## 👥 Spécifications par Rôle Utilisateur

### 🔴 USER (Utilisateur Standard)

#### Menu et Titre
- **Menu** : "Consolidation" (pas "Publication")
- **Titre de page** : "Consolidation des Résultats Législatives"
- **Description** : "Consultez les résultats consolidés par circonscription"

#### Permissions
- ✅ **Peut voir** :
  - Statistiques des circonscriptions assignées
  - Liste des circonscriptions assignées
  - Détails d'une circonscription (assignée)
  - Données agrégées par CELs
  - Scores des candidats par circonscription

- ❌ **Ne peut pas** :
  - Publier une circonscription
  - Annuler une publication
  - Voir les données nationales
  - Accéder aux circonscriptions non assignées

#### Actions Disponibles
1. **Consulter les statistiques** : Voir les stats de ses circonscriptions
2. **Filtrer et rechercher** : Par statut, code, libellé
3. **Voir les détails** : Détails d'une circonscription avec données agrégées par CELs
4. **Exporter** : PDF des données consolidées (si nécessaire)

### 🟢 ADMIN / SADMIN

#### Menu et Titre
- **Menu** : "Publication"
- **Titre de page** : "Publication des Résultats Législatives"
- **Description** : "Gérez la publication des résultats par circonscription"

#### Permissions
- ✅ **Peut tout faire** :
  - Voir toutes les circonscriptions
  - Publier une circonscription
  - Annuler une publication
  - Voir les données nationales
  - Générer les rapports nationaux

---

## 📡 Endpoints à Implémenter

### Base URL
```
/api/v1/legislatives/publications
```

### 1. Statistiques Globales
```
GET /stats
```
**Réponse** :
```typescript
{
  totalCirconscriptions: number;
  publishedCirconscriptions: number;
  pendingCirconscriptions: number;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  publicationRate: number; // %
}
```

### 2. Liste des Circonscriptions
```
GET /circonscriptions?page=1&limit=10&statPub=1&search=004
```
**Query Parameters** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Éléments par page (défaut: 10)
- `statPub` : `'0'` | `'1'` | `'C'` (optionnel)
- `search` : Recherche par code ou libellé (optionnel)

**Réponse** :
```typescript
{
  circonscriptions: Array<{
    id: number;
    codeCirconscription: string; // COD_CE
    libelleCirconscription: string | null;
    nombreSieges: number | null;
    totalCels: number;
    importedCels: number;
    pendingCels: number;
    publicationStatus: string; // '0', '1', 'C'
    lastUpdate: Date;
    cels: Array<{
      codeCel: string;
      libelleCel: string | null;
      etatResultat: string | null; // 'I', 'PUBLISHED', etc.
    }>;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 3. Publication d'une Circonscription (ADMIN/SADMIN uniquement)
```
POST /circonscriptions/:id/publish
```
**Path Parameter** : `id` = codeCirconscription (ex: "004")

**Validation** : Toutes les CELs doivent être importées (`importedCels === totalCels`)

**Réponse** :
```typescript
{
  success: boolean;
  message: string;
  circonscription?: {
    codeCirconscription: string;
    libelleCirconscription: string | null;
    publicationStatus: string; // '1' après publication
  };
  error?: string;
}
```

### 4. Annulation de Publication (ADMIN/SADMIN uniquement)
```
POST /circonscriptions/:id/cancel
```
**Path Parameter** : `id` = codeCirconscription

**Réponse** :
```typescript
{
  success: boolean;
  message: string;
  circonscription?: {
    codeCirconscription: string;
    libelleCirconscription: string | null;
    publicationStatus: string; // 'C' après annulation
  };
}
```

### 5. Détails d'une Circonscription
```
GET /circonscriptions/:id/details
```
**Path Parameter** : `id` = codeCirconscription

**Réponse** :
```typescript
{
  id: string;
  codeCirconscription: string;
  libelleCirconscription: string | null;
  nombreSieges: number | null;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  publicationStatus: string;
  lastUpdate: Date;
  cels: Array<{
    codeCel: string;
    libelleCel: string | null;
    etatResultat: string | null;
  }>;
  history: Array<{
    id: number;
    action: string; // 'PUBLISH' ou 'CANCEL'
    userId: string;
    details: string | null;
    timestamp: Date;
  }>;
}
```

### 6. Données Agrégées d'une Circonscription (⚠️ IMPORTANT pour USER)
```
GET /circonscriptions/:codeCirconscription/data
```
**Path Parameter** : `codeCirconscription` = COD_CE (ex: "004")

**Réponse** :
```typescript
{
  codeCirconscription: string;
  libelleCirconscription: string | null;
  inscrits: number;
  votants: number;
  participation: number; // %
  nombreBureaux: number;
  candidats: Array<{
    numeroDossier: string; // NUM_DOS (ex: 'U-02108')
    nom: string;
    parti: string;
    score: number;
    pourcentage: number; // %
  }>;
  cels: Array<{
    codeCel: string;
    libelleCel: string | null;
    inscrits: number;
    votants: number;
    participation: number; // %
    nombreBureaux: number;
    candidats: Array<{
      numeroDossier: string;
      nom: string;
      parti: string;
      score: number; // Score pour cette CEL spécifique
      pourcentage: number;
    }>;
  }>;
}
```

**⚠️ Note importante** : C'est cet endpoint que les utilisateurs USER doivent utiliser pour voir les détails consolidés par CELs.

### 7. Données Nationales (ADMIN/SADMIN uniquement)
```
GET /national/data
```
**Réponse** :
```typescript
{
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  nombreCirconscriptions: number;
  circonscriptionsPubliees: number;
  circonscriptionsEnAttente: number;
  candidats: Array<{
    numeroDossier: string;
    nom: string;
    parti: string;
    score: number;
    pourcentage: number;
    scoresParCirconscription: Record<string, number>;
  }>;
  circonscriptions: Array<{
    codeCirconscription: string;
    libelleCirconscription: string | null;
    inscrits: number;
    votants: number;
    participation: number;
    nombreBureaux: number;
    publicationStatus: string | null;
  }>;
}
```

---

## 🏗️ Structure des Composants à Créer

### 1. Service API
**Fichier** : `lib/api/legislatives-publications.ts`

```typescript
export const legislativesPublicationsApi = {
  getStats: async () => Promise<LegislativePublicationStats>,
  getCirconscriptions: async (query: CirconscriptionQuery) => Promise<CirconscriptionListResponse>,
  publishCirconscription: async (codeCirconscription: string) => Promise<PublicationActionResult>,
  cancelPublication: async (codeCirconscription: string) => Promise<PublicationActionResult>,
  getCirconscriptionDetails: async (codeCirconscription: string) => Promise<CirconscriptionDetails>,
  getCirconscriptionData: async (codeCirconscription: string) => Promise<CirconscriptionDataResponse>,
  getNationalData: async () => Promise<NationalDataResponse>, // ADMIN/SADMIN uniquement
};
```

### 2. Types TypeScript
**Fichier** : `types/legislatives-publications.ts`

```typescript
// Statistiques
export interface LegislativePublicationStats {
  totalCirconscriptions: number;
  publishedCirconscriptions: number;
  pendingCirconscriptions: number;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  publicationRate: number;
}

// Circonscription
export interface Circonscription {
  id: number;
  codeCirconscription: string;
  libelleCirconscription: string | null;
  nombreSieges: number | null;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  publicationStatus: '0' | '1' | 'C';
  lastUpdate: Date;
  cels: Array<{
    codeCel: string;
    libelleCel: string | null;
    etatResultat: string | null;
  }>;
}

// Données agrégées (pour USER)
export interface CirconscriptionDataResponse {
  codeCirconscription: string;
  libelleCirconscription: string | null;
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  candidats: Array<{
    numeroDossier: string;
    nom: string;
    parti: string;
    score: number;
    pourcentage: number;
  }>;
  cels: Array<{
    codeCel: string;
    libelleCel: string | null;
    inscrits: number;
    votants: number;
    participation: number;
    nombreBureaux: number;
    candidats: Array<{
      numeroDossier: string;
      nom: string;
      parti: string;
      score: number;
      pourcentage: number;
    }>;
  }>;
}
```

### 3. Composants Principaux

#### A. Page de Consolidation/Publication
**Fichier** : `components/legislatives-publications/legislatives-publications-page-content.tsx`

**Props** :
```typescript
interface LegislativesPublicationsPageContentProps {
  isUser?: boolean; // true pour USER, false pour ADMIN/SADMIN
  onPublicationSuccess?: () => void;
}
```

**Fonctionnalités** :
- Afficher les statistiques
- Liste des circonscriptions avec filtres
- Actions de publication/annulation (si `!isUser`)
- Modal de détails avec données agrégées par CELs

#### B. Composant de Statistiques
**Fichier** : `components/legislatives-publications/legislatives-stats-section.tsx`

**Affiche** :
- Total circonscriptions
- Circonscriptions publiées/en attente
- Total CELs / CELs importées/en attente
- Taux de publication

#### C. Composant de Liste des Circonscriptions
**Fichier** : `components/legislatives-publications/circonscriptions-table.tsx`

**Fonctionnalités** :
- Tableau avec pagination
- Filtres : statut (`statPub`), recherche (`search`)
- Colonnes : Code, Libellé, CELs (importées/total), Statut, Actions
- Badges de statut : En attente (gris), Publié (vert), Annulé (rouge)
- Indicateur de progression (CELs importées/total)

#### D. Composant de Filtres
**Fichier** : `components/legislatives-publications/circonscription-filters.tsx`

**Filtres** :
- Statut de publication : Tous / Non publié (`'0'`) / Publié (`'1'`) / Annulé (`'C'`)
- Recherche : Par code ou libellé

#### E. Modal de Détails (⚠️ CRUCIAL pour USER)
**Fichier** : `components/legislatives-publications/circonscription-details-modal.tsx`

**Fonctionnalités** :
- Métriques globales : Inscrits, Votants, Participation, Bureaux
- Tableau des candidats avec scores et pourcentages
- **Tableau des CELs avec données agrégées** :
  - Pour chaque CEL : Inscrits, Votants, Participation, Bureaux
  - Scores des candidats par CEL
  - Recherche et filtres dans le tableau
- Actions : Publier/Annuler (si `!isUser`)
- Export PDF (optionnel)

#### F. Composant de Données Nationales (ADMIN/SADMIN uniquement)
**Fichier** : `components/legislatives-publications/national-data-modal.tsx`

**Fonctionnalités** :
- Statistiques nationales
- Liste des candidats avec scores nationaux
- Scores par circonscription pour chaque candidat
- Liste des circonscriptions avec leurs métriques

---

## 🎨 Interface Utilisateur

### Pour USER (Consolidation)

#### Page Principale
```
┌─────────────────────────────────────────────────┐
│ 📊 Consolidation des Résultats Législatives     │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Statistiques]                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Total    │ │ Publiées │ │ En      │         │
│ │ Circ.    │ │          │ │ Attente │         │
│ │ 255      │ │ 200      │ │ 55      │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│                                                 │
│ [Filtres]                                       │
│ Statut: [Tous ▼] Recherche: [________]         │
│                                                 │
│ [Tableau des Circonscriptions]                 │
│ ┌──────┬──────────────┬──────┬────────┬──────┐│
│ │ Code │ Libellé      │ CELs │ Statut │ Act.││
│ ├──────┼──────────────┼──────┼────────┼──────┤│
│ │ 004  │ ANANGUIE...  │ 8/10 │ ⏳      │ 👁️  ││
│ │ 005  │ GOMON...     │ 6/6  │ ✅     │ 👁️  ││
│ └──────┴──────────────┴──────┴────────┴──────┘│
│                                                 │
│ [Pagination]                                    │
└─────────────────────────────────────────────────┘
```

#### Modal de Détails (Données Agrégées par CELs)
```
┌─────────────────────────────────────────────────┐
│ Circonscription 004 - ANANGUIE, CECHI ET RUBINO │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Métriques Globales]                            │
│ Inscrits: 50,000 | Votants: 35,000 | Part: 70% │
│                                                 │
│ [Candidats]                                      │
│ ┌────────────┬──────┬──────┬──────┐            │
│ │ Nom        │ Parti│ Score│  %   │            │
│ ├────────────┼──────┼──────┼──────┤            │
│ │ JEAN DUPONT│ PDCI │12,500│35.71%│            │
│ │ MARIE MARTIN│RHDP │11,250│32.14%│            │
│ └────────────┴──────┴──────┴──────┘            │
│                                                 │
│ [Données par CEL] ⚠️ IMPORTANT                  │
│ ┌──────┬──────────────┬──────┬──────┬──────┐   │
│ │ Code │ Libellé      │ Insc.│ Vot. │ Part.│   │
│ ├──────┼──────────────┼──────┼──────┼──────┤   │
│ │ S003 │ CESP CECHI   │25,000│17,500│ 70%  │   │
│ │ S008 │ CESP RUBINO  │25,000│17,500│ 70%  │   │
│ └──────┴──────────────┴──────┴──────┴──────┘   │
│                                                 │
│ [Scores des candidats par CEL]                  │
│ (Tableau détaillé avec colonnes dynamiques)     │
│                                                 │
│ [Fermer]                                        │
└─────────────────────────────────────────────────┘
```

### Pour ADMIN/SADMIN (Publication)

#### Page Principale
```
┌─────────────────────────────────────────────────┐
│ 📢 Publication des Résultats Législatives        │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Statistiques] (identique à USER)               │
│                                                 │
│ [Filtres] (identique à USER)                    │
│                                                 │
│ [Tableau des Circonscriptions]                  │
│ ┌──────┬──────────────┬──────┬────────┬──────┐│
│ │ Code │ Libellé      │ CELs │ Statut │ Act.││
│ ├──────┼──────────────┼──────┼────────┼──────┤│
│ │ 004  │ ANANGUIE...  │ 8/10 │ ⏳      │ 👁️  ││
│ │ 005  │ GOMON...     │ 6/6  │ ⏳      │ 📢  ││ ← Bouton Publier
│ │ 006  │ ...          │ 5/5  │ ✅     │ ❌  ││ ← Bouton Annuler
│ └──────┴──────────────┴──────┴────────┴──────┘│
│                                                 │
│ [Boutons Résultats Nationaux]                  │
│ [Générer PDF National] [Générer PDF Détaillé]   │
└─────────────────────────────────────────────────┘
```

---

## ✅ Checklist d'Implémentation

### Phase 1 : Infrastructure
- [ ] Créer `lib/api/legislatives-publications.ts`
- [ ] Créer `types/legislatives-publications.ts`
- [ ] Ajouter les types dans `types/index.ts` (si nécessaire)

### Phase 2 : Composants de Base
- [ ] Créer `components/legislatives-publications/legislatives-stats-section.tsx`
- [ ] Créer `components/legislatives-publications/circonscription-filters.tsx`
- [ ] Créer `components/legislatives-publications/circonscriptions-table.tsx`

### Phase 3 : Composants Avancés
- [ ] Créer `components/legislatives-publications/circonscription-details-modal.tsx`
  - [ ] Métriques globales
  - [ ] Tableau des candidats (colonnes dynamiques)
  - [ ] **Tableau des CELs avec données agrégées** (⚠️ CRUCIAL pour USER)
  - [ ] Actions Publier/Annuler (conditionnel selon rôle)
- [ ] Créer `components/legislatives-publications/national-data-modal.tsx` (ADMIN/SADMIN)

### Phase 4 : Page Principale
- [ ] Créer `components/legislatives-publications/legislatives-publications-page-content.tsx`
  - [ ] Gestion du prop `isUser`
  - [ ] Titre dynamique : "Consolidation" vs "Publication"
  - [ ] Masquer les actions de publication si `isUser`
  - [ ] Intégrer tous les composants

### Phase 5 : Intégration
- [ ] Créer la route dans le router
- [ ] Ajouter le menu "Consolidation" pour USER
- [ ] Ajouter le menu "Publication" pour ADMIN/SADMIN
- [ ] Tester avec différents rôles

### Phase 6 : Améliorations
- [ ] Export PDF des données consolidées
- [ ] Graphiques de participation
- [ ] Indicateurs visuels (badges, progress bars)
- [ ] Gestion des erreurs détaillée
- [ ] Optimisation (cache, lazy loading)

---

## 🔍 Points d'Attention

### 1. Colonnes Dynamiques des Candidats
Les candidats varient par circonscription. Il faut :
- Extraire dynamiquement les `numeroDossier` depuis les données
- Créer des colonnes dynamiques dans les tableaux
- Gérer l'affichage même si le nombre de candidats change

### 2. Validation avant Publication
Avant d'afficher le bouton "Publier" :
```typescript
const canPublish = (circonscription: Circonscription) => {
  return (
    circonscription.importedCels === circonscription.totalCels &&
    circonscription.totalCels > 0 &&
    circonscription.publicationStatus !== '1'
  );
};
```

### 3. Permissions USER
- Filtrer automatiquement par circonscriptions assignées (fait par l'API)
- Masquer les boutons Publier/Annuler
- Afficher "Consolidation" au lieu de "Publication"
- Permettre uniquement la consultation des détails

### 4. Format des Statuts
- `publicationStatus` : `'0'` | `'1'` | `'C'` (string, pas enum)
- `etatResultat` (CEL) : `'I'` | `'PUBLISHED'` | `'CANCELLED'` | `null`

### 5. Données Agrégées par CELs
L'endpoint `/circonscriptions/:codeCirconscription/data` retourne :
- Les métriques globales de la circonscription
- Les scores des candidats au niveau circonscription
- **Un tableau `cels` avec les données agrégées par CEL**, incluant :
  - Métriques de chaque CEL (inscrits, votants, participation, bureaux)
  - Scores des candidats pour chaque CEL

C'est cette structure qui permet à USER de voir la consolidation par CELs.

---

## 📝 Notes Finales

1. **Terminologie** :
   - USER : "Consolidation" (consultation uniquement)
   - ADMIN/SADMIN : "Publication" (gestion complète)

2. **Workflow USER** :
   - Consulter les statistiques de ses circonscriptions
   - Filtrer et rechercher
   - Voir les détails avec données agrégées par CELs
   - Pas de publication possible

3. **Workflow ADMIN/SADMIN** :
   - Tout ce que USER peut faire
   - Plus : Publier/Annuler des circonscriptions
   - Plus : Voir les données nationales
   - Plus : Générer les rapports nationaux

4. **Performance** :
   - Les données agrégées peuvent être volumineuses
   - Utiliser la pagination pour les listes
   - Mettre en cache les statistiques
   - Charger les détails à la demande (lazy loading)

---

## 🚀 Prochaines Étapes

1. Créer le service API `legislatives-publications.ts`
2. Créer les types TypeScript
3. Créer les composants de base (stats, filters, table)
4. Créer le modal de détails avec données agrégées par CELs
5. Créer la page principale avec gestion du rôle USER
6. Intégrer dans le router et le menu

