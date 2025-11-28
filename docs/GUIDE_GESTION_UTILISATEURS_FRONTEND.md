# 👥 Guide d'utilisation de la gestion des utilisateurs - Frontend

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser l'API de gestion des utilisateurs depuis le frontend. Cette API permet de créer, lire, modifier et supprimer des utilisateurs, ainsi que de gérer leurs assignations de circonscriptions et cellules.

**Accès** : Uniquement pour les utilisateurs ayant les rôles **SADMIN** ou **ADMIN**.

**Architecture** : Ce projet utilise :
- **Next.js** avec proxy pour éviter les problèmes CORS
- **Axios** avec intercepteurs pour la gestion automatique des tokens
- **Cookies httpOnly** pour le stockage sécurisé des tokens (pas de localStorage)
- **TypeScript** pour la sécurité des types

---

## 🔐 Authentification

### ✅ Architecture sécurisée du projet

Ce projet utilise une architecture sécurisée avec :

1. **Cookies httpOnly** : Les tokens sont stockés dans des cookies httpOnly (non accessibles depuis JavaScript) pour prévenir les attaques XSS
2. **Proxy Next.js** : Toutes les requêtes passent par `/api/backend` qui est automatiquement réécrit vers `${NEXT_PUBLIC_API_URL}/api/v1`
3. **Intercepteurs Axios** : Les tokens sont automatiquement attachés aux requêtes via les intercepteurs
4. **Gestion automatique du refresh** : Les tokens expirés sont automatiquement rafraîchis

### Headers automatiques

Les headers sont automatiquement gérés par `apiClient` :

```typescript
// ✅ AUTOMATIQUE : Les headers sont gérés par les intercepteurs
// Authorization: Bearer <accessToken> (depuis les cookies httpOnly)
// Content-Type: application/json
```

### Récupération du token

**⚠️ IMPORTANT** : Dans ce projet, les tokens sont stockés dans des **cookies httpOnly** et ne sont **PAS accessibles depuis JavaScript**. L'intercepteur Axios les récupère automatiquement via une route API Next.js.

```typescript
// ❌ NE PAS FAIRE : Les tokens ne sont pas dans localStorage
// const token = localStorage.getItem('accessToken'); // ❌

// ✅ CORRECT : Utiliser apiClient qui gère automatiquement les tokens
import { apiClient } from '@/lib/api/client';
// Les tokens sont automatiquement attachés aux requêtes
```

---

## 📋 Types TypeScript

### ✅ Types existants dans le projet

Les types sont définis dans `types/auth.ts` et `lib/api/users.ts`. Voici les principaux :

#### UserResponseDto (depuis `types/auth.ts`)

```typescript
interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    code: string; // 'SADMIN' | 'ADMIN' | 'USER'
    name: string;
  };
  isActive: boolean;
  isConnected?: boolean;
  lastConnectionAt?: Date | string;
  // ✅ Structure selon la réponse réelle du backend
  circonscriptions?: {
    id: number;
    COD_CE: string;
    LIB_CE: string;
  }[];
  // ✅ Ancien format pour compatibilité
  departements?: {
    id: string;
    codeDepartement: string;
    libelleDepartement: string;
  }[];
  // ✅ Structure selon la réponse réelle du backend
  cellules?: {
    COD_CEL: string;
    LIB_CEL: string;
  }[];
  // ✅ Session active (nouveau champ)
  activeSession?: {
    createdAt: string;  // ISO string
    expiresAt: string;  // ISO string
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

#### CreateUserDto (depuis `types/auth.ts`)

```typescript
interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Min 8 caractères, majuscule, minuscule, chiffre, caractère spécial
  roleId?: string; // Optionnel, par défaut: USER
  departementCodes?: string[]; // Optionnel
  celCodes?: string[]; // Optionnel
  isActive?: boolean; // Optionnel, par défaut: true
}
```

#### Types depuis `lib/api/users.ts`

```typescript
// Types spécifiques à l'API users
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
  isActive: boolean;
  isConnected: boolean;
  lastConnectionAt: string;
  departements: {
    id: string;
    codeDepartement: string;
    libelleDepartement: string;
  }[];
  cellules: {
    id: string;
    codeCellule: string;
    libelleCellule: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  departementCodes?: string[];
  celCodes?: string[];
  isActive?: boolean;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  departementCodes?: string[];
  celCodes?: string[];
  isActive?: boolean;
}

interface AssignDepartmentsData {
  departementCodes: string[];
}

interface AssignCelsData {
  celCodes: string[];
}
```

---

## 🔗 Endpoints

### ✅ Utilisation de `usersApi`

Ce projet fournit déjà un service API complet dans `lib/api/users.ts`. Utilisez-le directement :

```typescript
import { usersApi } from '@/lib/api/users';
```

### 1. GET /api/v1/users - Liste des utilisateurs

Récupère la liste paginée des utilisateurs avec filtres optionnels.

**Permissions** : SADMIN, ADMIN

**Paramètres de requête** (optionnels) :
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)
- `search` : Recherche par email, prénom ou nom

**Réponse** : `UserListResponse`

**✅ Exemple avec `usersApi` (recommandé)** :

```typescript
import { usersApi } from '@/lib/api/users';

// Récupérer la liste des utilisateurs
const response = await usersApi.getUsers({
  page: 1,
  limit: 10,
  search: 'john' // Optionnel
});

console.log(response.users); // Tableau d'utilisateurs
console.log(response.total); // Nombre total
console.log(response.page); // Page actuelle
console.log(response.totalPages); // Nombre total de pages
```

**✅ Exemple avec `apiClient` directement** :

```typescript
import { apiClient, handleApiError } from '@/lib/api/client';

async function getUsers(page = 1, limit = 10, search = '') {
  try {
    // ✅ PROXY NEXT.JS : Utilise le proxy via apiClient
    // Requête : /api/backend/users?page=1&limit=10&search=john
    // Destination : ${NEXT_PUBLIC_API_URL}/api/v1/users?page=1&limit=10&search=john
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    const response = await apiClient.get(url);
    return response.data; // UserListResponse
  } catch (error) {
    // ✅ Gestion d'erreurs automatique avec handleApiError
    throw new Error(handleApiError(error));
  }
}
```

---

### 2. GET /api/v1/users/:id - Détails d'un utilisateur

Récupère les détails complets d'un utilisateur, incluant ses circonscriptions et cellules assignées.

**Permissions** : SADMIN, ADMIN

**Réponse** : `User`

**✅ Exemple avec `usersApi` (recommandé)** :

```typescript
import { usersApi } from '@/lib/api/users';

const user = await usersApi.getUser('userId123');
console.log(user.email);
console.log(user.circonscriptions);
console.log(user.cellules);
```

**✅ Exemple avec `apiClient` directement** :

```typescript
import { apiClient, handleApiError } from '@/lib/api/client';

async function getUserById(userId: string) {
  try {
    // ✅ PROXY NEXT.JS : Utilise le proxy via apiClient
    const response = await apiClient.get(`/users/${userId}`);
    return response.data; // User
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
```

---

### 3. POST /api/v1/users - Créer un utilisateur

Crée un nouvel utilisateur.

**Permissions** : SADMIN, ADMIN

**Body** : `CreateUserData` (depuis `lib/api/users.ts`)

**Réponse** : `User` (201 Created)

**Validation du mot de passe** :
- Minimum 8 caractères
- Au moins une majuscule (A-Z)
- Au moins une minuscule (a-z)
- Au moins un chiffre (0-9)
- Au moins un caractère spécial (@$!%*?&)

**✅ Exemple avec `usersApi` (recommandé)** :

```typescript
import { usersApi } from '@/lib/api/users';
import type { CreateUserData } from '@/lib/api/users';

const newUser = await usersApi.createUser({
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'Password123!',
  roleId: 'cmggvh7rp0000i8rcgipxpz4ua', // ID du rôle ADMIN
  isActive: true,
  departementCodes: ['001', '002'], // Optionnel
  celCodes: ['CEL001', 'CEL002'], // Optionnel
});

console.log('Utilisateur créé:', newUser.email);
```

**✅ Exemple avec `apiClient` directement** :

```typescript
import { apiClient, handleApiError } from '@/lib/api/client';
import type { CreateUserDto } from '@/types/auth';

async function createUser(userData: CreateUserDto) {
  try {
    // ✅ PROXY NEXT.JS : Utilise le proxy via apiClient
    const response = await apiClient.post('/users', userData);
    return response.data; // User
  } catch (error) {
    // ✅ Gestion d'erreurs automatique
    throw new Error(handleApiError(error));
  }
}
```

---

### 4. PATCH /api/v1/users/:id - Mettre à jour un utilisateur

Met à jour un utilisateur existant. Tous les champs sont optionnels.

**Permissions** : SADMIN, ADMIN

**Body** : `UpdateUserData` (tous les champs optionnels)

**Réponse** : `User` (200 OK)

**✅ Exemple avec `usersApi` (recommandé)** :

```typescript
import { usersApi } from '@/lib/api/users';

// Mettre à jour le nom
await usersApi.updateUser('userId123', {
  firstName: 'Jane',
  lastName: 'Smith',
});

// Désactiver l'utilisateur
await usersApi.updateUser('userId123', {
  isActive: false,
});

// Changer le rôle
await usersApi.updateUser('userId123', {
  roleId: 'nouveauRoleId',
});

// Mettre à jour les départements
await usersApi.updateUser('userId123', {
  departementCodes: ['001', '002'],
});
```

**✅ Exemple avec `apiClient` directement** :

```typescript
import { apiClient, handleApiError } from '@/lib/api/client';
import type { UpdateUserData } from '@/lib/api/users';

async function updateUser(userId: string, updateData: UpdateUserData) {
  try {
    // ✅ PROXY NEXT.JS : Utilise le proxy via apiClient
    const response = await apiClient.patch(`/users/${userId}`, updateData);
    return response.data; // User
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
```

---

### 5. DELETE /api/v1/users/:id - Supprimer un utilisateur

Supprime un utilisateur. Cette action est irréversible.

**Permissions** : SADMIN, ADMIN

**Réponse** : 204 No Content

**✅ Exemple avec `usersApi` (recommandé)** :

```typescript
import { usersApi } from '@/lib/api/users';

await usersApi.deleteUser('userId123');
```

**✅ Exemple avec `apiClient` directement** :

```typescript
import { apiClient, handleApiError } from '@/lib/api/client';

async function deleteUser(userId: string) {
  try {
    // ✅ PROXY NEXT.JS : Utilise le proxy via apiClient
    await apiClient.delete(`/users/${userId}`);
    // 204 No Content - pas de body
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
```

---

### 6. Assignation des départements et CELs

Ce projet utilise les départements et CELs plutôt que les circonscriptions directement. Les méthodes suivantes sont disponibles :

#### 6.1. PATCH /api/v1/users/:id/departements - Assigner des départements

**✅ Exemple avec `usersApi` (recommandé)** :

```typescript
import { usersApi } from '@/lib/api/users';

// Assigner des départements
const user = await usersApi.assignDepartments('userId123', {
  departementCodes: ['001', '002', '003']
});

console.log('Départements assignés:', user.departements);
```

#### 6.2. DELETE /api/v1/users/:id/departements - Retirer tous les départements

```typescript
const user = await usersApi.removeAllDepartments('userId123');
```

#### 6.3. PATCH /api/v1/users/:id/cels - Assigner des CELs

```typescript
const user = await usersApi.assignCels('userId123', {
  celCodes: ['CEL001', 'CEL002', 'CEL003']
});

console.log('CELs assignées:', user.cellules);
```

#### 6.4. DELETE /api/v1/users/:id/cels - Retirer toutes les CELs

```typescript
const user = await usersApi.removeAllCels('userId123');
```

**Note** : Dans ce projet, l'assignation des circonscriptions se fait via les départements. Les cellules peuvent être assignées directement ou automatiquement via les départements selon la logique backend.

---

## 🎨 Exemples d'utilisation dans React

### ✅ Hook personnalisé pour la gestion des utilisateurs (selon l'architecture du projet)

```typescript
import { useState, useCallback } from 'react';
import { usersApi } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import type { User, CreateUserData, UpdateUserData } from '@/lib/api/users';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchUsers: (page?: number, limit?: number, search?: string) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<User>;
  updateUser: (userId: string, updateData: UpdateUserData) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  assignDepartments: (userId: string, departementCodes: string[]) => Promise<User>;
  assignCels: (userId: string, celCodes: string[]) => Promise<User>;
  clearError: () => void;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // ✅ Récupération des utilisateurs avec pagination et recherche
  const fetchUsers = useCallback(async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersApi.getUsers({ page, limit, search });
      setUsers(response.users);
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

  // ✅ Création d'un utilisateur
  const createUser = useCallback(async (userData: CreateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await usersApi.createUser(userData);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return newUser;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Mise à jour d'un utilisateur
  const updateUser = useCallback(async (userId: string, updateData: UpdateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await usersApi.updateUser(userId, updateData);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return updatedUser;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Suppression d'un utilisateur
  const deleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await usersApi.deleteUser(userId);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Assignation de départements
  const assignDepartments = useCallback(async (userId: string, departementCodes: string[]): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await usersApi.assignDepartments(userId, { departementCodes });
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return user;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Assignation de CELs
  const assignCels = useCallback(async (userId: string, celCodes: string[]): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await usersApi.assignCels(userId, { celCodes });
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return user;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Nettoyage de l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    users,
    loading,
    error,
    meta,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    assignDepartments,
    assignCels,
    clearError,
  };
}
```

### ✅ Composant React d'exemple (selon l'architecture du projet)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/useUsers'; // Votre hook personnalisé
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function UsersList() {
  const {
    users,
    loading,
    error,
    meta,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    assignDepartments,
    clearError,
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers(1, 10);
  }, [fetchUsers]);

  const handleSearch = () => {
    fetchUsers(1, 10, searchTerm);
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'Password123!',
        roleId: 'cmggvh7rp0000i8rcgipxpz4ua',
        isActive: true,
      });
      toast.success('Utilisateur créé avec succès !');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleAssignDepartments = async (userId: string) => {
    try {
      await assignDepartments(userId, ['001', '002']);
      toast.success('Départements assignés avec succès !');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    try {
      await deleteUser(userId);
      toast.success('Utilisateur supprimé avec succès !');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  if (loading && users.length === 0) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par email, prénom ou nom..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Rechercher</Button>
            <Button onClick={handleCreateUser}>Créer un utilisateur</Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
                Fermer
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Départements</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.role.name}</td>
                    <td>{user.isActive ? 'Actif' : 'Inactif'}</td>
                    <td>{user.departements?.length || 0} département(s)</td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignDepartments(user.id)}
                      >
                        Assigner départements
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="ml-2"
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              Page {meta.page} sur {meta.totalPages} ({meta.total} utilisateur(s))
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchUsers(meta.page - 1, meta.limit, searchTerm)}
                disabled={meta.page === 1 || loading}
              >
                Précédent
              </Button>
              <Button
                onClick={() => fetchUsers(meta.page + 1, meta.limit, searchTerm)}
                disabled={meta.page >= meta.totalPages || loading}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔒 Gestion des erreurs

### ✅ Gestion automatique avec `handleApiError`

Ce projet utilise la fonction `handleApiError` qui gère automatiquement tous les codes d'erreur HTTP :

```typescript
import { handleApiError } from '@/lib/api/client';

try {
  await usersApi.createUser(userData);
} catch (error: unknown) {
  // ✅ Gestion automatique de tous les codes d'erreur
  const errorMessage = handleApiError(error);
  toast.error(errorMessage);
}
```

### Codes d'erreur HTTP gérés automatiquement

| Code | Signification | Gestion automatique |
|------|---------------|---------------------|
| `400` | Données invalides | Message d'erreur du backend |
| `401` | Non authentifié | "Session expirée, veuillez vous reconnecter" + redirection automatique via intercepteur |
| `403` | Rôle insuffisant | "Vous n'avez pas les permissions nécessaires..." |
| `404` | Utilisateur non trouvé | "Ressource non trouvée" |
| `409` | Email déjà utilisé | Message d'erreur du backend |
| `429` | Rate limiting | "Trop de tentatives. Veuillez réessayer dans X secondes." |
| `500+` | Erreur serveur | "Erreur serveur, veuillez réessayer plus tard" |
| `503` | Service indisponible | "Le service est temporairement indisponible..." |
| `ECONNABORTED` | Timeout | "La requête a expiré. Veuillez réessayer." |
| `NETWORK_ERROR` | Erreur réseau | "Erreur de connexion au serveur..." |

### ✅ Exemple de gestion d'erreurs dans un composant

```typescript
import { toast } from 'sonner';
import { handleApiError } from '@/lib/api/client';
import { usersApi } from '@/lib/api/users';

async function handleCreateUser(userData: CreateUserData) {
  try {
    const newUser = await usersApi.createUser(userData);
    toast.success('Utilisateur créé avec succès !');
    return newUser;
  } catch (error: unknown) {
    // ✅ Gestion automatique avec handleApiError
    const errorMessage = handleApiError(error);
    toast.error(errorMessage);
    throw error; // Re-lancer pour que le composant puisse gérer
  }
}
```

### ✅ Gestion automatique de la déconnexion

Les intercepteurs Axios gèrent automatiquement :
- **401 (Non authentifié)** : Redirection automatique vers `/auth/login`
- **Refresh automatique** : Les tokens expirés sont automatiquement rafraîchis
- **Gestion des cookies** : Les tokens sont automatiquement récupérés depuis les cookies httpOnly

---

## ⚠️ Validation du mot de passe côté frontend

Avant d'envoyer la requête, validez le mot de passe côté frontend pour une meilleure UX :

```javascript
function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  const errors = [];
  
  if (!minLength) errors.push('Au moins 8 caractères');
  if (!hasUpperCase) errors.push('Au moins une majuscule');
  if (!hasLowerCase) errors.push('Au moins une minuscule');
  if (!hasNumber) errors.push('Au moins un chiffre');
  if (!hasSpecialChar) errors.push('Au moins un caractère spécial (@$!%*?&)');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utilisation
const passwordValidation = validatePassword('Password123!');
if (!passwordValidation.isValid) {
  console.error('Erreurs de validation:', passwordValidation.errors);
}
```

---

## 📝 Notes importantes

### ✅ Architecture du projet

1. **Proxy Next.js** : 
   - Toutes les requêtes passent par `/api/backend` qui est automatiquement réécrit vers `${NEXT_PUBLIC_API_URL}/api/v1`
   - Pas besoin de gérer CORS manuellement
   - Configuration dans `next.config.ts`

2. **Cookies httpOnly** : 
   - Les tokens sont stockés dans des cookies httpOnly (non accessibles depuis JavaScript)
   - Plus sécurisé que localStorage (prévention des attaques XSS)
   - Les intercepteurs Axios récupèrent automatiquement les tokens

3. **Gestion automatique des tokens** : 
   - Les tokens sont automatiquement attachés aux requêtes via les intercepteurs
   - Refresh automatique des tokens expirés
   - Redirection automatique vers `/auth/login` en cas de 401

4. **Service API centralisé** : 
   - Utilisez `usersApi` depuis `lib/api/users.ts` au lieu d'appels directs
   - Gestion d'erreurs centralisée avec `handleApiError`
   - Types TypeScript stricts

### ✅ Fonctionnalités

5. **Pagination** : 
   - Utilisez les paramètres `page` et `limit` pour la pagination
   - La réponse inclut les métadonnées dans `meta` (total, page, limit, totalPages)

6. **Recherche** : 
   - La recherche fonctionne sur l'email, le prénom et le nom de famille (insensible à la casse)
   - Utilisez le paramètre `search` dans `usersApi.getUsers()`

7. **Assignation** : 
   - Les départements et CELs peuvent être assignés via `assignDepartments()` et `assignCels()`
   - Les assignations peuvent être réassignées à un autre utilisateur

8. **Gestion d'erreurs** : 
   - Utilisez `handleApiError()` pour une gestion automatique des erreurs
   - Les messages d'erreur sont localisés et adaptés au contexte

### ✅ Exemple de requête complète

```typescript
import { usersApi } from '@/lib/api/users';

// ✅ Avec usersApi (recommandé)
const response = await usersApi.getUsers({
  page: 1,
  limit: 10,
  search: 'john'
});

// ✅ Avec apiClient directement (si nécessaire)
import { apiClient } from '@/lib/api/client';

const response = await apiClient.get('/users', {
  params: {
    page: 1,
    limit: 10,
    search: 'john'
  }
});
```

### ✅ Structure des fichiers

```
lib/
  api/
    users.ts          # Service API pour les utilisateurs
    client.ts         # apiClient et handleApiError
    interceptor.ts    # Intercepteurs Axios pour les tokens
types/
  auth.ts            # Types TypeScript pour l'authentification
hooks/
  useUsers.ts        # Hook personnalisé (à créer selon vos besoins)
```

---

**Dernière mise à jour** : 2025-11-28
**Architecture** : Next.js 14+ avec proxy, Axios, cookies httpOnly, TypeScript

