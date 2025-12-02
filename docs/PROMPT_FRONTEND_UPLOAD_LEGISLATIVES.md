# 📤 PROMPT FRONTEND : Upload et Affichage Fichiers Excel Législatives
## API Élections Législatives - Upload et Visualisation des Données

---

## 📋 CONTEXTE ET OBJECTIF

### Vue d'ensemble
Ce document décrit l'intégration frontend de deux fonctionnalités clés pour les **élections législatives** :
1. **Upload de fichiers Excel** : Upload et traitement automatique de fichiers Excel (.xlsm) contenant les résultats électoraux
2. **Affichage des données CEL** : Récupération des données d'une CEL au format Excel pour visualisation

**Points importants :**
- ✅ **Un seul fichier** : Le frontend envoie uniquement le fichier Excel (.xlsm)
- ✅ **Traitement automatique** : Le backend convertit en CSV, extrait les métadonnées et insère les données
- ✅ **Format Excel** : Les données d'affichage reproduisent le format des feuilles Excel
- ✅ **Colonnes dynamiques** : Le nombre de colonnes de scores varie selon le nombre de candidats

---

## 🔗 ENDPOINTS DISPONIBLES

### 1. Upload de fichier Excel
```
POST /api/v1/legislatives/upload/excel
```

### 2. Affichage des données CEL
```
GET /api/v1/cels/:codeCellule/data/excel-format
```

---

## 📤 1. UPLOAD DE FICHIER EXCEL

### Endpoint
```
POST /api/v1/legislatives/upload/excel
```

### Authentification
- **Requis** : Oui (JWT Bearer Token)
- **Header** : `Authorization: Bearer <token>`

### Permissions
- **SADMIN** : ✅ Peut uploader des fichiers
- **ADMIN** : ✅ Peut uploader des fichiers
- **USER** : ✅ Peut uploader des fichiers (pour ses CELs assignées)

### Content-Type
```
multipart/form-data
```

### Body (FormData)

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `excelFile` | File | ✅ Oui | Fichier Excel (.xlsm) à uploader |
| `codCel` | string | ✅ Oui | Code CEL (ex: "S003") |

**⚠️ IMPORTANT** :
- Le fichier doit être au format **.xlsm** (Excel avec macros)
- Taille maximale : **10MB**
- Le code CEL doit correspondre au code CEL extrait du fichier

### Réponse

**Succès (201 Created)**
```json
{
  "importId": 1,
  "codCel": "S003",
  "codCe": "004",
  "nombreBureauxTraites": 18,
  "nombreCandidats": 10,
  "statut": "SUCCESS",
  "message": "Import réussi : 18 bureaux de vote traités",
  "dateImport": "2025-01-15T10:00:00.000Z"
}
```

**Champs de la réponse** :
- `importId` : ID de l'enregistrement d'import dans `TBL_IMPORT_EXCEL`
- `codCel` : Code CEL traité
- `codCe` : Code circonscription
- `nombreBureauxTraites` : Nombre de bureaux de vote traités
- `nombreCandidats` : Nombre de candidats détectés
- `statut` : Statut de l'import (`SUCCESS`, `PARTIAL`, `ERROR`)
- `message` : Message descriptif
- `dateImport` : Date et heure de l'import

### Erreurs possibles

1. **Fichier manquant** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Aucun fichier fourni"
   }
   ```

2. **Type de fichier invalide** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Type de fichier invalide. Seuls les fichiers .xlsm et .xlsx sont acceptés."
   }
   ```

3. **Fichier trop volumineux** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Le fichier est trop volumineux. Taille maximale : 10MB"
   }
   ```

4. **CEL non trouvée** : `404 Not Found`
   ```json
   {
     "statusCode": 404,
     "message": "La CEL avec le code \"S003\" n'existe pas"
   }
   ```

5. **Code CEL ne correspond pas** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Le code CEL extrait du fichier (S004) ne correspond pas au code fourni (S003)"
   }
   ```

6. **Numéros de dossier invalides** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Les numéros de dossier suivants n'existent pas ou ne correspondent pas à la circonscription 004 : U-99999, L-88888"
   }
   ```

7. **Format de fichier invalide** : `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "Le fichier CSV ne contient pas assez de lignes. Format attendu : au moins 18 lignes de métadonnées."
   }
   ```

### Exemple d'intégration

#### Avec Fetch API
```javascript
async function uploadLegislativesExcel(file, codCel, token) {
  try {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('codCel', codCel);

    const response = await fetch('http://api.example.com/api/v1/legislatives/upload/excel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Ne PAS mettre Content-Type, le navigateur le fera automatiquement avec FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw error;
  }
}

// Utilisation
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

if (file) {
  uploadLegislativesExcel(file, 'S003', token)
    .then(result => {
      console.log('Upload réussi:', result);
      console.log(`${result.nombreBureauxTraites} bureaux traités`);
      console.log(`${result.nombreCandidats} candidats détectés`);
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
}
```

#### Avec React (Hooks + Axios)
```typescript
import { useState } from 'react';
import axios from 'axios';

interface UploadResult {
  importId: number;
  codCel: string;
  codCe: string;
  nombreBureauxTraites: number;
  nombreCandidats: number;
  statut: string;
  message: string;
  dateImport: string;
}

export function useUploadLegislativesExcel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadExcel = async (file: File, codCel: string) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('excelFile', file);
      formData.append('codCel', codCel);

      const response = await axios.post<UploadResult>(
        'http://api.example.com/api/v1/legislatives/upload/excel',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'upload';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { uploadExcel, loading, error, progress };
}

// Composant React
function UploadLegislativesForm() {
  const { uploadExcel, loading, error, progress } = useUploadLegislativesExcel();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [codCel, setCodCel] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !codCel) return;

    try {
      const uploadResult = await uploadExcel(selectedFile, codCel);
      setResult(uploadResult);
      // Afficher un message de succès
    } catch (err) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Valider le type de fichier
      const allowedTypes = [
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier invalide. Seuls les fichiers .xlsm et .xlsx sont acceptés.');
        return;
      }

      // Valider la taille (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('Le fichier est trop volumineux. Taille maximale : 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="codCel">Code CEL :</label>
        <input
          id="codCel"
          type="text"
          value={codCel}
          onChange={(e) => setCodCel(e.target.value)}
          placeholder="S003"
          required
        />
      </div>

      <div>
        <label htmlFor="excelFile">Fichier Excel (.xlsm) :</label>
        <input
          id="excelFile"
          type="file"
          accept=".xlsm,.xlsx"
          onChange={handleFileChange}
          required
        />
        {selectedFile && (
          <p>
            Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {loading && (
        <div>
          <p>Upload en cours... {progress}%</p>
          <progress value={progress} max={100} />
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="success">
          <h3>Upload réussi !</h3>
          <p>{result.message}</p>
          <ul>
            <li>Bureaux traités : {result.nombreBureauxTraites}</li>
            <li>Candidats détectés : {result.nombreCandidats}</li>
            <li>Circonscription : {result.codCe}</li>
          </ul>
        </div>
      )}

      <button type="submit" disabled={loading || !selectedFile || !codCel}>
        {loading ? 'Upload en cours...' : 'Uploader le fichier'}
      </button>
    </form>
  );
}
```

#### Avec Axios (sans React)
```typescript
import axios from 'axios';

async function uploadLegislativesExcel(
  file: File,
  codCel: string,
  token: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('excelFile', file);
  formData.append('codCel', codCel);

  try {
    const response = await axios.post<UploadResult>(
      'http://api.example.com/api/v1/legislatives/upload/excel',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Erreur lors de l\'upload');
    }
    throw error;
  }
}
```

---

## 📊 2. AFFICHAGE DES DONNÉES CEL AU FORMAT EXCEL

### Endpoint
```
GET /api/v1/cels/:codeCellule/data/excel-format
```

### Authentification
- **Requis** : Oui (JWT Bearer Token)
- **Header** : `Authorization: Bearer <token>`

### Permissions
- **SADMIN** : ✅ Peut voir toutes les CELs
- **ADMIN** : ✅ Peut voir toutes les CELs
- **USER** : ✅ Peut voir uniquement les CELs de ses circonscriptions assignées

### Paramètres
- `codeCellule` : Code de la CEL (ex: "S003")

### Réponse

**Succès (200 OK)**
```json
{
  "codCel": "S003",
  "libCel": "CESP CECHI",
  "codCe": "004",
  "libCe": "ANANGUIE, CECHI ET RUBINO, COMMUNES ET SOUS-PREFECTURES",
  "candidats": [
    {
      "numDos": "U-02108",
      "nom": "AKOUE BEDE ANSELME"
    },
    {
      "numDos": "U-02122",
      "nom": "TCHIMOU OKOMAN EMMANUEL"
    },
    {
      "numDos": "U-02123",
      "nom": "OFFO ABOLE SYLVAIN"
    }
  ],
  "data": [
    {
      "COD_CE": "004",
      "COD_CEL": "S003",
      "ORD": 1,
      "REF_LV": "001006098001",
      "LIB_LV": "EPP 1 CECHI",
      "NUMERO_BV": "01",
      "POP_HOM": 198,
      "POP_FEM": 202,
      "POP_TOTAL": 400,
      "VOT_HOM": 50,
      "VOT_FEM": 50,
      "TOTAL_VOT": 100,
      "TAUX_PART": 25.0,
      "BUL_NUL": 0,
      "SUF_EXP": 100,
      "BUL_BLANC": 100,
      "U-02108": 0,
      "U-02122": 10,
      "U-02123": 10,
      "U-02136": 10,
      "U-02143": 10,
      "U-02145": 10,
      "U-02147": 10,
      "U-03509": 10,
      "U-03517": 10,
      "U-03529": 10
    },
    {
      "COD_CE": "004",
      "COD_CEL": "S003",
      "ORD": 2,
      "REF_LV": "001006098001",
      "LIB_LV": "EPP 1 CECHI",
      "NUMERO_BV": "02",
      "POP_HOM": 205,
      "POP_FEM": 195,
      "POP_TOTAL": 400,
      "VOT_HOM": 50,
      "VOT_FEM": 50,
      "TOTAL_VOT": 100,
      "TAUX_PART": 25.0,
      "BUL_NUL": 0,
      "SUF_EXP": 100,
      "BUL_BLANC": 100,
      "U-02108": 0,
      "U-02122": 10,
      "U-02123": 10,
      "U-02136": 10,
      "U-02143": 10,
      "U-02145": 10,
      "U-02147": 10,
      "U-03509": 10,
      "U-03517": 10,
      "U-03529": 10
    }
  ]
}
```

**Structure de la réponse** :
- `codCel` : Code CEL
- `libCel` : Libellé CEL
- `codCe` : Code circonscription
- `libCe` : Libellé circonscription (peut être `null`)
- `candidats` : Liste des candidats avec `numDos` et `nom`
- `data` : Tableau de lignes de données

**Colonnes fixes dans `data`** :
- `COD_CE` : Code circonscription
- `COD_CEL` : Code CEL
- `ORD` : Numéro d'ordre
- `REF_LV` : Code lieu de vote (12 chiffres)
- `LIB_LV` : Libellé lieu de vote
- `NUMERO_BV` : Numéro bureau de vote
- `POP_HOM` : Population hommes
- `POP_FEM` : Population femmes
- `POP_TOTAL` : Population totale
- `VOT_HOM` : Votes hommes
- `VOT_FEM` : Votes femmes
- `TOTAL_VOT` : Total votes
- `TAUX_PART` : Taux de participation (en pourcentage)
- `BUL_NUL` : Bulletins nuls
- `SUF_EXP` : Suffrages exprimés
- `BUL_BLANC` : Bulletins blancs

**Colonnes dynamiques dans `data`** :
- Une colonne par candidat avec `NUM_DOS` comme nom de colonne (ex: `U-02108`, `U-02122`)
- Chaque colonne contient le score du candidat pour ce bureau de vote

### Erreurs possibles

1. **CEL non trouvée** : `404 Not Found`
   ```json
   {
     "statusCode": 404,
     "message": "CEL avec le code S003 non trouvée"
   }
   ```

2. **Accès interdit (USER)** : `403 Forbidden`
   ```json
   {
     "statusCode": 403,
     "message": "Vous n'avez pas accès à cette cellule électorale"
   }
   ```

3. **Aucune circonscription** : `404 Not Found`
   ```json
   {
     "statusCode": 404,
     "message": "Aucune circonscription trouvée pour la CEL S003"
   }
   ```

### Exemple d'intégration

#### Avec Fetch API
```javascript
async function getCelDataExcelFormat(codCel, token) {
  try {
    const response = await fetch(
      `http://api.example.com/api/v1/cels/${codCel}/data/excel-format`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    throw error;
  }
}

// Utilisation
getCelDataExcelFormat('S003', token)
  .then(data => {
    console.log('CEL:', data.codCel, data.libCel);
    console.log('Circonscription:', data.codCe, data.libCe);
    console.log('Candidats:', data.candidats);
    console.log('Nombre de bureaux:', data.data.length);
    
    // Afficher les données dans un tableau
    displayExcelData(data);
  })
  .catch(error => {
    console.error('Erreur:', error);
  });
```

#### Avec React (Hooks + Axios)
```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Candidat {
  numDos: string;
  nom: string;
}

interface CelExcelData {
  codCel: string;
  libCel: string;
  codCe: string;
  libCe: string | null;
  candidats: Candidat[];
  data: Array<Record<string, any>>;
}

export function useCelExcelData(codCel: string | null) {
  const [data, setData] = useState<CelExcelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codCel) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        const response = await axios.get<CelExcelData>(
          `http://api.example.com/api/v1/cels/${codCel}/data/excel-format`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codCel]);

  return { data, loading, error };
}

// Composant React pour afficher les données
function CelExcelDataTable({ codCel }: { codCel: string }) {
  const { data, loading, error } = useCelExcelData(codCel);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div>Aucune donnée</div>;

  // Colonnes fixes
  const fixedColumns = [
    'COD_CE',
    'COD_CEL',
    'ORD',
    'REF_LV',
    'LIB_LV',
    'NUMERO_BV',
    'POP_HOM',
    'POP_FEM',
    'POP_TOTAL',
    'VOT_HOM',
    'VOT_FEM',
    'TOTAL_VOT',
    'TAUX_PART',
    'BUL_NUL',
    'SUF_EXP',
    'BUL_BLANC',
  ];

  // Colonnes dynamiques (candidats)
  const candidateColumns = data.candidats.map(c => c.numDos);

  return (
    <div>
      <h2>{data.libCel} ({data.codCel})</h2>
      <p>Circonscription : {data.codCe} - {data.libCe || 'N/A'}</p>
      <p>{data.data.length} bureaux de vote</p>
      <p>{data.candidats.length} candidats</p>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {/* Colonnes fixes */}
              {fixedColumns.map(col => (
                <th key={col}>{col}</th>
              ))}
              {/* Colonnes candidats */}
              {data.candidats.map(candidat => (
                <th key={candidat.numDos} title={candidat.nom}>
                  {candidat.numDos}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.data.map((row, index) => (
              <tr key={index}>
                {/* Colonnes fixes */}
                {fixedColumns.map(col => (
                  <td key={col}>{row[col]}</td>
                ))}
                {/* Colonnes candidats */}
                {candidateColumns.map(numDos => (
                  <td key={numDos}>{row[numDos] || 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

#### Export vers Excel (avec xlsx)
```typescript
import * as XLSX from 'xlsx';

function exportCelDataToExcel(celData: CelExcelData) {
  // Préparer les données pour Excel
  const headers = [
    'COD_CE',
    'COD_CEL',
    'ORD',
    'REF_LV',
    'LIB_LV',
    'NUMERO_BV',
    'POP_HOM',
    'POP_FEM',
    'POP_TOTAL',
    'VOT_HOM',
    'VOT_FEM',
    'TOTAL_VOT',
    'TAUX_PART',
    'BUL_NUL',
    'SUF_EXP',
    'BUL_BLANC',
    ...celData.candidats.map(c => c.numDos), // Colonnes candidats
  ];

  const rows = celData.data.map(row => 
    headers.map(header => row[header] || 0)
  );

  // Créer le workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Ajouter la feuille
  XLSX.utils.book_append_sheet(wb, ws, celData.libCel);

  // Télécharger
  XLSX.writeFile(wb, `${celData.codCel}_${celData.libCel}.xlsx`);
}

// Utilisation
getCelDataExcelFormat('S003', token)
  .then(data => {
    exportCelDataToExcel(data);
  });
```

---

## 🎯 CAS D'USAGE COMPLETS

### Cas 1 : Formulaire d'upload complet avec validation

```typescript
function UploadLegislativesPage() {
  const { uploadExcel, loading, error, progress } = useUploadLegislativesExcel();
  const { cels } = useCelsSimple(); // Hook pour charger la liste des CELs
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCodCel, setSelectedCodCel] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedCodCel) return;

    try {
      const uploadResult = await uploadExcel(selectedFile, selectedCodCel);
      setResult(uploadResult);
      
      // Afficher un message de succès
      alert(`Upload réussi ! ${uploadResult.nombreBureauxTraites} bureaux traités.`);
      
      // Réinitialiser le formulaire
      setSelectedFile(null);
      setSelectedCodCel('');
    } catch (err) {
      // L'erreur est déjà gérée par le hook
    }
  };

  return (
    <div>
      <h1>Upload Fichier Excel Législatives</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="codCel">Sélectionner une CEL :</label>
          <select
            id="codCel"
            value={selectedCodCel}
            onChange={(e) => setSelectedCodCel(e.target.value)}
            required
          >
            <option value="">-- Sélectionner une CEL --</option>
            {cels.map(cel => (
              <option key={cel.codeCellule} value={cel.codeCellule}>
                {cel.codeCellule} - {cel.libelleCellule}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="excelFile">Fichier Excel (.xlsm) :</label>
          <input
            id="excelFile"
            type="file"
            accept=".xlsm,.xlsx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validation
                if (file.size > 10 * 1024 * 1024) {
                  alert('Fichier trop volumineux (max 10MB)');
                  return;
                }
                setSelectedFile(file);
              }
            }}
            required
          />
        </div>

        {loading && (
          <div>
            <p>Upload en cours... {progress}%</p>
            <progress value={progress} max={100} />
          </div>
        )}

        {error && (
          <div className="error">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {result && (
          <div className="success">
            <h3>✅ Upload réussi !</h3>
            <ul>
              <li>Import ID : {result.importId}</li>
              <li>Bureaux traités : {result.nombreBureauxTraites}</li>
              <li>Candidats : {result.nombreCandidats}</li>
              <li>Circonscription : {result.codCe}</li>
            </ul>
          </div>
        )}

        <button type="submit" disabled={loading || !selectedFile || !selectedCodCel}>
          {loading ? 'Upload en cours...' : 'Uploader'}
        </button>
      </form>
    </div>
  );
}
```

### Cas 2 : Visualisation des données CEL avec tableau

```typescript
function CelDataViewPage({ codCel }: { codCel: string }) {
  const { data, loading, error } = useCelExcelData(codCel);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!data) return;
    
    setExporting(true);
    try {
      exportCelDataToExcel(data);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div>Chargement des données...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div>Aucune donnée disponible</div>;

  const fixedColumns = [
    'COD_CE', 'COD_CEL', 'ORD', 'REF_LV', 'LIB_LV', 'NUMERO_BV',
    'POP_HOM', 'POP_FEM', 'POP_TOTAL',
    'VOT_HOM', 'VOT_FEM', 'TOTAL_VOT',
    'TAUX_PART', 'BUL_NUL', 'SUF_EXP', 'BUL_BLANC',
  ];

  return (
    <div>
      <div className="header">
        <h1>{data.libCel} ({data.codCel})</h1>
        <p>Circonscription : {data.codCe} - {data.libCe || 'N/A'}</p>
        <p>
          <strong>{data.data.length}</strong> bureaux de vote | 
          <strong> {data.candidats.length}</strong> candidats
        </p>
        <button onClick={handleExport} disabled={exporting}>
          {exporting ? 'Export...' : 'Exporter vers Excel'}
        </button>
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="excel-table">
          <thead>
            <tr>
              {fixedColumns.map(col => (
                <th key={col}>{col}</th>
              ))}
              {data.candidats.map(c => (
                <th key={c.numDos} title={c.nom}>
                  {c.numDos}
                </th>
              ))}
            </tr>
            {/* Ligne d'en-tête avec noms des candidats */}
            <tr>
              {fixedColumns.map(col => (
                <th key={col}></th>
              ))}
              {data.candidats.map(c => (
                <th key={c.numDos} className="candidate-name">
                  {c.nom}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.data.map((row, index) => (
              <tr key={index}>
                {fixedColumns.map(col => (
                  <td key={col}>{row[col]}</td>
                ))}
                {data.candidats.map(c => (
                  <td key={c.numDos} className="score">
                    {row[c.numDos] || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Cas 3 : Intégration complète avec navigation

```typescript
function LegislativesDataPage() {
  const [selectedCel, setSelectedCel] = useState<string | null>(null);
  const { cels } = useCelsSimple();

  return (
    <div>
      <nav>
        <h2>Sélectionner une CEL</h2>
        <select
          value={selectedCel || ''}
          onChange={(e) => setSelectedCel(e.target.value || null)}
        >
          <option value="">-- Sélectionner une CEL --</option>
          {cels.map(cel => (
            <option key={cel.codeCellule} value={cel.codeCellule}>
              {cel.codeCellule} - {cel.libelleCellule}
            </option>
          ))}
        </select>
      </nav>

      {selectedCel && (
        <CelDataViewPage codCel={selectedCel} />
      )}
    </div>
  );
}
```

---

## ⚠️ POINTS IMPORTANTS

### 1. Format de fichier pour l'upload

**Accepté** :
- ✅ `.xlsm` (Excel avec macros) - **Recommandé**
- ✅ `.xlsx` (Excel standard)

**Rejeté** :
- ❌ `.csv` (le backend génère le CSV automatiquement)
- ❌ `.xls` (ancien format Excel)
- ❌ Autres formats

### 2. Taille maximale

- **Limite** : 10MB
- **Recommandation** : Valider la taille côté frontend avant l'upload

### 3. Colonnes dynamiques

**Important** : Le nombre de colonnes de scores varie selon le nombre de candidats dans la circonscription. Le frontend doit :
- ✅ Utiliser la liste `candidats` pour déterminer les colonnes
- ✅ Gérer dynamiquement l'affichage des colonnes
- ✅ Ne pas hardcoder le nombre de candidats

### 4. Gestion des valeurs nulles

- Les scores manquants sont retournés comme `0`
- Les champs optionnels peuvent être `null` ou `undefined`
- Toujours utiliser des valeurs par défaut lors de l'affichage

### 5. Performance

- Les données peuvent être volumineuses (plusieurs centaines de bureaux)
- Utiliser la pagination ou le lazy loading si nécessaire
- Considérer l'export Excel pour les grandes quantités de données

### 6. Validation côté frontend

**Avant l'upload** :
- ✅ Vérifier le type de fichier
- ✅ Vérifier la taille (10MB max)
- ✅ Vérifier que le code CEL est sélectionné
- ✅ Afficher un message de confirmation

**Après l'upload** :
- ✅ Afficher le résultat (nombre de bureaux traités)
- ✅ Gérer les erreurs de manière claire
- ✅ Proposer de visualiser les données importées

---

## 📝 CHECKLIST D'INTÉGRATION

### Phase 1 : Configuration
- [ ] Configurer l'URL de base de l'API
- [ ] Configurer la gestion du token d'authentification
- [ ] Créer un service API ou utiliser Axios/Fetch

### Phase 2 : Upload
- [ ] Créer un hook/service pour `POST /api/v1/legislatives/upload/excel`
- [ ] Créer un composant de sélection de fichier
- [ ] Créer un composant de sélection de CEL
- [ ] Implémenter la validation du fichier (type, taille)
- [ ] Implémenter la barre de progression
- [ ] Gérer les erreurs d'upload

### Phase 3 : Affichage
- [ ] Créer un hook/service pour `GET /api/v1/cels/:codCel/data/excel-format`
- [ ] Créer un composant de tableau pour afficher les données
- [ ] Gérer les colonnes fixes
- [ ] Gérer les colonnes dynamiques (candidats)
- [ ] Implémenter l'export vers Excel (optionnel)

### Phase 4 : Intégration
- [ ] Intégrer la sélection de CEL depuis la liste simple
- [ ] Créer une page de navigation entre upload et visualisation
- [ ] Ajouter des messages de succès/erreur
- [ ] Implémenter le rafraîchissement après upload

### Phase 5 : Tests
- [ ] Tester l'upload avec un fichier valide
- [ ] Tester l'upload avec un fichier invalide
- [ ] Tester l'affichage des données
- [ ] Tester la gestion des erreurs
- [ ] Tester les permissions (USER vs ADMIN)

---

## 🔗 RESSOURCES

### Endpoints connexes
- `GET /api/v1/cels/list/simple` - Liste simple des CELs (pour sélection)
- `GET /api/v1/cels/:codeCellule` - Détails d'une CEL
- `GET /api/v1/circonscriptions/list/simple` - Liste simple des circonscriptions

### Documentation Swagger
- Accéder à la documentation Swagger pour voir les détails complets des endpoints
- URL : `http://api.example.com/api/docs` (selon votre configuration)

### Bibliothèques recommandées
- **Axios** : Pour les requêtes HTTP
- **xlsx** : Pour l'export vers Excel (optionnel)
- **react-dropzone** : Pour le drag & drop de fichiers (optionnel)

---

**Date de création** : 2025-01-XX  
**Version** : 1.0  
**Statut** : Documentation pour intégration frontend - Upload et affichage législatives

---

*Ce document fournit tous les éléments nécessaires pour intégrer l'upload de fichiers Excel et l'affichage des données CEL dans votre application frontend. Les exemples de code sont fournis pour les frameworks les plus courants, mais peuvent être adaptés à votre stack technique.*

