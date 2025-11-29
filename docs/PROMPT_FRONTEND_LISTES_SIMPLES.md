# 📋 PROMPT FRONTEND : LISTES SIMPLES POUR FORMULAIRES
## API Élections Législatives - Endpoints de Liste Simple

---

## 📋 CONTEXTE ET OBJECTIF

### Vue d'ensemble
Ce document décrit l'intégration frontend de deux endpoints de liste simple optimisés pour les formulaires et les composants de sélection (dropdowns, autocomplete, etc.) :

1. **Liste simple des circonscriptions** : `GET /api/v1/circonscriptions/list/simple`
2. **Liste simple des CELs (Cellules Électorales Locales)** : `GET /api/v1/cels/list/simple`

**Objectifs :**
- ✅ Fournir des listes légères et optimisées pour les formulaires
- ✅ Réduire la charge réseau en ne retournant que les données essentielles
- ✅ Faciliter l'intégration dans les composants de sélection
- ✅ Respecter les permissions utilisateur (filtrage automatique pour USER)

### Architecture du projet
Ce document est adapté à la structure actuelle du projet :
- **Client API** : `lib/api/client.ts` avec `apiClient` (Axios configuré)
- **Intercepteurs** : `lib/api/interceptor.ts` (gestion automatique des tokens via cookies httpOnly)
- **Services API** : `lib/api/lists.ts` pour les listes simples
- **Hooks personnalisés** : `hooks/` pour la gestion d'état React
- **Gestion d'erreurs** : `handleApiError` depuis `lib/api/client.ts`

---

## 🔗 ENDPOINTS

### 1. Liste Simple des Circonscriptions

#### Endpoint
```
GET /api/v1/circonscriptions/list/simple
```

#### Authentification
- **Requis** : Oui (JWT Bearer Token)
- **Header** : `Authorization: Bearer <token>`

#### Permissions
- **SADMIN** : Accès à toutes les circonscriptions
- **ADMIN** : Accès à toutes les circonscriptions
- **USER** : Accès à toutes les circonscriptions (pas de filtrage pour cette liste)

#### Réponse

**Succès (200 OK)**
```json
[
  {
    "codCe": "001",
    "libCe": "Circonscription de Yopougon"
  },
  {
    "codCe": "002",
    "libCe": "Circonscription de Cocody"
  },
  {
    "codCe": "003",
    "libCe": "Circonscription d'Abobo"
  }
]
```

**Structure de la réponse :**
- Type : `Array<{ codCe: string, libCe: string }>`
- Tri : Par `libCe` en ordre alphabétique croissant
- Format : Tableau simple, pas de pagination

**Erreurs possibles :**
- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Accès interdit (rôle insuffisant)

---

### 2. Liste Simple des CELs

#### Endpoint
```
GET /api/v1/cels/list/simple
```

#### Authentification
- **Requis** : Oui (JWT Bearer Token)
- **Header** : `Authorization: Bearer <token>`

#### Permissions
- **SADMIN** : Accès à toutes les CELs
- **ADMIN** : Accès à toutes les CELs
- **USER** : Accès uniquement aux CELs des circonscriptions assignées (filtrage automatique)

#### Réponse

**Succès (200 OK)**
```json
[
  {
    "codeCellule": "001",
    "libelleCellule": "Cellule électorale de Yopougon"
  },
  {
    "codeCellule": "002",
    "libelleCellule": "Cellule électorale de Cocody"
  },
  {
    "codeCellule": "003",
    "libelleCellule": "Cellule électorale d'Abobo"
  }
]
```

**Structure de la réponse :**
- Type : `Array<{ codeCellule: string, libelleCellule: string }>`
- Tri : Par `libelleCellule` en ordre alphabétique croissant
- Format : Tableau simple, pas de pagination
- **Note importante** : Pour les utilisateurs USER, la liste est automatiquement filtrée selon leurs circonscriptions assignées

**Erreurs possibles :**
- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Accès interdit (rôle insuffisant)
- `200 OK` avec tableau vide : Aucune CEL accessible (pour USER sans circonscriptions assignées)

---

## 💻 EXEMPLES D'INTÉGRATION

### 1. Service API (Structure actuelle du projet)

#### Ajout dans `lib/api/lists.ts`

```typescript
import { apiClient } from './client';

// Types pour les listes simples
export interface SimpleCirconscription {
  codCe: string;
  libCe: string;
}

export interface SimpleCel {
  codeCellule: string;
  libelleCellule: string;
}

// Service API pour les listes de formulaires
export const listsApi = {
  // ... méthodes existantes (getDepartementsList, getRegionsList, getCelsList)

  // ✨ NOUVEAU : Récupérer la liste simple des circonscriptions
  getCirconscriptionsList: async (): Promise<SimpleCirconscription[]> => {
    try {
      const response = await apiClient.get('/circonscriptions/list/simple');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ListsAPI] Erreur lors de la récupération des circonscriptions:', error);
      throw error;
    }
  },

  // Récupérer toutes les listes en parallèle (incluant circonscriptions)
  getFormLists: async (): Promise<{
    departements: SimpleDepartement[];
    regions: SimpleRegion[];
    cels: SimpleCel[];
    circonscriptions: SimpleCirconscription[];
  }> => {
    try {
      const [departementsResult, regionsResult, celsResult, circonscriptionsResult] = 
        await Promise.allSettled([
          listsApi.getDepartementsList(),
          listsApi.getRegionsList(),
          listsApi.getCelsList(),
          listsApi.getCirconscriptionsList()
        ]);

      const departements = departementsResult.status === 'fulfilled' ? departementsResult.value : [];
      const regions = regionsResult.status === 'fulfilled' ? regionsResult.value : [];
      const cels = celsResult.status === 'fulfilled' ? celsResult.value : [];
      const circonscriptions = circonscriptionsResult.status === 'fulfilled' ? circonscriptionsResult.value : [];

      return { departements, regions, cels, circonscriptions };
    } catch (error: unknown) {
      console.error('❌ [ListsAPI] Erreur générale lors de la récupération des listes:', error);
      return { departements: [], regions: [], cels: [], circonscriptions: [] };
    }
  },
};
```

**Note** : L'authentification est gérée automatiquement par l'intercepteur dans `lib/api/interceptor.ts` qui récupère le token depuis les cookies httpOnly.

---

### 2. Hook personnalisé React (Structure actuelle du projet)

#### Créer `hooks/useSimpleLists.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { listsApi, type SimpleCirconscription, type SimpleCel } from '@/lib/api/lists';
import { handleApiError } from '@/lib/api/client';

interface UseSimpleListsReturn {
  circonscriptions: SimpleCirconscription[];
  cels: SimpleCel[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les listes simples (circonscriptions et CELs)
 * 
 * Caractéristiques :
 * - Gestion d'état complète (loading, error, data)
 * - Chargement automatique au montage
 * - Fonction de rechargement manuel
 * - Gestion automatique des erreurs avec handleApiError
 * 
 * @returns État et fonctions pour gérer les listes simples
 */
export function useSimpleLists(): UseSimpleListsReturn {
  const [circonscriptions, setCirconscriptions] = useState<SimpleCirconscription[]>([]);
  const [cels, setCels] = useState<SimpleCel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [circonscriptionsData, celsData] = await Promise.all([
        listsApi.getCirconscriptionsList(),
        listsApi.getCelsList(),
      ]);
      
      setCirconscriptions(circonscriptionsData);
      setCels(celsData);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useSimpleLists] Erreur lors de la récupération:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    circonscriptions,
    cels,
    loading,
    error,
    refetch: fetchLists,
  };
}
```

#### Utilisation dans un composant

```typescript
import { useSimpleLists } from '@/hooks/useSimpleLists';

export function MyForm() {
  const { circonscriptions, cels, loading, error, refetch } = useSimpleLists();
  const [formData, setFormData] = useState({
    circonscription: '',
    cel: '',
  });

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Erreur: {error}</p>
        <button onClick={refetch}>Réessayer</button>
      </div>
    );
  }

  return (
    <form>
      <div>
        <label htmlFor="circonscription">Circonscription</label>
        <select
          id="circonscription"
          value={formData.circonscription}
          onChange={(e) => setFormData({ ...formData, circonscription: e.target.value })}
        >
          <option value="">Sélectionner une circonscription</option>
          {circonscriptions.map((circ) => (
            <option key={circ.codCe} value={circ.codCe}>
              {circ.libCe}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cel">Cellule Électorale Locale (CEL)</label>
        <select
          id="cel"
          value={formData.cel}
          onChange={(e) => setFormData({ ...formData, cel: e.target.value })}
        >
          <option value="">Sélectionner une CEL</option>
          {cels.map((cel) => (
            <option key={cel.codeCellule} value={cel.codeCellule}>
              {cel.libelleCellule}
            </option>
          ))}
        </select>
        {cels.length === 0 && (
          <p className="text-warning">
            Aucune CEL disponible. Vérifiez vos assignations de circonscriptions.
          </p>
        )}
      </div>
    </form>
  );
}
```

---

### 3. Utilisation directe dans un composant (sans hook)

```typescript
import { useState, useEffect } from 'react';
import { listsApi } from '@/lib/api/lists';
import { handleApiError } from '@/lib/api/client';

export function MyForm() {
  const [circonscriptions, setCirconscriptions] = useState<SimpleCirconscription[]>([]);
  const [cels, setCels] = useState<SimpleCel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLists = async () => {
      try {
        setLoading(true);
        const [circonscriptionsData, celsData] = await Promise.all([
          listsApi.getCirconscriptionsList(),
          listsApi.getCelsList(),
        ]);
        setCirconscriptions(circonscriptionsData);
        setCels(celsData);
      } catch (err: unknown) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <form>
      {/* ... formulaire avec select */}
    </form>
  );
}
```

### 4. Utilisation avec `getFormLists()` (chargement en parallèle)

```typescript
import { listsApi } from '@/lib/api/lists';

// Dans un composant ou modal
const loadLists = async () => {
  try {
    setListsLoading(true);
    const { departements, regions, cels, circonscriptions } = await listsApi.getFormLists();
    
    setDepartements(departements);
    setRegions(regions);
    setCels(cels);
    setCirconscriptions(circonscriptions);
  } catch (error: unknown) {
    console.error('Erreur lors du chargement des listes:', error);
    toast.error('Erreur lors du chargement des listes');
  } finally {
    setListsLoading(false);
  }
};
```

---

## 🎯 CAS D'USAGE

### 1. Formulaire de création/modification

**Scénario** : Créer ou modifier un enregistrement nécessitant la sélection d'une circonscription et/ou d'une CEL.

```typescript
// Exemple : Formulaire d'assignation d'utilisateur
import { useSimpleLists } from '@/hooks/useSimpleLists';

interface AssignUserForm {
  userId: string;
  circonscriptionCode: string;
  celCode?: string;
}

function AssignUserFormComponent() {
  const { circonscriptions, cels, loading, error } = useSimpleLists();
  const [formData, setFormData] = useState<AssignUserForm>({
    userId: '',
    circonscriptionCode: '',
    celCode: '',
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  // Les listes sont pré-chargées et prêtes à l'emploi
  return (
    <form>
      <Select
        label="Circonscription"
        options={circonscriptions.map(c => ({
          value: c.codCe,
          label: c.libCe,
        }))}
        value={formData.circonscriptionCode}
        onChange={(value) => setFormData({ ...formData, circonscriptionCode: value })}
      />
      <Select
        label="CEL (optionnel)"
        options={cels.map(c => ({
          value: c.codeCellule,
          label: c.libelleCellule,
        }))}
        value={formData.celCode}
        onChange={(value) => setFormData({ ...formData, celCode: value })}
      />
    </form>
  );
}
```

### 2. Filtres de recherche

**Scénario** : Filtrer une liste de résultats par circonscription ou CEL.

```typescript
import { useSimpleLists } from '@/hooks/useSimpleLists';

function SearchFilters() {
  const { circonscriptions, cels, loading } = useSimpleLists();
  const [filters, setFilters] = useState({
    circonscription: '',
    cel: '',
  });

  if (loading) return <div>Chargement des filtres...</div>;

  return (
    <div className="filters">
      <Autocomplete
        label="Filtrer par circonscription"
        options={circonscriptions}
        getOptionLabel={(option) => option.libCe}
        value={filters.circonscription}
        onChange={(value) => setFilters({ ...filters, circonscription: value })}
      />
      <Autocomplete
        label="Filtrer par CEL"
        options={cels}
        getOptionLabel={(option) => option.libelleCellule}
        value={filters.cel}
        onChange={(value) => setFilters({ ...filters, cel: value })}
      />
    </div>
  );
}
```

### 3. Tableau de bord avec statistiques

**Scénario** : Afficher des statistiques par circonscription ou CEL avec sélection.

```typescript
import { useSimpleLists } from '@/hooks/useSimpleLists';

function DashboardStats() {
  const { circonscriptions, loading } = useSimpleLists();
  const [selectedCirconscription, setSelectedCirconscription] = useState('');

  // Charger les statistiques pour la circonscription sélectionnée
  const { stats } = useStats(selectedCirconscription);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <Select
        label="Sélectionner une circonscription"
        options={circonscriptions.map(c => ({
          value: c.codCe,
          label: c.libCe,
        }))}
        value={selectedCirconscription}
        onChange={setSelectedCirconscription}
      />
      {stats && <StatsDisplay stats={stats} />}
    </div>
  );
}
```

---

## ⚠️ POINTS IMPORTANTS

### 1. Gestion des erreurs

La gestion des erreurs est centralisée via `handleApiError` dans `lib/api/client.ts`. Les erreurs sont automatiquement gérées par l'intercepteur dans `lib/api/interceptor.ts`.

- **401 Unauthorized** : Token expiré ou invalide
  - Action : L'intercepteur tente automatiquement un refresh du token
  - Si le refresh échoue : Déclenchement de l'événement `auth-session-expired` et suppression des cookies
  - Message : "Session expirée, veuillez vous reconnecter"

- **403 Forbidden** : Accès interdit
  - Action : Afficher un message d'erreur
  - Message : "Vous n'avez pas les permissions nécessaires pour effectuer cette action"

- **Erreur réseau** : Problème de connexion
  - Action : Afficher un message d'erreur avec possibilité de réessayer
  - Message : "Erreur de connexion au serveur. Vérifiez votre connexion internet."

- **429 Rate Limiting** : Trop de requêtes
  - Message : "Trop de tentatives. Veuillez réessayer dans X secondes."

- **503 Service Unavailable** : Service temporairement indisponible
  - Message : "Le service est temporairement indisponible. Veuillez réessayer."

### 2. Filtrage automatique pour USER (CELs uniquement)

**Important** : Pour les utilisateurs avec le rôle `USER`, la liste des CELs est automatiquement filtrée selon leurs circonscriptions assignées.

**Comportement attendu :**
- Si l'utilisateur USER a des circonscriptions assignées : Seules les CELs de ces circonscriptions sont retournées
- Si l'utilisateur USER n'a pas de circonscriptions assignées : Tableau vide `[]`

**Recommandation frontend :**
```typescript
import { useSimpleLists } from '@/hooks/useSimpleLists';

const { cels, loading } = useSimpleLists();

if (!loading && cels.length === 0) {
  // Afficher un message informatif pour USER
  return (
    <div className="warning">
      <p>
        Aucune CEL disponible. 
        Veuillez contacter un administrateur pour vous assigner des circonscriptions.
      </p>
    </div>
  );
}
```

### 3. Performance et cache

**Recommandations :**
- Mettre en cache les listes simples (elles changent rarement)
- Utiliser un cache avec expiration (ex: 5-10 minutes)
- Recharger uniquement après certaines actions (ex: assignation de circonscription)

**Note** : Le projet utilise actuellement des hooks personnalisés avec `useState` et `useEffect`. Pour une gestion de cache plus avancée, vous pouvez utiliser React Query (TanStack Query) si disponible dans le projet.

**Exemple avec React Query (optionnel) :**
```typescript
import { useQuery } from '@tanstack/react-query';
import { listsApi } from '@/lib/api/lists';

export function useCirconscriptionsSimple() {
  return useQuery({
    queryKey: ['circonscriptions', 'simple'],
    queryFn: () => listsApi.getCirconscriptionsList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
  });
}
```

### 4. Format des données

**Circonscriptions :**
- Clé : `codCe` (code de la circonscription)
- Libellé : `libCe` (nom de la circonscription)
- Tri : Alphabétique par `libCe`

**CELs :**
- Clé : `codeCellule` (code de la CEL)
- Libellé : `libelleCellule` (nom de la CEL)
- Tri : Alphabétique par `libelleCellule`

---

## 📝 CHECKLIST D'INTÉGRATION

### Phase 1 : Configuration
- [x] ✅ URL de base configurée : `/api/backend` (proxy Next.js vers `/api/v1`)
- [x] ✅ Gestion du token via intercepteur (cookies httpOnly)
- [x] ✅ Service API existant : `lib/api/lists.ts`

### Phase 2 : Implémentation
- [ ] Ajouter `getCirconscriptionsList()` dans `lib/api/lists.ts`
- [x] ✅ `getCelsList()` existe déjà dans `lib/api/lists.ts`
- [x] ✅ Gestion des erreurs via `handleApiError` dans `lib/api/client.ts`
- [ ] Créer le hook `useSimpleLists()` dans `hooks/useSimpleLists.ts`

### Phase 3 : Intégration UI
- [ ] Intégrer dans les composants de sélection (Select, Autocomplete)
- [ ] Afficher les états de chargement
- [ ] Afficher les messages d'erreur
- [ ] Gérer le cas où la liste est vide (surtout pour USER)

### Phase 4 : Optimisation
- [ ] Mettre en cache les listes (optionnel mais recommandé)
- [ ] Implémenter le rechargement automatique si nécessaire
- [ ] Optimiser les performances (éviter les appels multiples)

### Phase 5 : Tests
- [ ] Tester avec différents rôles (SADMIN, ADMIN, USER)
- [ ] Tester la gestion des erreurs
- [ ] Tester le filtrage automatique pour USER (CELs)
- [ ] Tester avec des listes vides

---

## 🔗 RESSOURCES

### Endpoints complets
- **Circonscriptions** : `GET /api/v1/circonscriptions/list/simple`
  - Via proxy Next.js : `GET /api/backend/circonscriptions/list/simple`
- **CELs** : `GET /api/v1/cels/list/simple`
  - Via proxy Next.js : `GET /api/backend/cels/list/simple`

### Fichiers du projet
- **Service API** : `lib/api/lists.ts`
- **Client API** : `lib/api/client.ts`
- **Intercepteur** : `lib/api/interceptor.ts`
- **Hook personnalisé** : `hooks/useSimpleLists.ts` (à créer)

### Endpoints connexes
- `GET /api/v1/circonscriptions` - Liste complète avec pagination (via `circonscriptionsApi.getAll()`)
- `GET /api/v1/cels` - Liste complète avec pagination
- `GET /api/v1/cels/circonscription/:codeCirconscription` - CELs par circonscription

---

## 🚀 IMPLÉMENTATION DANS LE PROJET

### Étape 1 : Ajouter le type et la méthode dans `lib/api/lists.ts`

```typescript
// Ajouter le type SimpleCirconscription
export interface SimpleCirconscription {
  codCe: string;
  libCe: string;
}

// Ajouter la méthode dans listsApi
export const listsApi = {
  // ... méthodes existantes

  // ✨ NOUVEAU : Récupérer la liste simple des circonscriptions
  getCirconscriptionsList: async (): Promise<SimpleCirconscription[]> => {
    try {
      const response = await apiClient.get('/circonscriptions/list/simple');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ListsAPI] Erreur lors de la récupération des circonscriptions:', error);
      throw error;
    }
  },

  // Mettre à jour getFormLists pour inclure les circonscriptions
  getFormLists: async (): Promise<{
    departements: SimpleDepartement[];
    regions: SimpleRegion[];
    cels: SimpleCel[];
    circonscriptions: SimpleCirconscription[];
  }> => {
    try {
      const [departementsResult, regionsResult, celsResult, circonscriptionsResult] = 
        await Promise.allSettled([
          listsApi.getDepartementsList(),
          listsApi.getRegionsList(),
          listsApi.getCelsList(),
          listsApi.getCirconscriptionsList()
        ]);

      const departements = departementsResult.status === 'fulfilled' ? departementsResult.value : [];
      const regions = regionsResult.status === 'fulfilled' ? regionsResult.value : [];
      const cels = celsResult.status === 'fulfilled' ? celsResult.value : [];
      const circonscriptions = circonscriptionsResult.status === 'fulfilled' ? circonscriptionsResult.value : [];

      return { departements, regions, cels, circonscriptions };
    } catch (error: unknown) {
      console.error('❌ [ListsAPI] Erreur générale lors de la récupération des listes:', error);
      return { departements: [], regions: [], cels: [], circonscriptions: [] };
    }
  },
};
```

### Étape 2 : Créer le hook `hooks/useSimpleLists.ts`

Créer le fichier `hooks/useSimpleLists.ts` avec le code fourni dans la section "Hook personnalisé React" ci-dessus.

### Étape 3 : Utiliser dans vos composants

```typescript
import { useSimpleLists } from '@/hooks/useSimpleLists';
// ou
import { listsApi } from '@/lib/api/lists';
```

---

**Date de création** : 2025-01-XX  
**Version** : 1.0  
**Statut** : Documentation pour intégration frontend  
**Dernière mise à jour** : Adapté à la structure actuelle du projet

---

*Ce document fournit tous les éléments nécessaires pour intégrer les listes simples de circonscriptions et CELs dans votre application frontend. Les exemples de code sont adaptés à la structure actuelle du projet utilisant Next.js, TypeScript, et Axios avec intercepteurs.*

