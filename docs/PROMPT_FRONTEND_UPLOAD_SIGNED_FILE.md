# 📎 PROMPT FRONTEND : Upload de Fichier CEL Signé

## 🎯 Objectif

Ce document décrit comment utiliser la route **POST `/api/v1/legislatives/upload/signed-file`** depuis le frontend pour uploader des fichiers signés (PDF, JPG, PNG) associés aux Cellules Électorales Locales (CELs).

## 📋 Informations Générales

### Endpoint

```
POST /api/v1/legislatives/upload/signed-file
```

### Authentification

- **Type** : Bearer Token (JWT)
- **Header requis** : `Authorization: Bearer <token>`
- **Rôles autorisés** : `SADMIN`, `ADMIN`, `USER`

### Type de Contenu

- **Content-Type** : `multipart/form-data`
- **Taille maximale** : 10MB par fichier
- **Types de fichiers autorisés** : PDF, JPG, PNG

## 📤 Structure de la Requête

### Body (FormData)

La requête doit être envoyée en tant que `multipart/form-data` avec les champs suivants :

| Champ | Type | Requis | Description | Exemple |
|-------|------|--------|-------------|---------|
| `signedFile` | File | ✅ Oui | Fichier signé (PDF, JPG, PNG) | `proces-verbal-signe.pdf` |
| `codeCel` | string | ✅ Oui | Code CEL (Cellule Électorale Locale) | `S003` |
| `codCe` | string | ❌ Non | Code circonscription (optionnel, peut être déduit) | `004` |
| `importId` | number | ❌ Non | ID de l'import Excel existant (optionnel) | `1` |
| `description` | string | ❌ Non | Description optionnelle du fichier | `Procès-verbal signé de la CEL S003` |

### Scénarios d'Utilisation

#### Scénario 1 : Upload pour un import Excel existant

Si un fichier Excel a déjà été importé et que vous voulez associer un fichier signé :

```typescript
const formData = new FormData();
formData.append('signedFile', file); // File object
formData.append('codeCel', 'S003');
formData.append('importId', '1'); // ID de l'import existant
formData.append('description', 'Procès-verbal signé');
```

#### Scénario 2 : Upload sans import Excel (fichier signé uniquement)

Si vous voulez uploader uniquement le fichier signé sans import Excel :

```typescript
const formData = new FormData();
formData.append('signedFile', file);
formData.append('codeCel', 'S003');
formData.append('codCe', '004'); // Optionnel mais recommandé
```

#### Scénario 3 : Upload avec recherche automatique d'import

Si vous ne fournissez pas `importId`, le système cherchera automatiquement un import réussi pour la CEL :

```typescript
const formData = new FormData();
formData.append('signedFile', file);
formData.append('codeCel', 'S003');
// Le système cherchera automatiquement un import avec STATUT_IMPORT = 'SUCCESS'
```

## 📥 Structure de la Réponse

### Succès (201 Created)

```typescript
interface SignedFileUploadResponse {
  id: number;                    // ID de l'enregistrement TBL_IMPORT_EXCEL
  codeCel: string;               // Code CEL
  codCe: string;                 // Code circonscription
  signedFilePath: string;         // Chemin du fichier stocké
  fileName: string;              // Nom original du fichier
  fileSize: number;              // Taille en octets
  mimeType: string;              // Type MIME (application/pdf, image/jpeg, etc.)
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  uploadedAt: string;            // Date ISO 8601
  downloadUrl: string;           // URL pour télécharger le fichier
}
```

**Exemple de réponse :**

```json
{
  "id": 1,
  "codeCel": "S003",
  "codCe": "004",
  "signedFilePath": "storage/cels/signed-files/S003/1733145022000_proces-verbal-signe.pdf",
  "fileName": "proces-verbal-signe.pdf",
  "fileSize": 245678,
  "mimeType": "application/pdf",
  "uploadedBy": {
    "id": "cmgjqtg1j0037w46dgbcy95kc",
    "firstName": "MANTEDJE",
    "lastName": "BERTHE",
    "email": "mantedje.berthe@cei.ci"
  },
  "uploadedAt": "2025-12-02T14:30:22.000Z",
  "downloadUrl": "/api/v1/legislatives/upload/signed-files/1/download"
}
```

### Erreurs Possibles

| Code | Description | Cause |
|------|-------------|-------|
| 400 | Bad Request | Fichier invalide, type non autorisé, taille > 10MB, données manquantes |
| 401 | Unauthorized | Token JWT manquant ou invalide |
| 403 | Forbidden | Utilisateur USER n'a pas accès à cette CEL |
| 404 | Not Found | CEL non trouvée, import non trouvé (si importId fourni) |

**Exemple d'erreur 400 :**

```json
{
  "statusCode": 400,
  "message": "Type de fichier invalide. Types autorisés : PDF, JPG, PNG. Type reçu : application/zip",
  "error": "Bad Request"
}
```

**Exemple d'erreur 403 :**

```json
{
  "statusCode": 403,
  "message": "Vous n'avez pas accès à cette cellule électorale",
  "error": "Forbidden"
}
```

## 💻 Exemples d'Implémentation

### React avec Axios

```typescript
import axios from 'axios';

interface UploadSignedFileParams {
  file: File;
  codeCel: string;
  codCe?: string;
  importId?: number;
  description?: string;
}

interface SignedFileUploadResponse {
  id: number;
  codeCel: string;
  codCe: string;
  signedFilePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  uploadedAt: string;
  downloadUrl: string;
}

const uploadSignedFile = async (
  params: UploadSignedFileParams,
  token: string
): Promise<SignedFileUploadResponse> => {
  const formData = new FormData();
  formData.append('signedFile', params.file);
  formData.append('codeCel', params.codeCel);
  
  if (params.codCe) {
    formData.append('codCe', params.codCe);
  }
  
  if (params.importId) {
    formData.append('importId', params.importId.toString());
  }
  
  if (params.description) {
    formData.append('description', params.description);
  }

  const response = await axios.post<SignedFileUploadResponse>(
    '/api/v1/legislatives/upload/signed-file',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

// Utilisation
const handleFileUpload = async (file: File, codeCel: string) => {
  try {
    const result = await uploadSignedFile(
      {
        file,
        codeCel,
        codCe: '004', // Optionnel
        description: 'Procès-verbal signé',
      },
      userToken
    );
    
    console.log('Fichier uploadé avec succès:', result);
    // Afficher un message de succès
    // Rediriger ou mettre à jour l'interface
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        console.error('Fichier invalide:', error.response.data.message);
        // Afficher un message d'erreur à l'utilisateur
      } else if (error.response?.status === 403) {
        console.error('Accès interdit:', error.response.data.message);
        // Afficher un message d'erreur d'accès
      } else {
        console.error('Erreur lors de l\'upload:', error.message);
      }
    }
  }
};
```

### React avec Fetch API

```typescript
const uploadSignedFile = async (
  file: File,
  codeCel: string,
  token: string,
  options?: {
    codCe?: string;
    importId?: number;
    description?: string;
  }
): Promise<SignedFileUploadResponse> => {
  const formData = new FormData();
  formData.append('signedFile', file);
  formData.append('codeCel', codeCel);
  
  if (options?.codCe) {
    formData.append('codCe', options.codCe);
  }
  
  if (options?.importId) {
    formData.append('importId', options.importId.toString());
  }
  
  if (options?.description) {
    formData.append('description', options.description);
  }

  const response = await fetch('/api/v1/legislatives/upload/signed-file', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Ne pas définir Content-Type, le navigateur le fera automatiquement avec la boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'upload');
  }

  return response.json();
};
```

### Composant React Complet

```typescript
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Votre hook d'authentification

interface FileUploadProps {
  codeCel: string;
  codCe?: string;
  importId?: number;
  onUploadSuccess?: (result: SignedFileUploadResponse) => void;
  onUploadError?: (error: string) => void;
}

const SignedFileUpload: React.FC<FileUploadProps> = ({
  codeCel,
  codCe,
  importId,
  onUploadSuccess,
  onUploadError,
}) => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation du fichier avant upload
  const validateFile = (file: File): string | null => {
    // Vérifier le type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Type de fichier invalide. Types autorisés : PDF, JPG, PNG';
    }

    // Vérifier l'extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return 'Extension de fichier invalide. Extensions autorisées : pdf, jpg, jpeg, png';
    }

    // Vérifier la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `Le fichier est trop volumineux. Taille maximale : 10MB. Taille actuelle : ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('signedFile', file);
      formData.append('codeCel', codeCel);
      
      if (codCe) {
        formData.append('codCe', codCe);
      }
      
      if (importId) {
        formData.append('importId', importId.toString());
      }
      
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('/api/v1/legislatives/upload/signed-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      const result: SignedFileUploadResponse = await response.json();
      
      // Réinitialiser le formulaire
      setFile(null);
      setDescription('');
      setError(null);
      
      // Appeler le callback de succès
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      // Afficher un message de succès
      alert('Fichier uploadé avec succès !');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="signed-file-upload">
      <h3>Upload de fichier signé</h3>
      
      <div className="form-group">
        <label htmlFor="signedFile">
          Fichier signé (PDF, JPG, PNG - max 10MB) *
        </label>
        <input
          type="file"
          id="signedFile"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {file && (
          <div className="file-info">
            <p>Fichier sélectionné : {file.name}</p>
            <p>Taille : {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optionnel)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du fichier..."
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="upload-button"
      >
        {uploading ? 'Upload en cours...' : 'Uploader le fichier'}
      </button>

      {uploading && (
        <div className="upload-progress">
          <p>Upload en cours, veuillez patienter...</p>
        </div>
      )}
    </div>
  );
};

export default SignedFileUpload;
```

### Vue.js avec Axios

```vue
<template>
  <div class="signed-file-upload">
    <h3>Upload de fichier signé</h3>
    
    <div class="form-group">
      <label for="signedFile">
        Fichier signé (PDF, JPG, PNG - max 10MB) *
      </label>
      <input
        type="file"
        id="signedFile"
        accept=".pdf,.jpg,.jpeg,.png"
        @change="handleFileChange"
        :disabled="uploading"
      />
      <div v-if="selectedFile" class="file-info">
        <p>Fichier sélectionné : {{ selectedFile.name }}</p>
        <p>Taille : {{ formatFileSize(selectedFile.size) }} MB</p>
      </div>
    </div>

    <div class="form-group">
      <label for="description">Description (optionnel)</label>
      <textarea
        id="description"
        v-model="description"
        placeholder="Description du fichier..."
        :disabled="uploading"
      />
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button
      @click="handleUpload"
      :disabled="!selectedFile || uploading"
      class="upload-button"
    >
      {{ uploading ? 'Upload en cours...' : 'Uploader le fichier' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // Votre store d'authentification

interface Props {
  codeCel: string;
  codCe?: string;
  importId?: number;
}

const props = defineProps<Props>();

const authStore = useAuthStore();
const selectedFile = ref<File | null>(null);
const description = ref('');
const uploading = ref(false);
const error = ref<string | null>(null);

const validateFile = (file: File): string | null => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return 'Type de fichier invalide. Types autorisés : PDF, JPG, PNG';
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
  if (!extension || !allowedExtensions.includes(extension)) {
    return 'Extension de fichier invalide';
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return `Le fichier est trop volumineux. Taille maximale : 10MB`;
  }

  return null;
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const validationError = validateFile(file);
  if (validationError) {
    error.value = validationError;
    selectedFile.value = null;
    return;
  }

  error.value = null;
  selectedFile.value = file;
};

const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2);
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    error.value = 'Veuillez sélectionner un fichier';
    return;
  }

  uploading.value = true;
  error.value = null;

  try {
    const formData = new FormData();
    formData.append('signedFile', selectedFile.value);
    formData.append('codeCel', props.codeCel);
    
    if (props.codCe) {
      formData.append('codCe', props.codCe);
    }
    
    if (props.importId) {
      formData.append('importId', props.importId.toString());
    }
    
    if (description.value) {
      formData.append('description', description.value);
    }

    const response = await axios.post(
      '/api/v1/legislatives/upload/signed-file',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Réinitialiser
    selectedFile.value = null;
    description.value = '';
    error.value = null;

    // Émettre un événement de succès
    emit('upload-success', response.data);
    
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'upload';
    } else {
      error.value = 'Erreur inconnue';
    }
  } finally {
    uploading.value = false;
  }
};

const emit = defineEmits<{
  'upload-success': [data: SignedFileUploadResponse];
}>();
</script>
```

## ✅ Validation Côté Frontend

Avant d'envoyer la requête, validez :

1. **Type de fichier** : Vérifier que le type MIME est autorisé
2. **Extension** : Vérifier que l'extension est `.pdf`, `.jpg`, `.jpeg`, ou `.png`
3. **Taille** : Vérifier que la taille ne dépasse pas 10MB
4. **Champs requis** : Vérifier que `codeCel` est fourni

```typescript
const validateBeforeUpload = (file: File, codeCel: string): { valid: boolean; error?: string } => {
  // Vérifier le code CEL
  if (!codeCel || codeCel.trim() === '') {
    return { valid: false, error: 'Le code CEL est requis' };
  }

  // Vérifier le type de fichier
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Type de fichier invalide. Types autorisés : PDF, JPG, PNG' };
  }

  // Vérifier l'extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Extension de fichier invalide' };
  }

  // Vérifier la taille (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale : 10MB. Taille actuelle : ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
};
```

## 🔄 Gestion des Erreurs

### Erreurs à Gérer

1. **400 Bad Request** : Fichier invalide, données manquantes
   - Afficher un message clair à l'utilisateur
   - Permettre de sélectionner un autre fichier

2. **401 Unauthorized** : Token expiré ou invalide
   - Rediriger vers la page de connexion
   - Rafraîchir le token si possible

3. **403 Forbidden** : Accès refusé à la CEL
   - Afficher un message d'erreur explicite
   - Vérifier les permissions de l'utilisateur

4. **404 Not Found** : CEL ou import non trouvé
   - Vérifier que le code CEL est correct
   - Vérifier que l'importId existe (si fourni)

5. **Erreurs réseau** : Timeout, connexion perdue
   - Afficher un message d'erreur
   - Permettre de réessayer

### Exemple de Gestion d'Erreurs

```typescript
const handleUploadError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Erreur inconnue';

    switch (status) {
      case 400:
        // Fichier invalide ou données manquantes
        showErrorToast(`Erreur de validation : ${message}`);
        break;
      
      case 401:
        // Token expiré
        showErrorToast('Votre session a expiré. Veuillez vous reconnecter.');
        // Rediriger vers la page de connexion
        router.push('/login');
        break;
      
      case 403:
        // Accès refusé
        showErrorToast('Vous n\'avez pas accès à cette cellule électorale.');
        break;
      
      case 404:
        // CEL ou import non trouvé
        showErrorToast(`Ressource non trouvée : ${message}`);
        break;
      
      default:
        // Erreur serveur ou réseau
        showErrorToast('Erreur lors de l\'upload. Veuillez réessayer.');
    }
  } else {
    showErrorToast('Erreur inconnue lors de l\'upload.');
  }
};
```

## 📝 Notes Importantes

### 1. Remplacement de Fichier

Si un fichier signé existe déjà pour un import, il sera **automatiquement remplacé** par le nouveau fichier. L'ancien fichier sera supprimé physiquement du serveur.

### 2. Association avec Import Excel

- Si `importId` est fourni, le fichier signé sera associé à cet import spécifique
- Si `importId` n'est pas fourni, le système cherchera automatiquement un import réussi (`STATUT_IMPORT = 'SUCCESS'`) pour la CEL
- Si aucun import n'existe, un nouvel enregistrement sera créé avec `STATUT_IMPORT = 'SIGNED_FILE_ONLY'`

### 3. Permissions USER

Les utilisateurs avec le rôle `USER` ne peuvent uploader des fichiers signés que pour les CELs des circonscriptions qui leur sont assignées. Si l'utilisateur tente d'uploader pour une CEL non accessible, une erreur 403 sera retournée.

### 4. Format du Nom de Fichier

Le nom du fichier stocké sera automatiquement modifié pour inclure un timestamp :
- Format : `{timestamp}_{nomOriginal}`
- Exemple : `1733145022000_proces-verbal-signe.pdf`

Le nom original est conservé dans la réponse (`fileName`).

### 5. URL de Téléchargement

L'URL de téléchargement retournée dans la réponse peut être utilisée pour télécharger le fichier via la route :
```
GET /api/v1/legislatives/upload/signed-files/:importId/download
```

## 🎨 Exemple d'Interface Utilisateur

### Composant avec Barre de Progression

```typescript
import React, { useState } from 'react';
import axios from 'axios';

const SignedFileUploadWithProgress: React.FC<{ codeCel: string }> = ({ codeCel }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('signedFile', file);
    formData.append('codeCel', codeCel);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await axios.post(
        '/api/v1/legislatives/upload/signed-file',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );

      console.log('Upload réussi:', response.data);
      setUploadProgress(100);
      
      // Réinitialiser après 2 secondes
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      
      {uploading && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🔗 Routes Associées

Après l'upload, vous pouvez utiliser ces routes pour gérer les fichiers signés :

- **GET `/api/v1/legislatives/upload/cel/:codeCel/signed-files`** : Liste des fichiers signés d'une CEL
- **GET `/api/v1/legislatives/upload/signed-files/:importId/download`** : Télécharger un fichier signé
- **DELETE `/api/v1/legislatives/upload/signed-files/:importId`** : Supprimer un fichier signé (ADMIN/SADMIN uniquement)

## 📚 Références

- Documentation backend : `docs/ANALYSE_BESOIN_FICHIERS_CEL_SIGNES.md`
- DTOs backend : 
  - `src/legislatives-upload/dto/upload-signed-file.dto.ts`
  - `src/legislatives-upload/dto/signed-file-upload-response.dto.ts`
- Controller backend : `src/legislatives-upload/legislatives-upload.controller.ts`

