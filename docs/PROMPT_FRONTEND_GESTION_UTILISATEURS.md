# 👥 PROMPT FRONTEND : GESTION COMPLÈTE DES UTILISATEURS
## API Élections Législatives - Création, Modification et Suppression

---

## 📋 CONTEXTE ET OBJECTIF

### Vue d'ensemble
Ce document décrit l'intégration frontend complète de la gestion des utilisateurs dans le contexte des **élections législatives**. La particularité de cette API est que **les CELs (Cellules Électorales Locales) sont automatiquement assignées** par le backend en fonction des circonscriptions assignées à l'utilisateur.

**Points importants :**
- ✅ **Pas de transmission de CELs** : Le frontend ne transmet jamais les codes de CELs
- ✅ **Circonscriptions uniquement** : Seules les circonscriptions sont transmises lors de la création/modification
- ✅ **Assignation automatique** : Le backend calcule et assigne automatiquement toutes les CELs appartenant aux circonscriptions
- ✅ **Séparation des responsabilités** : Modification des données personnelles séparée de l'assignation des circonscriptions

### Architecture du projet
Ce document est adapté à la structure actuelle du projet :
- **Client API** : `lib/api/client.ts` avec `apiClient` (Axios configuré)
- **Intercepteurs** : `lib/api/interceptor.ts` (gestion automatique des tokens via cookies httpOnly)
- **Service Users** : `lib/api/users.ts` pour les opérations CRUD
- **Hooks personnalisés** : `hooks/useUsers.ts` pour la gestion d'état React
- **Gestion d'erreurs** : `handleApiError` depuis `lib/api/client.ts`
- **Proxy Next.js** : `next.config.ts` (rewrite `/api/backend/*` → backend `/api/v1/*`)

---

## 🔗 ENDPOINTS DISPONIBLES

### 1. Création d'utilisateur
```
POST /api/v1/users
```
Via proxy Next.js : `POST /api/backend/users`

### 2. Modification des données personnelles
```
PATCH /api/v1/users/:id
```
Via proxy Next.js : `PATCH /api/backend/users/:id`

**Note** : Le projet utilise `PATCH` au lieu de `PUT` pour la modification partielle.

### 3. Modification des circonscriptions
```
POST /api/v1/users/:id/circonscriptions
```
Via proxy Next.js : `POST /api/backend/users/:id/circonscriptions`

**⚠️ À IMPLÉMENTER** : Cet endpoint n'existe pas encore dans le projet actuel.

### 4. Suppression d'utilisateur
```
DELETE /api/v1/users/:id
```
Via proxy Next.js : `DELETE /api/backend/users/:id`

### 5. Récupération d'un utilisateur
```
GET /api/v1/users/:id
```
Via proxy Next.js : `GET /api/backend/users/:id`

### 6. Liste des utilisateurs
```
GET /api/v1/users?page=1&limit=10&search=
```
Via proxy Next.js : `GET /api/backend/users?page=1&limit=10&search=`

---

## 📝 1. CRÉATION D'UTILISATEUR

### Endpoint
```
POST /api/v1/users
```
Via proxy Next.js : `POST /api/backend/users`

### Authentification
- **Requis** : Oui (JWT Bearer Token)
- **Header** : `Authorization: Bearer <token>`
- **Gestion automatique** : L'intercepteur dans `lib/api/interceptor.ts` ajoute automatiquement le token depuis les cookies httpOnly

### Permissions
- **SADMIN** : ✅ Peut créer des utilisateurs
- **ADMIN** : ✅ Peut créer des utilisateurs
- **USER** : ❌ Accès interdit

### Body : `CreateUserDto`

```typescript
{
  email: string,                    // ✅ Requis - Email unique
  firstName: string,                 // ✅ Requis - Prénom
  lastName: string,                  // ✅ Requis - Nom
  password: string,                  // ✅ Requis - Mot de passe fort
  roleId?: string,                   // Optionnel - Rôle (défaut: USER)
  circonscriptionCodes?: string[],   // ✅ Optionnel - Codes des circonscriptions (COD_CE)
  isActive?: boolean                 // Optionnel - Statut actif (défaut: true)
}
```

**⚠️ IMPORTANT** :
- ❌ **Ne PAS** transmettre `celCodes` (sera rejeté ou ignoré)
- ❌ **Ne PAS** transmettre `departementCodes` (remplacé par `circonscriptionCodes`)
- ✅ Seules les `circonscriptionCodes` sont transmises
- ✅ Les CELs seront **automatiquement assignées** par le backend

**⚠️ ÉTAT ACTUEL DU PROJET** :
- Le projet utilise actuellement `departementCodes` et `celCodes` dans `lib/api/users.ts`
- **Migration nécessaire** : Remplacer par `circonscriptionCodes` uniquement
- Voir section [Migration](#migration-requise) pour les détails

### Réponse

**Succès (201 Created)**
```json
{
  "id": "usr_abc123",
  "email": "agent.cei@example.ci",
  "firstName": "Jean",
  "lastName": "Kouassi",
  "role": {
    "id": "USER",
    "code": "USER",
    "name": "Utilisateur"
  },
  "isActive": true,
  "circonscriptions": [
    {
      "id": 1,
      "COD_CE": "001",
      "LIB_CE": "ABIDJAN 1"
    },
    {
      "id": 2,
      "COD_CE": "002",
      "LIB_CE": "ABIDJAN 2"
    }
  ],
  "cellules": [
    {
      "COD_CEL": "CEL001",
      "LIB_CEL": "CEL COCODY"
    },
    {
      "COD_CEL": "CEL002",
      "LIB_CEL": "CEL PLATEAU"
    }
  ],
  "activeSession": null,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

**Note** : Les `cellules` dans la réponse sont **automatiquement calculées** par le backend et ne doivent **jamais** être transmises lors de la création.

### Erreurs possibles

1. **Email déjà existant** : `409 Conflict`
   ```json
   {
     "statusCode": 409,
     "message": "Un utilisateur avec cet email existe déjà"
   }
   ```

2. **Rôle invalide** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Le rôle avec l'ID \"XXX\" n'existe pas"
   }
   ```

3. **Circonscriptions inexistantes** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Les circonscriptions suivantes n'existent pas : 999, 888"
   }
   ```

4. **Validation du DTO** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": [
       "email must be an email",
       "password is too weak",
       "firstName must be a string"
     ],
     "error": "Bad Request"
   }
   ```

### Exemple d'intégration (Structure actuelle du projet)

#### Service API : `lib/api/users.ts`

```typescript
import { apiClient } from './client';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  circonscriptionCodes?: string[]; // ✅ NOUVEAU : Utiliser circonscriptionCodes
  isActive?: boolean;
}

export const usersApi = {
  createUser: async (userData: CreateUserData): Promise<User> => {
    try {
      // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
      // Pas besoin de token manuel, les cookies httpOnly sont inclus automatiquement
      const response = await apiClient.post('/users', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        roleId: userData.roleId,
        circonscriptionCodes: userData.circonscriptionCodes || [],
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        // ❌ NE PAS inclure celCodes - sera automatiquement calculé par le backend
      });
      
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la création:', error);
      throw error;
    }
  },
};
```

#### Hook personnalisé : `hooks/useUsers.ts`

```typescript
import { useState, useCallback } from 'react';
import { usersApi, type CreateUserData } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createUser = useCallback(async (userData: CreateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await usersApi.createUser(userData);
      // Rafraîchir la liste après création
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
  
  return { createUser, loading, error };
}
```

#### Composant React : `components/modals/create-user-modal.tsx`

```typescript
import { useUsers } from '@/hooks/useUsers';
import { useSimpleLists } from '@/hooks/useSimpleLists';
import { listsApi } from '@/lib/api/lists';

export function CreateUserModal({ open, onOpenChange, onSuccess }: CreateUserModalProps) {
  const { createUser, loading, error } = useUsers();
  const { circonscriptions } = useSimpleLists(); // ✅ Utiliser le hook pour les circonscriptions
  const [selectedCirconscriptions, setSelectedCirconscriptions] = useState<string[]>([]);
  
  const handleSubmit = async (formData: CreateUserFormData) => {
    try {
      const newUser = await createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        roleId: formData.roleId,
        circonscriptionCodes: selectedCirconscriptions, // ✅ Utiliser circonscriptionCodes
        isActive: formData.isActive,
        // ❌ NE PAS inclure celCodes
      });
      
      toast.success('Utilisateur créé avec succès');
      onSuccess?.();
    } catch (err) {
      // L'erreur est gérée par le hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... champs du formulaire ... */}
      
      {/* ✅ Sélection des circonscriptions */}
      <MultiSelect
        label="Circonscriptions (optionnel)"
        options={circonscriptions.map(c => ({
          value: c.codCe,
          label: c.libCe,
        }))}
        value={selectedCirconscriptions}
        onChange={setSelectedCirconscriptions}
      />
      
      {/* ❌ NE PAS inclure de sélection de CELs */}
    </form>
  );
}
```

---

## ✏️ 2. MODIFICATION DES DONNÉES PERSONNELLES

### Endpoint
```
PATCH /api/v1/users/:id
```
Via proxy Next.js : `PATCH /api/backend/users/:id`

**Note** : Le projet utilise `PATCH` pour la modification partielle (plus RESTful que `PUT`).

### Authentification
- **Requis** : Oui (JWT Bearer Token)
- **Gestion automatique** : L'intercepteur ajoute automatiquement le token

### Permissions
- **SADMIN** : ✅ Peut modifier tous les utilisateurs
- **ADMIN** : ✅ Peut modifier tous les utilisateurs
- **USER** : ❌ Accès interdit

### Body : `UpdateUserDto`

```typescript
{
  email?: string,                    // Optionnel - Email (doit être unique)
  firstName?: string,                 // Optionnel - Prénom
  lastName?: string,                  // Optionnel - Nom
  password?: string,                  // Optionnel - Nouveau mot de passe (fort)
  roleId?: string,                    // Optionnel - Rôle
  isActive?: boolean                 // Optionnel - Statut actif
}
```

**⚠️ IMPORTANT** :
- ❌ **Ne PAS** transmettre `circonscriptionCodes` dans ce endpoint
- ❌ **Ne PAS** transmettre `celCodes`
- ❌ **Ne PAS** transmettre `departementCodes`
- ✅ Pour modifier les circonscriptions, utiliser l'endpoint dédié : `POST /api/v1/users/:id/circonscriptions`

### Réponse

**Succès (200 OK)**
```json
{
  "id": "usr_abc123",
  "email": "agent.cei@example.ci",
  "firstName": "Jean-Pierre",
  "lastName": "Kouassi",
  "role": {
    "id": "USER",
    "code": "USER",
    "name": "Utilisateur"
  },
  "isActive": false,
  "circonscriptions": [
    {
      "id": 1,
      "COD_CE": "001",
      "LIB_CE": "ABIDJAN 1"
    }
  ],
  "cellules": [
    {
      "COD_CEL": "CEL001",
      "LIB_CEL": "CEL COCODY"
    }
  ],
  "activeSession": null,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T15:30:00.000Z"
}
```

**Note** : Les circonscriptions et CELs ne sont **pas modifiées** par cet endpoint. Elles restent inchangées.

### Exemple d'intégration (Structure actuelle du projet)

#### Service API : `lib/api/users.ts`

```typescript
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
  // ❌ NE PAS inclure circonscriptionCodes, celCodes, departementCodes
}

export const usersApi = {
  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    try {
      // ✅ PROXY : Utilise apiClient avec gestion automatique du token
      const response = await apiClient.patch(`/users/${id}`, userData);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la modification:', error);
      throw error;
    }
  },
};
```

#### Hook personnalisé : `hooks/useUsers.ts`

```typescript
const updateUser = useCallback(async (userId: string, updateData: UpdateUserData): Promise<User> => {
  setLoading(true);
  setError(null);
  
  try {
    const updatedUser = await usersApi.updateUser(userId, updateData);
    // Rafraîchir la liste après modification
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
```

#### Composant React : `components/modals/edit-user-modal.tsx`

```typescript
export function EditUserModal({ open, onOpenChange, user, onSuccess }: EditUserModalProps) {
  const { updateUser, loading, error } = useUsers();
  
  const handleSubmit = async (formData: EditUserFormData) => {
    try {
      await updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        roleId: formData.roleId,
        isActive: formData.isActive,
        // ❌ NE PAS inclure circonscriptionCodes ici
        // Utiliser l'endpoint séparé pour les circonscriptions
      });
      
      toast.success('Utilisateur modifié avec succès');
      onSuccess?.();
    } catch (err) {
      // L'erreur est gérée par le hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... champs du formulaire ... */}
    </form>
  );
}
```

---

## 🔄 3. MODIFICATION DES CIRCONSCRIPTIONS

### Endpoint
```
POST /api/v1/users/:id/circonscriptions
```

### Authentification
- **Requis** : Oui (JWT Bearer Token)

### Permissions
- **SADMIN** : ✅ Peut modifier les circonscriptions de tous les utilisateurs
- **ADMIN** : ✅ Peut modifier les circonscriptions de tous les utilisateurs
- **USER** : ❌ Accès interdit

### Body : `AssignCirconscriptionsDto`

```typescript
{
  circonscriptionCodes: string[]  // ✅ Requis - Codes des circonscriptions (COD_CE)
}
```

**Comportement** :
- ✅ **Remplacement complet** : Les anciennes circonscriptions sont libérées
- ✅ **Recalcul automatique** : Les CELs sont automatiquement recalculées et assignées
- ✅ **Tableau vide autorisé** : Si `[]` est transmis, toutes les circonscriptions et CELs sont libérées

### Réponse

**Succès (200 OK)**
```json
{
  "id": "usr_abc123",
  "email": "agent.cei@example.ci",
  "firstName": "Jean",
  "lastName": "Kouassi",
  "role": {
    "id": "USER",
    "code": "USER",
    "name": "Utilisateur"
  },
  "isActive": true,
  "circonscriptions": [
    {
      "id": 2,
      "COD_CE": "002",
      "LIB_CE": "ABIDJAN 2"
    },
    {
      "id": 3,
      "COD_CE": "003",
      "LIB_CE": "ABIDJAN 3"
    }
  ],
  "cellules": [
    {
      "COD_CEL": "CEL002",
      "LIB_CEL": "CEL PLATEAU"
    },
    {
      "COD_CEL": "CEL003",
      "LIB_CEL": "CEL YOPOUGON"
    }
  ],
  "activeSession": null,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T16:00:00.000Z"
}
```

**Note** : Les `cellules` dans la réponse sont **automatiquement recalculées** par le backend.

### Exemple d'intégration (À implémenter)

#### Service API : `lib/api/users.ts` (À ajouter)

```typescript
export interface AssignCirconscriptionsData {
  circonscriptionCodes: string[];
}

export const usersApi = {
  // ✅ NOUVEAU : Assigner des circonscriptions
  assignCirconscriptions: async (
    id: string, 
    data: AssignCirconscriptionsData
  ): Promise<User> => {
    try {
      const response = await apiClient.post(`/users/${id}/circonscriptions`, data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de l\'assignation des circonscriptions:', error);
      throw error;
    }
  },
};
```

#### Hook personnalisé : `hooks/useUsers.ts` (À ajouter)

```typescript
const assignCirconscriptions = useCallback(async (
  userId: string, 
  circonscriptionCodes: string[]
): Promise<User> => {
  setLoading(true);
  setError(null);
  
  try {
    const user = await usersApi.assignCirconscriptions(userId, { circonscriptionCodes });
    // Rafraîchir la liste après modification
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
```

#### Composant React : `components/modals/manage-user-circonscriptions-modal.tsx` (À créer)

```typescript
import { useUsers } from '@/hooks/useUsers';
import { useSimpleLists } from '@/hooks/useSimpleLists';
import { CirconscriptionSelector } from '@/components/ui/circonscription-selector';

export function ManageUserCirconscriptionsModal({ 
  open, 
  onOpenChange, 
  user, 
  onSuccess 
}: ManageUserCirconscriptionsModalProps) {
  const { assignCirconscriptions, loading } = useUsers();
  const { circonscriptions } = useSimpleLists();
  const [selectedCirconscriptions, setSelectedCirconscriptions] = useState<string[]>(
    user?.circonscriptions?.map(c => c.COD_CE) || []
  );
  
  const handleSave = async () => {
    try {
      await assignCirconscriptions(user.id, selectedCirconscriptions);
      toast.success('Circonscriptions modifiées avec succès');
      onSuccess?.();
    } catch (err) {
      // L'erreur est gérée par le hook
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gérer les circonscriptions</DialogTitle>
          <DialogDescription>
            Les CELs seront automatiquement recalculées en fonction des circonscriptions sélectionnées.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <MultiSelect
            label="Circonscriptions"
            options={circonscriptions.map(c => ({
              value: c.codCe,
              label: c.libCe,
            }))}
            value={selectedCirconscriptions}
            onChange={setSelectedCirconscriptions}
          />
          
          <div className="text-sm text-muted-foreground">
            <p>
              CELs actuellement assignées : {user?.cellules?.length || 0}
            </p>
            <p className="mt-2">
              ⚠️ Les CELs seront automatiquement recalculées après l'enregistrement.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCirconscriptions([])}
            disabled={loading}
          >
            Libérer toutes les circonscriptions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🗑️ 4. SUPPRESSION D'UTILISATEUR

### Endpoint
```
DELETE /api/v1/users/:id
```

### Authentification
- **Requis** : Oui (JWT Bearer Token)

### Permissions
- **SADMIN** : ✅ Peut supprimer tous les utilisateurs
- **ADMIN** : ✅ Peut supprimer tous les utilisateurs
- **USER** : ❌ Accès interdit

### Paramètres
- `id` : ID de l'utilisateur à supprimer

### Réponse

**Succès (204 No Content)**
- Aucun contenu dans la réponse
- Statut HTTP : `204`

**Comportement automatique du backend** :
- ✅ Libère les circonscriptions (userId = NULL)
- ✅ Libère les CELs (userId = NULL)
- ✅ Libère les imports Excel (userId = NULL)
- ✅ Supprime les sessions (cascade)
- ✅ Supprime les audit logs (cascade)

### Erreurs possibles

1. **Utilisateur non trouvé** : `404 Not Found`
   ```json
   {
     "statusCode": 404,
     "message": "Utilisateur non trouvé"
   }
   ```

2. **Non autorisé** : `401 Unauthorized` ou `403 Forbidden`

### Exemple d'intégration (Structure actuelle du projet)

#### Service API : `lib/api/users.ts`

```typescript
export const usersApi = {
  deleteUser: async (id: string): Promise<void> => {
    try {
      // ✅ PROXY : Utilise apiClient avec gestion automatique du token
      await apiClient.delete(`/users/${id}`);
      // 204 No Content - pas de contenu à retourner
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la suppression:', error);
      throw error;
    }
  },
};
```

#### Hook personnalisé : `hooks/useUsers.ts`

```typescript
const deleteUser = useCallback(async (userId: string) => {
  setLoading(true);
  setError(null);
  
  try {
    await usersApi.deleteUser(userId);
    // Rafraîchir la liste après suppression
    await fetchUsers(meta.page, meta.limit);
  } catch (err: unknown) {
    const errorMessage = handleApiError(err);
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
}, [meta.page, meta.limit, fetchUsers]);
```

#### Composant React avec confirmation : `components/modals/delete-user-modal.tsx`

```typescript
import { useUsers } from '@/hooks/useUsers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DeleteUserModal({ 
  open, 
  onOpenChange, 
  user, 
  onSuccess 
}: DeleteUserModalProps) {
  const { deleteUser, loading } = useUsers();
  
  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      toast.success('Utilisateur supprimé avec succès');
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      // L'erreur est gérée par le hook
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user?.firstName} {user?.lastName}</strong> ?
            <br />
            <br />
            Cette action :
            <ul className="list-disc list-inside mt-2">
              <li>Libérera toutes ses circonscriptions et CELs</li>
              <li>Supprimera ses sessions actives</li>
              <li>Supprimera ses logs d'audit</li>
            </ul>
            <br />
            <strong className="text-red-600">Cette action est irréversible.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Suppression...' : 'Confirmer la suppression'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## 📊 5. RÉCUPÉRATION D'UN UTILISATEUR

### Endpoint
```
GET /api/v1/users/:id
```

### Réponse

**Succès (200 OK)**
```json
{
  "id": "usr_abc123",
  "email": "agent.cei@example.ci",
  "firstName": "Jean",
  "lastName": "Kouassi",
  "role": {
    "id": "USER",
    "code": "USER",
    "name": "Utilisateur"
  },
  "isActive": true,
  "circonscriptions": [
    {
      "id": 1,
      "COD_CE": "001",
      "LIB_CE": "ABIDJAN 1"
    }
  ],
  "cellules": [
    {
      "COD_CEL": "CEL001",
      "LIB_CEL": "CEL COCODY"
    }
  ],
  "activeSession": {
    "createdAt": "2025-01-15T10:00:00.000Z",
    "expiresAt": "2025-01-16T10:00:00.000Z"
  },
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

---

## 🎯 CAS D'USAGE COMPLETS

### Cas 1 : Formulaire de création complet (Structure actuelle)

```typescript
import { useUsers } from '@/hooks/useUsers';
import { useSimpleLists } from '@/hooks/useSimpleLists';
import { rolesApi } from '@/lib/api/roles';

function CreateUserForm() {
  const { createUser, loading, error } = useUsers();
  const { circonscriptions } = useSimpleLists(); // ✅ Utiliser le hook
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roleId: '',
    circonscriptionCodes: [] as string[],
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        roleId: formData.roleId || undefined,
        circonscriptionCodes: formData.circonscriptionCodes,
        isActive: formData.isActive,
      });
      
      // Afficher un message de succès
      console.log('Utilisateur créé:', newUser);
      console.log('CELs assignées automatiquement:', newUser.cellules);
      
      // Réinitialiser le formulaire ou rediriger
    } catch (err) {
      // L'erreur est gérée par le hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      
      <input
        type="text"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        placeholder="Prénom"
        required
      />
      
      <input
        type="text"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        placeholder="Nom"
        required
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Mot de passe"
        required
      />
      
      <select
        value={formData.roleId}
        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
      >
        <option value="">Sélectionner un rôle</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>{role.name}</option>
        ))}
      </select>
      
      <MultiSelect
        label="Circonscriptions (optionnel)"
        options={circonscriptions.map(c => ({
          value: c.codCe,
          label: c.libCe,
        }))}
        value={formData.circonscriptionCodes}
        onChange={(codes) => setFormData({ ...formData, circonscriptionCodes: codes })}
      />
      
      {/* ✅ Afficher les CELs qui seront assignées automatiquement (info) */}
      {formData.circonscriptionCodes.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>
            Les CELs seront automatiquement assignées en fonction des circonscriptions sélectionnées.
          </p>
        </div>
      )}
      
      <label>
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        Utilisateur actif
      </label>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Création...' : 'Créer l\'utilisateur'}
      </button>
    </form>
  );
}
```

### Cas 2 : Formulaire d'édition avec onglets (Structure actuelle)

```typescript
import { useUsers } from '@/hooks/useUsers';
import { useSimpleLists } from '@/hooks/useSimpleLists';

function EditUserForm({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'personal' | 'circonscriptions'>('personal');
  const { users, loading, fetchUsers } = useUsers();
  
  // Charger l'utilisateur spécifique
  useEffect(() => {
    fetchUsers(1, 1, userId); // Recherche par ID
  }, [userId, fetchUsers]);
  
  const user = users.find(u => u.id === userId);

  if (loading) return <div>Chargement...</div>;
  if (!user) return <div>Utilisateur non trouvé</div>;

  return (
    <div>
      <div className="tabs">
        <button
          onClick={() => setActiveTab('personal')}
          className={activeTab === 'personal' ? 'active' : ''}
        >
          Données personnelles
        </button>
        <button
          onClick={() => setActiveTab('circonscriptions')}
          className={activeTab === 'circonscriptions' ? 'active' : ''}
        >
          Circonscriptions
        </button>
      </div>

      {activeTab === 'personal' && (
        <EditUserPersonalData user={user} />
      )}

      {activeTab === 'circonscriptions' && (
        <EditUserCirconscriptions user={user} />
      )}
    </div>
  );
}

function EditUserPersonalData({ user }: { user: UserResponseDto }) {
  const { updateUser, loading, error } = useUpdateUser();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isActive: user.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(user.id, formData);
      // Afficher un message de succès
    } catch (err) {
      // Gérer l'erreur
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Champs du formulaire */}
    </form>
  );
}

function EditUserCirconscriptions({ user }: { user: User }) {
  const { assignCirconscriptions, loading } = useUsers(); // ✅ Utiliser le hook
  const { circonscriptions } = useSimpleLists(); // ✅ Utiliser le hook
  const [selectedCirconscriptions, setSelectedCirconscriptions] = useState<string[]>(
    user.circonscriptions?.map(c => c.COD_CE) || []
  );

  const handleSave = async () => {
    try {
      await assignCirconscriptions(user.id, selectedCirconscriptions);
      toast.success('Circonscriptions modifiées avec succès');
      // Les CELs seront automatiquement recalculées par le backend
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  return (
    <div>
      <MultiSelect
        label="Circonscriptions"
        options={circonscriptions.map(c => ({
          value: c.codCe,
          label: c.libCe,
        }))}
        value={selectedCirconscriptions}
        onChange={setSelectedCirconscriptions}
      />
      
      <div className="info">
        <p>
          Les CELs seront automatiquement recalculées et assignées en fonction des circonscriptions sélectionnées.
        </p>
        <p>
          CELs actuellement assignées : {user.cellules.length}
        </p>
      </div>
      
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
}
```

### Cas 3 : Liste des utilisateurs avec actions (Structure actuelle)

```typescript
import { useUsers } from '@/hooks/useUsers';

function UsersList() {
  const { users, loading, error, fetchUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Charger les utilisateurs au montage
  useEffect(() => {
    fetchUsers(1, 10, '');
  }, [fetchUsers]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Circonscriptions</th>
            <th>CELs</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.role.name}</td>
            <td>{user.circonscriptions?.length || 0}</td>
            <td>{user.cellules?.length || 0}</td>
            <td>{user.isActive ? 'Actif' : 'Inactif'}</td>
              <td>
                <button onClick={() => setSelectedUser(user.id)}>
                  Modifier
                </button>
                <DeleteUserButton userId={user.id} onDeleted={() => {/* Recharger la liste */}} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <EditUserModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
```

---

## ⚠️ POINTS IMPORTANTS

### 1. Ne jamais transmettre les CELs

**❌ INCORRECT** :
```typescript
{
  email: 'user@example.com',
  firstName: 'Jean',
  lastName: 'Doe',
  password: 'Password123!',
  circonscriptionCodes: ['001'],
  celCodes: ['CEL001', 'CEL002'], // ❌ NE PAS FAIRE CELA
}
```

**✅ CORRECT** :
```typescript
{
  email: 'user@example.com',
  firstName: 'Jean',
  lastName: 'Doe',
  password: 'Password123!',
  circonscriptionCodes: ['001'], // ✅ Seulement les circonscriptions
  // Les CELs seront automatiquement assignées
}
```

### 2. Séparation des modifications

**Modification des données personnelles** :
- Utiliser `PATCH /api/v1/users/:id` (via `usersApi.updateUser()`)
- Ne PAS inclure `circonscriptionCodes`
- Ne PAS inclure `celCodes` ou `departementCodes`

**Modification des circonscriptions** :
- Utiliser `POST /api/v1/users/:id/circonscriptions` (via `usersApi.assignCirconscriptions()`)
- Endpoint séparé et dédié
- **⚠️ À IMPLÉMENTER** : Cet endpoint n'existe pas encore dans le projet

### 3. Gestion des CELs automatiques

**Important** : Les CELs sont toujours calculées automatiquement par le backend. Le frontend doit :
- ✅ Afficher les CELs dans les réponses (informatives)
- ❌ Ne jamais les transmettre lors de la création/modification
- ✅ Comprendre qu'elles changent automatiquement quand les circonscriptions changent

### 4. Validation des mots de passe

Le mot de passe doit respecter :
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Au moins un caractère spécial : `@$!%*?&`

**Exemple de validation frontend** :
```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

function validatePassword(password: string): boolean {
  return password.length >= 8 && passwordRegex.test(password);
}
```

### 5. Gestion des erreurs

**Erreurs communes** :
- `409 Conflict` : Email déjà existant
- `400 Bad Request` : Validation échouée ou circonscriptions inexistantes
- `404 Not Found` : Utilisateur non trouvé
- `401/403` : Problème d'authentification/autorisation

**Recommandation** : Afficher des messages d'erreur clairs et spécifiques à l'utilisateur.

---

## 🔄 MIGRATION REQUISE

### État actuel vs État cible

**État actuel** :
- Le projet utilise `departementCodes` et `celCodes` dans `lib/api/users.ts`
- Les modals utilisent `departementCodes` et `celCodes`
- Pas d'endpoint pour assigner les circonscriptions séparément

**État cible** :
- Utiliser uniquement `circonscriptionCodes` (remplace `departementCodes`)
- Ne jamais transmettre `celCodes` (calculé automatiquement par le backend)
- Implémenter l'endpoint `POST /api/v1/users/:id/circonscriptions`

### Étapes de migration

#### Étape 1 : Mettre à jour les types dans `lib/api/users.ts`

```typescript
// ❌ AVANT
export interface CreateUserData {
  departementCodes?: string[];
  celCodes?: string[];
}

// ✅ APRÈS
export interface CreateUserData {
  circonscriptionCodes?: string[]; // ✅ Remplacer departementCodes
  // ❌ Supprimer celCodes
}
```

#### Étape 2 : Mettre à jour le service API

```typescript
// ✅ Ajouter la méthode pour assigner les circonscriptions
export const usersApi = {
  // ... méthodes existantes
  
  // ✅ NOUVEAU : Assigner des circonscriptions
  assignCirconscriptions: async (
    id: string, 
    data: { circonscriptionCodes: string[] }
  ): Promise<User> => {
    try {
      const response = await apiClient.post(`/users/${id}/circonscriptions`, data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur:', error);
      throw error;
    }
  },
};
```

#### Étape 3 : Mettre à jour le hook `useUsers`

```typescript
// ✅ Ajouter la méthode dans le hook
const assignCirconscriptions = useCallback(async (
  userId: string, 
  circonscriptionCodes: string[]
): Promise<User> => {
  setLoading(true);
  setError(null);
  
  try {
    const user = await usersApi.assignCirconscriptions(userId, { circonscriptionCodes });
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
```

#### Étape 4 : Mettre à jour les modals

```typescript
// ✅ Dans create-user-modal.tsx
// Remplacer departementCodes par circonscriptionCodes
// Supprimer la sélection de CELs

// ✅ Créer manage-user-circonscriptions-modal.tsx
// Pour gérer séparément les circonscriptions
```

---

## 📝 CHECKLIST D'INTÉGRATION

### Phase 1 : Configuration
- [x] ✅ URL de base configurée : `/api/backend` (proxy Next.js)
- [x] ✅ Gestion du token via intercepteur (cookies httpOnly)
- [x] ✅ Service API existant : `lib/api/users.ts`
- [x] ✅ Hook personnalisé existant : `hooks/useUsers.ts`

### Phase 2 : Migration vers circonscriptions
- [ ] Mettre à jour `CreateUserData` pour utiliser `circonscriptionCodes`
- [ ] Mettre à jour `UpdateUserData` pour supprimer `departementCodes` et `celCodes`
- [ ] Mettre à jour `create-user-modal.tsx` pour utiliser les circonscriptions
- [ ] Mettre à jour `edit-user-modal.tsx` pour supprimer la sélection de CELs
- [ ] Supprimer les références à `departementCodes` et `celCodes` dans les modals

### Phase 3 : Implémentation de l'assignation des circonscriptions
- [ ] Ajouter `assignCirconscriptions()` dans `lib/api/users.ts`
- [ ] Ajouter `assignCirconscriptions()` dans `hooks/useUsers.ts`
- [ ] Créer `components/modals/manage-user-circonscriptions-modal.tsx`
- [ ] Intégrer le modal dans `components/users/users-modals.tsx`

### Phase 4 : Intégration des listes
- [x] ✅ `GET /api/v1/circonscriptions/list/simple` disponible via `listsApi.getCirconscriptionsList()`
- [x] ✅ Hook `useSimpleLists()` disponible
- [x] ✅ `GET /api/v1/roles` disponible via `rolesApi.getRolesSimple()`
- [ ] Afficher les CELs assignées (en lecture seule) dans les modals

### Phase 5 : Gestion des erreurs
- [x] ✅ Gestion centralisée via `handleApiError` dans `lib/api/client.ts`
- [ ] Tester les erreurs 409 (email existant)
- [ ] Tester les erreurs 400 (validation)
- [ ] Tester les erreurs 404 (utilisateur non trouvé)

### Phase 6 : Validation
- [x] ✅ Validation avec Zod dans les modals
- [ ] Valider le format email
- [ ] Valider la force du mot de passe
- [ ] Empêcher la transmission de `celCodes`

### Phase 7 : Tests
- [ ] Tester la création avec circonscriptions
- [ ] Tester la création sans circonscriptions
- [ ] Tester la modification des données personnelles
- [ ] Tester l'assignation des circonscriptions (nouveau endpoint)
- [ ] Tester la libération complète (tableau vide)
- [ ] Tester la suppression
- [ ] Vérifier que les CELs sont automatiquement calculées

---

## 🔗 RESSOURCES

### Fichiers du projet

- **Service API** : `lib/api/users.ts`
- **Hook personnalisé** : `hooks/useUsers.ts`
- **Composant principal** : `components/users/users-page-content.tsx`
- **Modal création** : `components/modals/create-user-modal.tsx`
- **Modal édition** : `components/modals/edit-user-modal.tsx`
- **Listes simples** : `lib/api/lists.ts` (circonscriptions)
- **Client API** : `lib/api/client.ts`
- **Intercepteurs** : `lib/api/interceptor.ts`

### Endpoints connexes

- `GET /api/v1/circonscriptions/list/simple` - Liste simple des circonscriptions
  - Via proxy : `GET /api/backend/circonscriptions/list/simple`
  - Service : `listsApi.getCirconscriptionsList()`
  - Hook : `useSimpleLists()` retourne `circonscriptions`
- `GET /api/v1/roles` - Liste des rôles
  - Via proxy : `GET /api/backend/roles`
  - Service : `rolesApi.getRolesSimple()`
- `GET /api/v1/users` - Liste des utilisateurs avec pagination
  - Via proxy : `GET /api/backend/users?page=1&limit=10&search=`
  - Service : `usersApi.getUsers({ page, limit, search })`
  - Hook : `useUsers().fetchUsers(page, limit, search)`

### Documentation connexe

- `docs/ARCHITECTURE_CONSOMMATION_API.md` - Architecture complète de consommation d'API
- `docs/PROMPT_FRONTEND_LISTES_SIMPLES.md` - Guide pour les listes simples

---

## 📊 RÉSUMÉ DES CHANGEMENTS NÉCESSAIRES

### ✅ Déjà implémenté

1. Service API `usersApi` avec méthodes CRUD
2. Hook `useUsers` pour la gestion d'état
3. Composants modals pour création/édition/suppression
4. Gestion d'erreurs centralisée avec `handleApiError`
5. Authentification automatique via intercepteur
6. Proxy Next.js configuré

### ⚠️ À implémenter

1. **Migration vers `circonscriptionCodes`** :
   - Remplacer `departementCodes` par `circonscriptionCodes` dans les types
   - Supprimer `celCodes` des types et modals
   - Mettre à jour `create-user-modal.tsx`
   - Mettre à jour `edit-user-modal.tsx`

2. **Endpoint assignation circonscriptions** :
   - Ajouter `assignCirconscriptions()` dans `lib/api/users.ts`
   - Ajouter `assignCirconscriptions()` dans `hooks/useUsers.ts`
   - Créer `components/modals/manage-user-circonscriptions-modal.tsx`

3. **Intégration des circonscriptions** :
   - Utiliser `useSimpleLists()` pour charger les circonscriptions
   - Remplacer les sélecteurs de départements par des sélecteurs de circonscriptions

---

**Date de création** : 2025-01-XX  
**Version** : 1.0  
**Dernière mise à jour** : Adapté à la structure actuelle du projet  
**Statut** : Documentation pour intégration frontend - Gestion complète des utilisateurs

---

*Ce document fournit tous les éléments nécessaires pour intégrer la gestion complète des utilisateurs dans votre application frontend. Les exemples de code sont adaptés à la structure actuelle du projet utilisant Next.js, TypeScript, Axios avec intercepteurs, et React Hooks.*

