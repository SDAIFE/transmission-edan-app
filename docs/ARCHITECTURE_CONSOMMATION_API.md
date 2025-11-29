# 🏗️ ARCHITECTURE DE CONSOMMATION D'API
## Guide Complet - Processus de Récupération des Utilisateurs

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture en couches](#architecture-en-couches)
3. [Processus détaillé : Récupération des utilisateurs](#processus-détaillé--récupération-des-utilisateurs)
4. [Étapes clés pour consommer une API](#étapes-clés-pour-consommer-une-api)
5. [Exemples pratiques](#exemples-pratiques)
6. [Bonnes pratiques](#bonnes-pratiques)

---

## 🎯 VUE D'ENSEMBLE

Ce document explique le processus complet de consommation d'API dans ce projet, en utilisant l'exemple concret de la récupération des utilisateurs. Il décrit l'architecture en couches et les étapes clés pour intégrer une nouvelle API.

### Flux général

```
┌─────────────┐
│  Composant  │  (UI - React Component)
│   React     │
└──────┬──────┘
       │
       │ 1. Appel du hook
       ▼
┌─────────────┐
│   Hook      │  (hooks/useUsers.ts)
│ Personnalisé│
└──────┬──────┘
       │
       │ 2. Appel du service API
       ▼
┌─────────────┐
│ Service API │  (lib/api/users.ts)
│   usersApi  │
└──────┬──────┘
       │
       │ 3. Utilise apiClient
       ▼
┌─────────────┐
│  apiClient  │  (lib/api/client.ts)
│   (Axios)   │
└──────┬──────┘
       │
       │ 4. Intercepteurs
       ▼
┌─────────────┐
│ Intercepteur│  (lib/api/interceptor.ts)
│   Axios     │
└──────┬──────┘
       │
       │ 5. Proxy Next.js
       ▼
┌─────────────┐
│ Proxy Next  │  (next.config.ts)
│     .js     │
└──────┬──────┘
       │
       │ 6. Requête HTTP
       ▼
┌─────────────┐
│   Backend   │  (API REST)
│   Server    │
└─────────────┘
```

---

## 🏛️ ARCHITECTURE EN COUCHES

### Couche 1 : Composants React (UI)

**Rôle** : Interface utilisateur, affichage des données

**Fichier** : `components/users/users-page-content.tsx`

**Responsabilités** :
- Afficher les données à l'utilisateur
- Gérer les interactions utilisateur (clics, formulaires)
- Utiliser les hooks personnalisés pour récupérer les données
- Gérer les états UI (modales, filtres, etc.)

```typescript
// Exemple : Composant utilisant le hook
export function UsersPageContent() {
  const { users, loading, error, fetchUsers } = useUsers();
  
  useEffect(() => {
    fetchUsers(1, 10, '');
  }, []);
  
  return (
    <div>
      {loading && <Loader />}
      {error && <ErrorDisplay error={error} />}
      <UsersTable users={users} />
    </div>
  );
}
```

### Couche 2 : Hooks Personnalisés (Logique métier)

**Rôle** : Gestion d'état React, logique métier

**Fichier** : `hooks/useUsers.ts`

**Responsabilités** :
- Gérer l'état local (loading, error, data)
- Appeler les services API
- Transformer les données si nécessaire
- Gérer les erreurs avec `handleApiError`
- Fournir une interface simple aux composants

```typescript
// Exemple : Hook personnalisé
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUsers = useCallback(async (page, limit, search) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersApi.getUsers({ page, limit, search });
      setUsers(response.users);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { users, loading, error, fetchUsers };
}
```

### Couche 3 : Services API (Couche d'abstraction)

**Rôle** : Abstraction des appels API, transformation des données

**Fichier** : `lib/api/users.ts`

**Responsabilités** :
- Définir les méthodes API (getUsers, createUser, etc.)
- Construire les URLs avec paramètres
- Transformer les réponses backend en format frontend
- Gérer les cas spéciaux (doublons, formats différents)
- Utiliser `apiClient` pour les requêtes HTTP

```typescript
// Exemple : Service API
export const usersApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UserListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const url = queryParams.toString() 
      ? `/users?${queryParams.toString()}` 
      : '/users';
    
    const response = await apiClient.get(url);
    
    // Transformation des données backend → frontend
    return transformBackendResponse(response.data);
  },
};
```

### Couche 4 : Client API (Configuration Axios)

**Rôle** : Configuration de base d'Axios, utilitaires

**Fichier** : `lib/api/client.ts`

**Responsabilités** :
- Exporter `apiClient` et `uploadClient`
- Fournir `handleApiError` pour la gestion centralisée des erreurs
- Fournir `buildQueryParams` pour construire les URLs
- Définir les types de réponses API

```typescript
// Exemple : Client API
export { apiClient, uploadClient } from './interceptor';

export const handleApiError = (error: unknown): string => {
  const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
  
  if (errorObj.response?.data?.message) {
    return errorObj.response.data.message;
  }
  
  if (errorObj.response?.status === 401) {
    return 'Session expirée, veuillez vous reconnecter';
  }
  
  // ... autres cas d'erreur
  
  return 'Une erreur inattendue s\'est produite';
};
```

### Couche 5 : Intercepteurs (Authentification & Gestion d'erreurs)

**Rôle** : Gestion automatique de l'authentification et des erreurs

**Fichier** : `lib/api/interceptor.ts`

**Responsabilités** :
- Ajouter automatiquement le token JWT aux requêtes
- Récupérer le token depuis les cookies httpOnly
- Gérer le refresh automatique des tokens expirés
- Gérer les erreurs réseau et timeouts
- Déclencher les événements de session expirée

```typescript
// Exemple : Intercepteur de requête
apiClient.interceptors.request.use(
  async (config) => {
    // Récupérer le token depuis les cookies httpOnly
    const token = await getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Exemple : Intercepteur de réponse
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si 401, tenter de rafraîchir le token
    if (error.response?.status === 401 && !error.config._retry) {
      const newToken = await authService.refreshToken();
      // Rejouer la requête avec le nouveau token
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Couche 6 : Proxy Next.js (Routage)

**Rôle** : Proxy des requêtes vers le backend

**Fichier** : `next.config.ts`

**Responsabilités** :
- Transformer les URLs `/api/backend/*` en URLs backend réelles
- Éviter les problèmes CORS
- Centraliser la configuration de l'URL backend

```typescript
// Exemple : Configuration du proxy
async rewrites() {
  return [
    {
      source: '/api/backend/:path*',
      destination: process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
        : 'http://localhost:3001/api/v1/:path*',
    },
  ];
}
```

---

## 🔄 PROCESSUS DÉTAILLÉ : RÉCUPÉRATION DES UTILISATEURS

### Étape 1 : Le composant déclenche l'action

**Fichier** : `components/users/users-page-content.tsx`

```typescript
export function UsersPageContent() {
  // ✅ Utilisation du hook personnalisé
  const { users, loading, error, fetchUsers } = useUsers();
  
  // ✅ Déclenchement au montage du composant
  useEffect(() => {
    if (isAuthenticated && canManageUsers) {
      fetchUsers(1, 10, ''); // page=1, limit=10, search=''
    }
  }, [isAuthenticated, canManageUsers, fetchUsers]);
  
  // ✅ Affichage des données
  return (
    <UsersTable users={users} loading={loading} />
  );
}
```

**Ce qui se passe** :
1. Le composant monte
2. Le `useEffect` se déclenche
3. Appel de `fetchUsers(1, 10, '')`

---

### Étape 2 : Le hook gère l'état et appelle le service

**Fichier** : `hooks/useUsers.ts`

```typescript
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUsers = useCallback(async (page = 1, limit = 10, search = '') => {
    // ✅ 1. Mettre à jour l'état de chargement
    setLoading(true);
    setError(null);
    
    try {
      // ✅ 2. Appeler le service API
      const response = await usersApi.getUsers({ page, limit, search });
      
      // ✅ 3. Mettre à jour l'état avec les données
      setUsers(response.users);
      setMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: unknown) {
      // ✅ 4. Gérer les erreurs
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      // ✅ 5. Réinitialiser l'état de chargement
      setLoading(false);
    }
  }, []);
  
  return { users, loading, error, fetchUsers };
}
```

**Ce qui se passe** :
1. `setLoading(true)` - Affiche le loader
2. `setError(null)` - Réinitialise les erreurs
3. Appel de `usersApi.getUsers({ page, limit, search })`
4. Si succès : `setUsers(response.users)`
5. Si erreur : `setError(errorMessage)`
6. `setLoading(false)` - Cache le loader

---

### Étape 3 : Le service API construit la requête

**Fichier** : `lib/api/users.ts`

```typescript
export const usersApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UserListResponse> => {
    try {
      // ✅ 1. Construire les paramètres de requête
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      // ✅ 2. Construire l'URL
      const queryString = queryParams.toString();
      const url = queryString ? `/users?${queryString}` : '/users';
      // Résultat : '/users?page=1&limit=10&search='
      
      // ✅ 3. Appeler apiClient
      const response = await apiClient.get(url);
      
      // ✅ 4. Transformer la réponse backend
      const backendResponse = response.data;
      // Format backend : { data: [...], meta: {...} }
      // Format frontend : { users: [...], total: ..., page: ..., limit: ..., totalPages: ... }
      
      if (backendResponse.data && backendResponse.meta) {
        // Dédoublonner les utilisateurs
        const uniqueUsersMap = new Map<string, User>();
        backendResponse.data.forEach((user: User) => {
          if (user.id && !uniqueUsersMap.has(user.id)) {
            uniqueUsersMap.set(user.id, user);
          }
        });
        const uniqueUsers = Array.from(uniqueUsersMap.values());
        
        // Retourner le format frontend
        return {
          users: uniqueUsers,
          total: backendResponse.meta.total,
          page: backendResponse.meta.page,
          limit: backendResponse.meta.limit,
          totalPages: backendResponse.meta.totalPages,
        };
      }
      
      // Fallback si format inattendu
      return { users: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la récupération:', error);
      throw error; // Propager l'erreur au hook
    }
  },
};
```

**Ce qui se passe** :
1. Construction de l'URL avec paramètres : `/users?page=1&limit=10&search=`
2. Appel de `apiClient.get(url)`
3. Réception de la réponse backend
4. Transformation du format backend → frontend
5. Dédoublonnage des utilisateurs
6. Retour des données transformées

---

### Étape 4 : L'intercepteur ajoute l'authentification

**Fichier** : `lib/api/interceptor.ts`

```typescript
// ✅ Intercepteur de requête
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // ✅ 1. Récupérer le token depuis les cookies httpOnly
      const token = await getTokenFromCookies();
      // getTokenFromCookies() fait un fetch('/api/auth/token')
      // qui retourne le token depuis les cookies sécurisés
      
      if (token) {
        // ✅ 2. Ajouter le header Authorization
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // ✅ 3. Retourner la config modifiée
      return config;
    } catch (error) {
      // Si erreur, continuer sans token (le backend retournera 401)
      return config;
    }
  }
);
```

**Ce qui se passe** :
1. `apiClient.get('/users?page=1&limit=10')` est intercepté
2. Appel de `getTokenFromCookies()` qui fait `fetch('/api/auth/token')`
3. Le token est récupéré depuis les cookies httpOnly
4. Ajout de `Authorization: Bearer <token>` dans les headers
5. La requête continue avec les headers modifiés

**Headers finaux** :
```http
GET /api/backend/users?page=1&limit=10 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

### Étape 5 : Le proxy Next.js route la requête

**Fichier** : `next.config.ts`

```typescript
async rewrites() {
  return [
    {
      source: '/api/backend/:path*',
      destination: process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
        : 'http://localhost:3001/api/v1/:path*',
    },
  ];
}
```

**Ce qui se passe** :
1. La requête arrive à Next.js : `GET /api/backend/users?page=1&limit=10`
2. Next.js applique le rewrite
3. Transformation : `/api/backend/users` → `http://localhost:3001/api/v1/users`
4. La requête est envoyée au backend avec tous les headers

**Requête finale au backend** :
```http
GET http://localhost:3001/api/v1/users?page=1&limit=10 HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

### Étape 6 : Le backend traite la requête

**Backend** : API REST (NestJS/Express/etc.)

**Ce qui se passe** :
1. Le backend reçoit la requête
2. Validation du token JWT
3. Vérification des permissions (SADMIN/ADMIN)
4. Exécution de la logique métier
5. Retour de la réponse

**Réponse backend** :
```json
{
  "data": [
    {
      "id": "1",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": { "id": "1", "code": "ADMIN", "name": "Administrateur" },
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### Étape 7 : L'intercepteur gère la réponse

**Fichier** : `lib/api/interceptor.ts`

```typescript
// ✅ Intercepteur de réponse
apiClient.interceptors.response.use(
  (response) => {
    // ✅ Succès : retourner la réponse telle quelle
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ✅ Si erreur 401 (token expiré)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // ✅ Tenter de rafraîchir le token
        const newToken = await authService.refreshToken();
        
        if (newToken) {
          // ✅ Rejouer la requête avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // ✅ Si le refresh échoue, supprimer les cookies et déconnecter
        await deleteAuthCookie();
        window.dispatchEvent(new CustomEvent('auth-session-expired'));
        return Promise.reject(refreshError);
      }
    }
    
    // ✅ Autres erreurs : propager l'erreur
    return Promise.reject(error);
  }
);
```

**Ce qui se passe** :
1. Si succès (200) : retourner la réponse
2. Si 401 (token expiré) :
   - Tenter de rafraîchir le token
   - Si succès : rejouer la requête avec le nouveau token
   - Si échec : déconnecter l'utilisateur
3. Autres erreurs : propager l'erreur

---

### Étape 8 : Retour au service API

**Fichier** : `lib/api/users.ts`

**Ce qui se passe** :
1. Réception de la réponse transformée par l'intercepteur
2. Transformation du format backend → frontend
3. Retour des données au hook

---

### Étape 9 : Retour au hook

**Fichier** : `hooks/useUsers.ts`

**Ce qui se passe** :
1. Réception des données du service API
2. Mise à jour de l'état : `setUsers(response.users)`
3. Mise à jour des métadonnées : `setMeta({ ... })`
4. Réinitialisation : `setLoading(false)`

---

### Étape 10 : Mise à jour de l'UI

**Fichier** : `components/users/users-page-content.tsx`

**Ce qui se passe** :
1. Le hook retourne les nouvelles données
2. React détecte le changement d'état
3. Le composant se re-rend avec les nouvelles données
4. L'utilisateur voit la liste des utilisateurs

---

## 📝 ÉTAPES CLÉS POUR CONSOMMER UNE API

### 1. Créer le service API

**Fichier** : `lib/api/nom-du-service.ts`

```typescript
import { apiClient } from './client';

// ✅ 1. Définir les types
export interface MonObjet {
  id: string;
  name: string;
}

export interface MonObjetListResponse {
  items: MonObjet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ 2. Créer le service
export const monServiceApi = {
  // ✅ 3. Méthode GET (liste)
  getItems: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<MonObjetListResponse> => {
    try {
      // Construire les paramètres
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      // Construire l'URL
      const url = queryParams.toString() 
        ? `/items?${queryParams.toString()}` 
        : '/items';
      
      // Appeler l'API
      const response = await apiClient.get(url);
      
      // Transformer la réponse si nécessaire
      return {
        items: response.data.data || [],
        total: response.data.meta?.total || 0,
        page: response.data.meta?.page || 1,
        limit: response.data.meta?.limit || 10,
        totalPages: response.data.meta?.totalPages || 0,
      };
    } catch (error: unknown) {
      console.error('❌ [MonServiceAPI] Erreur:', error);
      throw error;
    }
  },
  
  // ✅ 4. Méthode GET (détail)
  getItem: async (id: string): Promise<MonObjet> => {
    try {
      const response = await apiClient.get(`/items/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [MonServiceAPI] Erreur:', error);
      throw error;
    }
  },
  
  // ✅ 5. Méthode POST (création)
  createItem: async (data: Partial<MonObjet>): Promise<MonObjet> => {
    try {
      const response = await apiClient.post('/items', data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [MonServiceAPI] Erreur:', error);
      throw error;
    }
  },
  
  // ✅ 6. Méthode PATCH (mise à jour)
  updateItem: async (id: string, data: Partial<MonObjet>): Promise<MonObjet> => {
    try {
      const response = await apiClient.patch(`/items/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [MonServiceAPI] Erreur:', error);
      throw error;
    }
  },
  
  // ✅ 7. Méthode DELETE (suppression)
  deleteItem: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/items/${id}`);
    } catch (error: unknown) {
      console.error('❌ [MonServiceAPI] Erreur:', error);
      throw error;
    }
  },
};
```

---

### 2. Exporter le service

**Fichier** : `lib/api/index.ts`

```typescript
// Ajouter l'export
export { monServiceApi } from './nom-du-service';
export type { MonObjet, MonObjetListResponse } from './nom-du-service';
```

---

### 3. Créer le hook personnalisé

**Fichier** : `hooks/useMonService.ts`

```typescript
import { useState, useCallback } from 'react';
import { monServiceApi, type MonObjet } from '@/lib/api/nom-du-service';
import { handleApiError } from '@/lib/api/client';

interface UseMonServiceReturn {
  items: MonObjet[];
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchItems: (page?: number, limit?: number, search?: string) => Promise<void>;
  createItem: (data: Partial<MonObjet>) => Promise<MonObjet>;
  updateItem: (id: string, data: Partial<MonObjet>) => Promise<MonObjet>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useMonService(): UseMonServiceReturn {
  const [items, setItems] = useState<MonObjet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  
  // ✅ Récupération
  const fetchItems = useCallback(async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await monServiceApi.getItems({ page, limit, search });
      setItems(response.items);
      setMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ✅ Création
  const createItem = useCallback(async (data: Partial<MonObjet>): Promise<MonObjet> => {
    setLoading(true);
    setError(null);
    
    try {
      const newItem = await monServiceApi.createItem(data);
      await fetchItems(meta.page, meta.limit);
      return newItem;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchItems]);
  
  // ✅ Mise à jour
  const updateItem = useCallback(async (id: string, data: Partial<MonObjet>): Promise<MonObjet> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedItem = await monServiceApi.updateItem(id, data);
      await fetchItems(meta.page, meta.limit);
      return updatedItem;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchItems]);
  
  // ✅ Suppression
  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await monServiceApi.deleteItem(id);
      await fetchItems(meta.page, meta.limit);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchItems]);
  
  // ✅ Nettoyage de l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    items,
    loading,
    error,
    meta,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  };
}
```

---

### 4. Utiliser dans un composant

**Fichier** : `components/mon-service/mon-service-page-content.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useMonService } from '@/hooks/useMonService';

export function MonServicePageContent() {
  // ✅ Utiliser le hook
  const { items, loading, error, fetchItems, clearError } = useMonService();
  
  // ✅ Charger les données au montage
  useEffect(() => {
    fetchItems(1, 10, '');
  }, [fetchItems]);
  
  // ✅ Afficher les erreurs
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="underline text-sm">
            Fermer
          </button>
        </div>
      </div>
    );
  }
  
  // ✅ Afficher le loader
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  // ✅ Afficher les données
  return (
    <div>
      <h1>Mes Items</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## ✅ BONNES PRATIQUES

### 1. Toujours utiliser `apiClient`

❌ **Mauvais** :
```typescript
const response = await fetch('http://localhost:3001/api/v1/users');
```

✅ **Bon** :
```typescript
const response = await apiClient.get('/users');
```

**Pourquoi** :
- Gestion automatique de l'authentification
- Proxy Next.js configuré
- Gestion centralisée des erreurs
- Pas de problèmes CORS

---

### 2. Utiliser `handleApiError` pour les erreurs

❌ **Mauvais** :
```typescript
catch (error) {
  setError('Une erreur est survenue');
}
```

✅ **Bon** :
```typescript
catch (err: unknown) {
  const errorMessage = handleApiError(err);
  setError(errorMessage);
}
```

**Pourquoi** :
- Messages d'erreur cohérents
- Gestion de tous les cas (401, 403, 500, réseau, etc.)
- Messages adaptés à l'utilisateur

---

### 3. Créer des hooks personnalisés

❌ **Mauvais** :
```typescript
// Dans le composant
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch('/api/backend/items')
    .then(res => res.json())
    .then(data => setItems(data))
    .finally(() => setLoading(false));
}, []);
```

✅ **Bon** :
```typescript
// Hook personnalisé
const { items, loading, fetchItems } = useMonService();

useEffect(() => {
  fetchItems();
}, [fetchItems]);
```

**Pourquoi** :
- Réutilisabilité
- Séparation des responsabilités
- Tests plus faciles
- Logique métier centralisée

---

### 4. Transformer les données au niveau du service

❌ **Mauvais** :
```typescript
// Dans le composant
const response = await apiClient.get('/users');
const users = response.data.data.map(user => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`
}));
```

✅ **Bon** :
```typescript
// Dans le service API
getUsers: async () => {
  const response = await apiClient.get('/users');
  return response.data.data.map(user => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  }));
}
```

**Pourquoi** :
- Transformation centralisée
- Composants plus simples
- Réutilisabilité

---

### 5. Gérer les états de chargement et d'erreur

✅ **Bon** :
```typescript
const { items, loading, error, fetchItems } = useMonService();

if (loading) return <Loader />;
if (error) return <ErrorDisplay error={error} />;
return <ItemsList items={items} />;
```

**Pourquoi** :
- Meilleure UX
- Feedback visuel pour l'utilisateur
- Gestion des erreurs claire

---

## 📊 RÉSUMÉ DU FLUX COMPLET

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPOSANT REACT                          │
│  - Déclenche l'action                                       │
│  - Affiche les données                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ useMonService()
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOOK PERSONNALISÉ                        │
│  - Gère l'état (loading, error, data)                      │
│  - Appelle le service API                                   │
│  - Gère les erreurs                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ monServiceApi.getItems()
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE API                              │
│  - Construit l'URL avec paramètres                          │
│  - Appelle apiClient                                        │
│  - Transforme les données                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ apiClient.get('/items')
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    INTERCEPTEUR REQUEST                     │
│  - Récupère le token depuis cookies                         │
│  - Ajoute Authorization header                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ GET /api/backend/items
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROXY NEXT.JS                            │
│  - Transforme /api/backend/* → backend/api/v1/*            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ GET http://backend/api/v1/items
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│  - Valide le token                                          │
│  - Exécute la logique métier                                │
│  - Retourne les données                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Response JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    INTERCEPTEUR RESPONSE                    │
│  - Gère les erreurs 401 (refresh token)                    │
│  - Retourne la réponse                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ response.data
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE API                              │
│  - Transforme les données                                   │
│  - Retourne au hook                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ transformedData
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOOK PERSONNALISÉ                       │
│  - Met à jour l'état                                        │
│  - Retourne les données                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ { items, loading, error }
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    COMPOSANT REACT                          │
│  - Re-render avec les nouvelles données                     │
│  - Affiche à l'utilisateur                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 RESSOURCES

### Fichiers clés du projet

- **Client API** : `lib/api/client.ts`
- **Intercepteurs** : `lib/api/interceptor.ts`
- **Service Users** : `lib/api/users.ts`
- **Hook Users** : `hooks/useUsers.ts`
- **Composant Users** : `components/users/users-page-content.tsx`
- **Configuration Proxy** : `next.config.ts`

### Documentation connexe

- `docs/PROMPT_FRONTEND_LISTES_SIMPLES.md` - Guide pour les listes simples
- `docs/GUIDE_GESTION_UTILISATEURS_FRONTEND.md` - Guide spécifique utilisateurs

---

**Date de création** : 2025-01-XX  
**Version** : 1.0  
**Statut** : Documentation d'architecture

---

*Ce document fournit une vue complète de l'architecture de consommation d'API dans ce projet. Utilisez-le comme référence pour intégrer de nouvelles APIs en suivant les mêmes patterns et bonnes pratiques.*

