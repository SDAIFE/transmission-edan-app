# 📢 PROMPT FRONTEND : Publication des Résultats Législatives

## 🎯 Vue d'Ensemble

Ce document détaille l'intégration frontend pour la **publication des résultats des élections législatives**. L'API permet de gérer la publication des circonscriptions électorales, avec validation, statistiques, et affichage des données agrégées.

## 🔑 Concepts Clés

### Entité Principale : Circonscription

- **Circonscription** : Entité de publication (remplace les départements de l'API présidentielle)
- **CEL (Cellule Électorale Locale)** : Sous-entité d'une circonscription
- **Publication** : Action qui rend les résultats d'une circonscription publics
- **Statut de publication** : `'0'` (Non publié), `'1'` (Publié), `'C'` (Annulé)

### Workflow de Publication

1. **Import des données** : Les CELs doivent être importées (`ETA_RESULTAT_CEL = 'I'`)
2. **Validation** : Vérification que toutes les CELs de la circonscription sont importées
3. **Publication** : Mise à jour des statuts (circonscription, CELs, résultats)
4. **Affichage** : Données agrégées avec scores des candidats

---

## 🔐 Authentification et Permissions

### Authentification Requise

Toutes les routes nécessitent un **JWT token** dans le header :

```http
Authorization: Bearer <token>
```

### Permissions par Rôle

| Route | SADMIN | ADMIN | USER |
|-------|--------|-------|------|
| `GET /stats` | ✅ | ✅ | ✅ (circonscriptions assignées) |
| `GET /circonscriptions` | ✅ | ✅ | ✅ (circonscriptions assignées) |
| `POST /circonscriptions/:id/publish` | ✅ | ✅ | ❌ |
| `POST /circonscriptions/:id/cancel` | ✅ | ✅ | ❌ |
| `GET /circonscriptions/:id/details` | ✅ | ✅ | ✅ (circonscriptions assignées) |
| `GET /circonscriptions/:codeCirconscription/data` | ✅ | ✅ | ✅ (circonscriptions assignées) |
| `GET /national/data` | ✅ | ✅ | ❌ |

---

## 📡 Endpoints Disponibles

### 1. Statistiques Globales

**Endpoint** : `GET /api/v1/legislatives/publications/stats`

**Description** : Récupère les statistiques globales des circonscriptions et CELs.

**Permissions** : `SADMIN`, `ADMIN`, `USER` (données filtrées pour USER)

**Query Parameters** : Aucun

**Réponse** :

```typescript
{
  totalCirconscriptions: number;        // Nombre total de circonscriptions
  publishedCirconscriptions: number;     // Nombre de circonscriptions publiées
  pendingCirconscriptions: number;       // Nombre de circonscriptions en attente
  totalCels: number;                    // Nombre total de CELs
  importedCels: number;                  // Nombre de CELs importées
  pendingCels: number;                  // Nombre de CELs en attente
  publicationRate: number;              // Taux de publication global (%)
}
```

**Exemple de réponse** :

```json
{
  "totalCirconscriptions": 255,
  "publishedCirconscriptions": 200,
  "pendingCirconscriptions": 55,
  "totalCels": 5000,
  "importedCels": 4500,
  "pendingCels": 500,
  "publicationRate": 78.43
}
```

**Exemple d'utilisation (React)** :

```typescript
import axios from 'axios';

const getPublicationStats = async (token: string) => {
  try {
    const response = await axios.get(
      '/api/v1/legislatives/publications/stats',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
```

**Exemple d'utilisation (Vue.js)** :

```typescript
import axios from 'axios';

const getPublicationStats = async (token: string) => {
  try {
    const response = await axios.get(
      '/api/v1/legislatives/publications/stats',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
```

---

### 2. Liste des Circonscriptions

**Endpoint** : `GET /api/v1/legislatives/publications/circonscriptions`

**Description** : Récupère la liste paginée des circonscriptions avec leurs métriques.

**Permissions** : `SADMIN`, `ADMIN`, `USER` (circonscriptions assignées)

**Query Parameters** :

| Paramètre | Type | Requis | Description | Exemple |
|-----------|------|--------|-------------|---------|
| `page` | number | Non | Numéro de page (commence à 1) | `1` |
| `limit` | number | Non | Nombre d'éléments par page | `10` |
| `statPub` | string | Non | Statut de publication (`'0'`, `'1'`, `'C'`) | `'1'` |
| `search` | string | Non | Recherche par code ou libellé | `'004'` |

**Réponse** :

```typescript
{
  circonscriptions: Array<{
    id: number;                          // ID de la circonscription
    codeCirconscription: string;         // COD_CE (ex: '004')
    libelleCirconscription: string | null; // LIB_CE
    nombreSieges: number | null;         // NB_SIEGE
    totalCels: number;                   // Nombre total de CELs
    importedCels: number;                // Nombre de CELs importées
    pendingCels: number;                 // Nombre de CELs en attente
    publicationStatus: string;           // '0', '1', ou 'C'
    lastUpdate: Date;                    // Date de dernière mise à jour
    cels: Array<{
      codeCel: string;                  // Code CEL (ex: 'S003')
      libelleCel: string | null;        // Libellé CEL
      etatResultat: string | null;      // 'I', 'PUBLISHED', 'CANCELLED', etc.
    }>;
  }>;
  total: number;                        // Nombre total de circonscriptions
  page: number;                         // Page actuelle
  limit: number;                         // Nombre d'éléments par page
  totalPages: number;                   // Nombre total de pages
}
```

**Exemple de réponse** :

```json
{
  "circonscriptions": [
    {
      "id": 1,
      "codeCirconscription": "004",
      "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
      "nombreSieges": 1,
      "totalCels": 10,
      "importedCels": 8,
      "pendingCels": 2,
      "publicationStatus": "1",
      "lastUpdate": "2025-12-02T10:00:00Z",
      "cels": [
        {
          "codeCel": "S003",
          "libelleCel": "CESP CECHI",
          "etatResultat": "PUBLISHED"
        },
        {
          "codeCel": "S008",
          "libelleCel": "CESP RUBINO",
          "etatResultat": "I"
        }
      ]
    }
  ],
  "total": 255,
  "page": 1,
  "limit": 10,
  "totalPages": 26
}
```

**Exemple d'utilisation (React)** :

```typescript
import axios from 'axios';

interface CirconscriptionQuery {
  page?: number;
  limit?: number;
  statPub?: '0' | '1' | 'C';
  search?: string;
}

const getCirconscriptions = async (
  token: string,
  query: CirconscriptionQuery = {}
) => {
  try {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.statPub) params.append('statPub', query.statPub);
    if (query.search) params.append('search', query.search);

    const response = await axios.get(
      `/api/v1/legislatives/publications/circonscriptions?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des circonscriptions:', error);
    throw error;
  }
};

// Utilisation
const data = await getCirconscriptions(token, {
  page: 1,
  limit: 10,
  statPub: '1',
  search: '004',
});
```

---

### 3. Publication d'une Circonscription

**Endpoint** : `POST /api/v1/legislatives/publications/circonscriptions/:id/publish`

**Description** : Publie une circonscription après validation que toutes les CELs sont importées.

**Permissions** : `SADMIN`, `ADMIN` uniquement

**Path Parameters** :

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `id` | string | Code circonscription (COD_CE) | `'004'` |

**Body** : Aucun

**Réponse** :

```typescript
{
  success: boolean;
  message: string;
  circonscription?: {
    codeCirconscription: string;
    libelleCirconscription: string | null;
    publicationStatus: string;  // '1' après publication
  };
  error?: string;  // Si success = false
}
```

**Exemple de réponse (succès)** :

```json
{
  "success": true,
  "message": "Circonscription 004 publiée avec succès",
  "circonscription": {
    "codeCirconscription": "004",
    "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
    "publicationStatus": "1"
  }
}
```

**Exemple de réponse (erreur - CELs non importées)** :

```json
{
  "success": false,
  "message": "Impossible de publier la circonscription 004. Les CELs suivantes ne sont pas importées : S003, S008",
  "error": "Bad Request"
}
```

**Exemple d'utilisation (React)** :

```typescript
import axios from 'axios';

const publishCirconscription = async (
  token: string,
  codeCirconscription: string
) => {
  try {
    const response = await axios.post(
      `/api/v1/legislatives/publications/circonscriptions/${codeCirconscription}/publish`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      // Erreur de validation (CELs non importées)
      throw new Error(error.response.data.message);
    }
    console.error('Erreur lors de la publication:', error);
    throw error;
  }
};

// Utilisation
try {
  const result = await publishCirconscription(token, '004');
  console.log('Publication réussie:', result.message);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

**Validation avant publication** :

```typescript
// Vérifier que toutes les CELs sont importées avant d'afficher le bouton "Publier"
const canPublish = (circonscription: any) => {
  return (
    circonscription.importedCels === circonscription.totalCels &&
    circonscription.totalCels > 0
  );
};
```

---

### 4. Annulation de Publication

**Endpoint** : `POST /api/v1/legislatives/publications/circonscriptions/:id/cancel`

**Description** : Annule la publication d'une circonscription.

**Permissions** : `SADMIN`, `ADMIN` uniquement

**Path Parameters** :

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `id` | string | Code circonscription (COD_CE) | `'004'` |

**Body** : Aucun

**Réponse** :

```typescript
{
  success: boolean;
  message: string;
  circonscription?: {
    codeCirconscription: string;
    libelleCirconscription: string | null;
    publicationStatus: string;  // 'C' après annulation
  };
}
```

**Exemple de réponse** :

```json
{
  "success": true,
  "message": "Publication de la circonscription 004 annulée avec succès",
  "circonscription": {
    "codeCirconscription": "004",
    "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
    "publicationStatus": "C"
  }
}
```

**Exemple d'utilisation (React)** :

```typescript
import axios from 'axios';

const cancelPublication = async (
  token: string,
  codeCirconscription: string
) => {
  try {
    const response = await axios.post(
      `/api/v1/legislatives/publications/circonscriptions/${codeCirconscription}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    throw error;
  }
};

// Utilisation avec confirmation
const handleCancel = async (codeCirconscription: string) => {
  if (
    window.confirm(
      'Êtes-vous sûr de vouloir annuler la publication de cette circonscription ?'
    )
  ) {
    try {
      const result = await cancelPublication(token, codeCirconscription);
      console.log('Annulation réussie:', result.message);
      // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
};
```

---

### 5. Détails d'une Circonscription

**Endpoint** : `GET /api/v1/legislatives/publications/circonscriptions/:id/details`

**Description** : Récupère les détails complets d'une circonscription, incluant la liste des CELs et l'historique de publication.

**Permissions** : `SADMIN`, `ADMIN`, `USER` (circonscriptions assignées)

**Path Parameters** :

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `id` | string | Code circonscription (COD_CE) | `'004'` |

**Réponse** :

```typescript
{
  id: string;                           // ID de la circonscription
  codeCirconscription: string;          // COD_CE
  libelleCirconscription: string | null; // LIB_CE
  nombreSieges: number | null;          // NB_SIEGE
  totalCels: number;                    // Nombre total de CELs
  importedCels: number;                 // Nombre de CELs importées
  pendingCels: number;                  // Nombre de CELs en attente
  publicationStatus: string;             // '0', '1', ou 'C'
  lastUpdate: Date;                     // Date de dernière mise à jour
  cels: Array<{
    codeCel: string;
    libelleCel: string | null;
    etatResultat: string | null;        // 'I', 'PUBLISHED', 'CANCELLED', etc.
  }>;
  history: Array<{
    id: number;                         // ID de l'historique
    action: string;                      // 'PUBLISH' ou 'CANCEL'
    userId: string;                      // ID de l'utilisateur
    details: string | null;              // Détails de l'action
    timestamp: Date;                     // Date et heure de l'action
  }>;
}
```

**Exemple de réponse** :

```json
{
  "id": "1",
  "codeCirconscription": "004",
  "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
  "nombreSieges": 1,
  "totalCels": 10,
  "importedCels": 8,
  "pendingCels": 2,
  "publicationStatus": "1",
  "lastUpdate": "2025-12-02T10:00:00Z",
  "cels": [
    {
      "codeCel": "S003",
      "libelleCel": "CESP CECHI",
      "etatResultat": "PUBLISHED"
    }
  ],
  "history": [
    {
      "id": 1,
      "action": "PUBLISH",
      "userId": "cmgjqtg1j0037w46dgbcy95kc",
      "details": "Publication de la circonscription 004",
      "timestamp": "2025-12-02T10:00:00Z"
    }
  ]
}
```

**Exemple d'utilisation (React)** :

```typescript
import axios from 'axios';

const getCirconscriptionDetails = async (
  token: string,
  codeCirconscription: string
) => {
  try {
    const response = await axios.get(
      `/api/v1/legislatives/publications/circonscriptions/${codeCirconscription}/details`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Circonscription non trouvée');
    }
    if (error.response?.status === 403) {
      throw new Error('Accès interdit à cette circonscription');
    }
    console.error('Erreur lors de la récupération des détails:', error);
    throw error;
  }
};
```

---

### 6. Données Agrégées d'une Circonscription

**Endpoint** : `GET /api/v1/legislatives/publications/circonscriptions/:codeCirconscription/data`

**Description** : Récupère les données agrégées d'une circonscription avec les scores des candidats et les métriques par CEL.

**Permissions** : `SADMIN`, `ADMIN`, `USER` (circonscriptions assignées)

**Path Parameters** :

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `codeCirconscription` | string | Code circonscription (COD_CE) | `'004'` |

**Réponse** :

```typescript
{
  codeCirconscription: string;
  libelleCirconscription: string | null;
  inscrits: number;                     // Nombre total d'inscrits
  votants: number;                       // Nombre total de votants
  participation: number;                  // Taux de participation (%)
  nombreBureaux: number;                 // Nombre total de bureaux de vote
  candidats: Array<{
    numeroDossier: string;               // NUM_DOS (ex: 'U-02108')
    nom: string;                         // Nom du candidat ou intitulé de liste
    parti: string;                       // Sigle du parti ou 'INDEPENDANT'
    score: number;                        // Score total (nombre de voix)
    pourcentage: number;                  // Pourcentage de voix (%)
  }>;
  cels: Array<{
    codeCel: string;                     // Code CEL
    libelleCel: string | null;           // Libellé CEL
    inscrits: number;                     // Nombre d'inscrits dans la CEL
    votants: number;                      // Nombre de votants dans la CEL
    participation: number;                // Taux de participation (%)
    nombreBureaux: number;                 // Nombre de bureaux de vote
    candidats: Array<{
      numeroDossier: string;
      nom: string;
      parti: string;
      score: number;                      // Score pour cette CEL spécifique
      pourcentage: number;
    }>;
  }>;
}
```

**Exemple de réponse** :

```json
{
  "codeCirconscription": "004",
  "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
  "inscrits": 50000,
  "votants": 35000,
  "participation": 70.0,
  "nombreBureaux": 250,
  "candidats": [
    {
      "numeroDossier": "U-02108",
      "nom": "JEAN DUPONT",
      "parti": "PDCI",
      "score": 12500,
      "pourcentage": 35.71
    },
    {
      "numeroDossier": "U-02122",
      "nom": "MARIE MARTIN",
      "parti": "RHDP",
      "score": 11250,
      "pourcentage": 32.14
    }
  ],
  "cels": [
    {
      "codeCel": "S003",
      "libelleCel": "CESP CECHI",
      "inscrits": 25000,
      "votants": 17500,
      "participation": 70.0,
      "nombreBureaux": 125,
      "candidats": [
        {
          "numeroDossier": "U-02108",
          "nom": "JEAN DUPONT",
          "parti": "PDCI",
          "score": 6250,
          "pourcentage": 35.71
        },
        {
          "numeroDossier": "U-02122",
          "nom": "MARIE MARTIN",
          "parti": "RHDP",
          "score": 5625,
          "pourcentage": 32.14
        }
      ]
    }
  ]
}
```

**Exemple d'utilisation (React)** :

```typescript
import axios from 'axios';

const getCirconscriptionData = async (
  token: string,
  codeCirconscription: string
) => {
  try {
    const response = await axios.get(
      `/api/v1/legislatives/publications/circonscriptions/${codeCirconscription}/data`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Circonscription non trouvée');
    }
    if (error.response?.status === 403) {
      throw new Error('Accès interdit à cette circonscription');
    }
    console.error('Erreur lors de la récupération des données:', error);
    throw error;
  }
};

// Utilisation dans un composant React
const CirconscriptionDataView = ({ codeCirconscription }: { codeCirconscription: string }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCirconscriptionData(token, codeCirconscription);
        setData(result);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codeCirconscription]);

  if (loading) return <div>Chargement...</div>;
  if (!data) return <div>Aucune donnée disponible</div>;

  return (
    <div>
      <h2>{data.libelleCirconscription}</h2>
      <div>
        <p>Inscrits: {data.inscrits.toLocaleString()}</p>
        <p>Votants: {data.votants.toLocaleString()}</p>
        <p>Participation: {data.participation.toFixed(2)}%</p>
      </div>
      <h3>Candidats</h3>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Parti</th>
            <th>Score</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {data.candidats.map((candidat) => (
            <tr key={candidat.numeroDossier}>
              <td>{candidat.nom}</td>
              <td>{candidat.parti}</td>
              <td>{candidat.score.toLocaleString()}</td>
              <td>{candidat.pourcentage.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Données par CEL</h3>
      {data.cels.map((cel) => (
        <div key={cel.codeCel}>
          <h4>{cel.libelleCel} ({cel.codeCel})</h4>
          <p>Participation: {cel.participation.toFixed(2)}%</p>
          {/* Afficher les scores des candidats pour cette CEL */}
        </div>
      ))}
    </div>
  );
};
```

---

### 7. Données Nationales

**Endpoint** : `GET /api/v1/legislatives/publications/national/data`

**Description** : Récupère les données agrégées au niveau national avec les statistiques de toutes les circonscriptions.

**Permissions** : `SADMIN`, `ADMIN` uniquement

**Query Parameters** : Aucun

**Réponse** :

```typescript
{
  inscrits: number;                      // Nombre total d'inscrits au niveau national
  votants: number;                       // Nombre total de votants au niveau national
  participation: number;                 // Taux de participation global (%)
  nombreBureaux: number;                 // Nombre total de bureaux de vote
  nombreCirconscriptions: number;       // Nombre total de circonscriptions
  circonscriptionsPubliees: number;      // Nombre de circonscriptions publiées
  circonscriptionsEnAttente: number;     // Nombre de circonscriptions en attente
  candidats: Array<{
    numeroDossier: string;               // NUM_DOS
    nom: string;                         // Nom du candidat ou intitulé de liste
    parti: string;                       // Sigle du parti ou 'INDEPENDANT'
    score: number;                        // Score total national
    pourcentage: number;                  // Pourcentage de voix au niveau national (%)
    scoresParCirconscription: Record<string, number>; // Scores par circonscription
  }>;
  circonscriptions: Array<{
    codeCirconscription: string;
    libelleCirconscription: string | null;
    inscrits: number;
    votants: number;
    participation: number;
    nombreBureaux: number;
    publicationStatus: string | null;    // '0', '1', ou 'C'
  }>;
}
```

**Exemple de réponse** :

```json
{
  "inscrits": 5000000,
  "votants": 3500000,
  "participation": 70.0,
  "nombreBureaux": 10000,
  "nombreCirconscriptions": 255,
  "circonscriptionsPubliees": 200,
  "circonscriptionsEnAttente": 55,
  "candidats": [
    {
      "numeroDossier": "U-02108",
      "nom": "JEAN DUPONT",
      "parti": "PDCI",
      "score": 1250000,
      "pourcentage": 35.71,
      "scoresParCirconscription": {
        "004": 12500,
        "005": 11250,
        "006": 15000
      }
    }
  ],
  "circonscriptions": [
    {
      "codeCirconscription": "004",
      "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
      "inscrits": 50000,
      "votants": 35000,
      "participation": 70.0,
      "nombreBureaux": 250,
      "publicationStatus": "1"
    }
  ]
}
```

**Exemple d'utilisation (React)** :

```typescript
import axios from 'axios';

const getNationalData = async (token: string) => {
  try {
    const response = await axios.get(
      '/api/v1/legislatives/publications/national/data',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Accès interdit. Seuls les administrateurs peuvent accéder aux données nationales.');
    }
    console.error('Erreur lors de la récupération des données nationales:', error);
    throw error;
  }
};
```

---

## 🎨 Exemples d'Interface Utilisateur

### Tableau de Bord des Statistiques

```typescript
// Composant React pour afficher les statistiques
const PublicationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPublicationStats(token);
        setStats(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!stats) return <div>Aucune donnée</div>;

  return (
    <div className="dashboard">
      <div className="stat-card">
        <h3>Circonscriptions</h3>
        <p>Total: {stats.totalCirconscriptions}</p>
        <p>Publiées: {stats.publishedCirconscriptions}</p>
        <p>En attente: {stats.pendingCirconscriptions}</p>
        <p>Taux de publication: {stats.publicationRate.toFixed(2)}%</p>
      </div>
      <div className="stat-card">
        <h3>CELs</h3>
        <p>Total: {stats.totalCels}</p>
        <p>Importées: {stats.importedCels}</p>
        <p>En attente: {stats.pendingCels}</p>
      </div>
    </div>
  );
};
```

### Liste des Circonscriptions avec Actions

```typescript
// Composant React pour la liste des circonscriptions
const CirconscriptionsList = () => {
  const [circonscriptions, setCirconscriptions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ statPub: '', search: '' });
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole(); // Fonction à implémenter

  const fetchCirconscriptions = async () => {
    setLoading(true);
    try {
      const data = await getCirconscriptions(token, {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setCirconscriptions(data.circonscriptions);
      setPagination({
        ...pagination,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirconscriptions();
  }, [pagination.page, filters]);

  const handlePublish = async (codeCirconscription: string) => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir publier cette circonscription ?'
      )
    ) {
      try {
        const result = await publishCirconscription(token, codeCirconscription);
        alert(result.message);
        fetchCirconscriptions(); // Rafraîchir la liste
      } catch (error: any) {
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  const canPublish = (circ: any) => {
    return circ.importedCels === circ.totalCels && circ.totalCels > 0;
  };

  const isPublished = (circ: any) => {
    return circ.publicationStatus === '1';
  };

  return (
    <div>
      <div className="filters">
        <select
          value={filters.statPub}
          onChange={(e) => setFilters({ ...filters, statPub: e.target.value })}
        >
          <option value="">Tous les statuts</option>
          <option value="0">Non publié</option>
          <option value="1">Publié</option>
          <option value="C">Annulé</option>
        </select>
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Libellé</th>
            <th>CELs</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {circonscriptions.map((circ) => (
            <tr key={circ.codeCirconscription}>
              <td>{circ.codeCirconscription}</td>
              <td>{circ.libelleCirconscription}</td>
              <td>
                {circ.importedCels}/{circ.totalCels}
              </td>
              <td>
                {circ.publicationStatus === '1' && <span className="badge published">Publié</span>}
                {circ.publicationStatus === '0' && <span className="badge pending">En attente</span>}
                {circ.publicationStatus === 'C' && <span className="badge cancelled">Annulé</span>}
              </td>
              <td>
                {userRole === 'ADMIN' || userRole === 'SADMIN' ? (
                  <>
                    {!isPublished(circ) && canPublish(circ) && (
                      <button onClick={() => handlePublish(circ.codeCirconscription)}>
                        Publier
                      </button>
                    )}
                    {isPublished(circ) && (
                      <button onClick={() => handleCancel(circ.codeCirconscription)}>
                        Annuler
                      </button>
                    )}
                  </>
                ) : null}
                <button onClick={() => navigate(`/circonscriptions/${circ.codeCirconscription}`)}>
                  Voir détails
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
        >
          Précédent
        </button>
        <span>
          Page {pagination.page} sur {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};
```

### Affichage des Données Agrégées avec Graphiques

```typescript
// Composant React pour afficher les données agrégées avec graphiques
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const CirconscriptionDataView = ({ codeCirconscription }: { codeCirconscription: string }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCirconscriptionData(token, codeCirconscription);
        setData(result);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codeCirconscription]);

  if (loading) return <div>Chargement...</div>;
  if (!data) return <div>Aucune donnée disponible</div>;

  // Préparer les données pour le graphique
  const chartData = data.candidats.map((candidat) => ({
    nom: candidat.nom,
    score: candidat.score,
    pourcentage: candidat.pourcentage,
  }));

  return (
    <div className="circonscription-data">
      <h2>{data.libelleCirconscription}</h2>
      
      {/* Métriques globales */}
      <div className="metrics">
        <div className="metric">
          <label>Inscrits</label>
          <value>{data.inscrits.toLocaleString()}</value>
        </div>
        <div className="metric">
          <label>Votants</label>
          <value>{data.votants.toLocaleString()}</value>
        </div>
        <div className="metric">
          <label>Participation</label>
          <value>{data.participation.toFixed(2)}%</value>
        </div>
        <div className="metric">
          <label>Bureaux de vote</label>
          <value>{data.nombreBureaux}</value>
        </div>
      </div>

      {/* Graphique des scores */}
      <div className="chart">
        <h3>Résultats par candidat</h3>
        <BarChart width={800} height={400} data={chartData}>
          <XAxis dataKey="nom" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" fill="#8884d8" name="Voix" />
        </BarChart>
      </div>

      {/* Tableau des candidats */}
      <table>
        <thead>
          <tr>
            <th>Rang</th>
            <th>Nom</th>
            <th>Parti</th>
            <th>Score</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {data.candidats
            .sort((a, b) => b.score - a.score)
            .map((candidat, index) => (
              <tr key={candidat.numeroDossier}>
                <td>{index + 1}</td>
                <td>{candidat.nom}</td>
                <td>{candidat.parti}</td>
                <td>{candidat.score.toLocaleString()}</td>
                <td>{candidat.pourcentage.toFixed(2)}%</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Données par CEL */}
      <div className="cels-data">
        <h3>Données par CEL</h3>
        {data.cels.map((cel) => (
          <div key={cel.codeCel} className="cel-card">
            <h4>{cel.libelleCel} ({cel.codeCel})</h4>
            <p>Participation: {cel.participation.toFixed(2)}%</p>
            <p>Bureaux: {cel.nombreBureaux}</p>
            {/* Afficher les scores des candidats pour cette CEL */}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## ⚠️ Gestion des Erreurs

### Codes de Statut HTTP

| Code | Signification | Action Recommandée |
|------|---------------|-------------------|
| `200` | Succès | Afficher les données |
| `400` | Requête invalide | Afficher le message d'erreur (ex: CELs non importées) |
| `401` | Non authentifié | Rediriger vers la page de connexion |
| `403` | Accès interdit | Afficher un message d'erreur approprié |
| `404` | Ressource non trouvée | Afficher "Circonscription non trouvée" |
| `500` | Erreur serveur | Afficher un message générique et logger l'erreur |

### Exemple de Gestion d'Erreurs (React)

```typescript
import axios, { AxiosError } from 'axios';

const handleApiError = (error: AxiosError) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return error.response.data?.message || 'Requête invalide';
      case 401:
        // Rediriger vers la page de connexion
        window.location.href = '/login';
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      case 404:
        return 'Ressource non trouvée.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      default:
        return 'Une erreur est survenue.';
    }
  } else if (error.request) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
  } else {
    return 'Une erreur est survenue lors de la requête.';
  }
};

// Utilisation
try {
  const data = await getCirconscriptions(token, query);
  // Traiter les données
} catch (error) {
  const errorMessage = handleApiError(error as AxiosError);
  alert(errorMessage);
}
```

---

## 🔄 États et Statuts

### Statut de Publication (`publicationStatus`)

| Valeur | Signification | Affichage Recommandé |
|--------|---------------|----------------------|
| `'0'` ou `null` | Non publié / En attente | Badge "En attente" (gris) |
| `'1'` | Publié | Badge "Publié" (vert) |
| `'C'` | Annulé | Badge "Annulé" (rouge) |

### État Résultat CEL (`etatResultat`)

| Valeur | Signification | Affichage Recommandé |
|--------|---------------|----------------------|
| `null` | Non importé | Badge "Non importé" (gris) |
| `'I'` | Importé | Badge "Importé" (bleu) |
| `'PUBLISHED'` | Publié | Badge "Publié" (vert) |
| `'CANCELLED'` | Annulé | Badge "Annulé" (rouge) |

### Exemple de Composant de Badge

```typescript
const StatusBadge = ({ status, type }: { status: string | null; type: 'publication' | 'cel' }) => {
  const getBadgeConfig = () => {
    if (type === 'publication') {
      switch (status) {
        case '1':
          return { label: 'Publié', className: 'badge-published' };
        case 'C':
          return { label: 'Annulé', className: 'badge-cancelled' };
        default:
          return { label: 'En attente', className: 'badge-pending' };
      }
    } else {
      switch (status) {
        case 'I':
          return { label: 'Importé', className: 'badge-imported' };
        case 'PUBLISHED':
          return { label: 'Publié', className: 'badge-published' };
        case 'CANCELLED':
          return { label: 'Annulé', className: 'badge-cancelled' };
        default:
          return { label: 'Non importé', className: 'badge-pending' };
      }
    }
  };

  const config = getBadgeConfig();

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};
```

---

## 📊 Validation et Contrôles

### Validation avant Publication

Avant d'afficher le bouton "Publier", vérifier :

```typescript
const canPublish = (circonscription: any) => {
  return (
    circonscription.importedCels === circonscription.totalCels &&
    circonscription.totalCels > 0 &&
    circonscription.publicationStatus !== '1'
  );
};
```

### Indicateurs Visuels

```typescript
// Composant d'indicateur de progression
const ProgressIndicator = ({ imported, total }: { imported: number; total: number }) => {
  const percentage = total > 0 ? (imported / total) * 100 : 0;
  const isComplete = imported === total && total > 0;

  return (
    <div className="progress-indicator">
      <div className="progress-bar">
        <div
          className={`progress-fill ${isComplete ? 'complete' : 'incomplete'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="progress-text">
        {imported}/{total} CELs importées ({percentage.toFixed(0)}%)
      </span>
      {isComplete && <span className="checkmark">✓</span>}
    </div>
  );
};
```

---

## 🎯 Bonnes Pratiques

### 1. **Gestion du Cache**

```typescript
// Utiliser un cache pour éviter les requêtes répétées
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

### 2. **Optimisation des Requêtes**

```typescript
// Éviter les requêtes multiples inutiles
const useCirconscriptionData = (codeCirconscription: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getCirconscriptionData(token, codeCirconscription);
        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erreur:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [codeCirconscription]);

  return { data, loading };
};
```

### 3. **Gestion des Permissions**

```typescript
// Vérifier les permissions avant d'afficher les actions
const canPublishCirconscription = (userRole: string) => {
  return userRole === 'ADMIN' || userRole === 'SADMIN';
};

const canViewNationalData = (userRole: string) => {
  return userRole === 'ADMIN' || userRole === 'SADMIN';
};
```

### 4. **Formatage des Données**

```typescript
// Utilitaires de formatage
const formatNumber = (num: number) => {
  return num.toLocaleString('fr-FR');
};

const formatPercentage = (num: number) => {
  return `${num.toFixed(2)}%`;
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

---

## 📱 Exemple Complet : Page de Publication

```typescript
// Composant React complet pour la page de publication
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PublicationPage = () => {
  const [stats, setStats] = useState(null);
  const [circonscriptions, setCirconscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ statPub: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const token = getAuthToken(); // Fonction à implémenter
  const userRole = getUserRole(); // Fonction à implémenter

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, circsData] = await Promise.all([
          getPublicationStats(token),
          getCirconscriptions(token, {
            ...pagination,
            ...filters,
          }),
        ]);
        setStats(statsData);
        setCirconscriptions(circsData.circonscriptions);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination, filters]);

  const handlePublish = async (codeCirconscription: string) => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir publier cette circonscription ?'
      )
    ) {
      try {
        const result = await publishCirconscription(token, codeCirconscription);
        alert(result.message);
        // Rafraîchir les données
        window.location.reload();
      } catch (error: any) {
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="publication-page">
      <h1>Publication des Résultats Législatives</h1>

      {/* Statistiques */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Circonscriptions</h3>
            <p className="stat-value">{stats.totalCirconscriptions}</p>
            <p className="stat-label">
              {stats.publishedCirconscriptions} publiées, {stats.pendingCirconscriptions} en attente
            </p>
          </div>
          <div className="stat-card">
            <h3>CELs</h3>
            <p className="stat-value">{stats.totalCels}</p>
            <p className="stat-label">
              {stats.importedCels} importées, {stats.pendingCels} en attente
            </p>
          </div>
          <div className="stat-card">
            <h3>Taux de Publication</h3>
            <p className="stat-value">{stats.publicationRate.toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="filters">
        <select
          value={filters.statPub}
          onChange={(e) => setFilters({ ...filters, statPub: e.target.value })}
        >
          <option value="">Tous les statuts</option>
          <option value="0">Non publié</option>
          <option value="1">Publié</option>
          <option value="C">Annulé</option>
        </select>
        <input
          type="text"
          placeholder="Rechercher par code ou libellé..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Liste des circonscriptions */}
      <div className="circonscriptions-list">
        {circonscriptions.map((circ) => (
          <div key={circ.codeCirconscription} className="circonscription-card">
            <div className="card-header">
              <h3>
                {circ.codeCirconscription} - {circ.libelleCirconscription}
              </h3>
              <StatusBadge status={circ.publicationStatus} type="publication" />
            </div>
            <div className="card-body">
              <ProgressIndicator
                imported={circ.importedCels}
                total={circ.totalCels}
              />
              <div className="card-actions">
                {canPublishCirconscription(userRole) && (
                  <>
                    {canPublish(circ) && !isPublished(circ) && (
                      <button
                        className="btn-primary"
                        onClick={() => handlePublish(circ.codeCirconscription)}
                      >
                        Publier
                      </button>
                    )}
                    {isPublished(circ) && (
                      <button
                        className="btn-danger"
                        onClick={() => handleCancel(circ.codeCirconscription)}
                      >
                        Annuler
                      </button>
                    )}
                  </>
                )}
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/circonscriptions/${circ.codeCirconscription}/details`)}
                >
                  Voir détails
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/circonscriptions/${circ.codeCirconscription}/data`)}
                >
                  Voir données
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {/* Composant de pagination */}
      </div>
    </div>
  );
};

export default PublicationPage;
```

---

## 🔗 Intégration avec d'Autres Modules

### Lien avec le Module Upload

```typescript
// Après un upload réussi, vérifier si la circonscription peut être publiée
const handleUploadSuccess = async (codeCel: string) => {
  // Récupérer la circonscription de la CEL
  const celData = await getCelData(token, codeCel);
  const codeCirconscription = celData.codeCirconscription;

  // Vérifier si toutes les CELs sont maintenant importées
  const details = await getCirconscriptionDetails(token, codeCirconscription);
  
  if (canPublish(details)) {
    // Afficher une notification : "Cette circonscription peut maintenant être publiée"
    showNotification('Cette circonscription peut maintenant être publiée');
  }
};
```

### Lien avec le Module Utilisateurs

```typescript
// Pour les utilisateurs USER, filtrer automatiquement par circonscriptions assignées
// L'API le fait déjà, mais on peut afficher un indicateur visuel
const UserCirconscriptionsIndicator = () => {
  const userCirconscriptions = getUserCirconscriptions(); // À implémenter
  
  return (
    <div className="user-info">
      <p>
        Vous avez accès à {userCirconscriptions.length} circonscription(s) :
        {userCirconscriptions.map((c) => c.codeCirconscription).join(', ')}
      </p>
    </div>
  );
};
```

---

## 📝 Notes Importantes

### 1. **Différences avec l'API Présidentielle**

- **Entité de publication** : Circonscriptions (pas départements)
- **Candidats variables** : Les candidats varient selon la circonscription
- **Scores dynamiques** : Le nombre de candidats varie par circonscription

### 2. **Performance**

- Les requêtes de données agrégées peuvent être lourdes
- Utiliser la pagination pour les listes
- Mettre en cache les statistiques
- Charger les données détaillées à la demande (lazy loading)

### 3. **Sécurité**

- Toujours vérifier les permissions côté frontend
- Ne jamais exposer les tokens dans les logs
- Valider les données avant envoi

### 4. **Accessibilité**

- Utiliser des labels appropriés pour les boutons
- Fournir des messages d'erreur clairs
- Indiquer visuellement les états (chargement, succès, erreur)

---

## 🚀 Checklist d'Implémentation Frontend

- [ ] Intégrer l'authentification JWT
- [ ] Créer le service API pour les appels HTTP
- [ ] Implémenter la page de statistiques
- [ ] Implémenter la liste des circonscriptions avec filtres
- [ ] Implémenter les actions de publication/annulation
- [ ] Implémenter la page de détails d'une circonscription
- [ ] Implémenter l'affichage des données agrégées
- [ ] Implémenter la page des données nationales (ADMIN/SADMIN)
- [ ] Gérer les erreurs et afficher les messages appropriés
- [ ] Implémenter la pagination
- [ ] Ajouter les indicateurs visuels (badges, progress bars)
- [ ] Optimiser les performances (cache, lazy loading)
- [ ] Tester avec différents rôles utilisateurs
- [ ] Ajouter la gestion des permissions

---

## 📚 Références

- **Base URL API** : `http://your-api-url/api/v1/legislatives/publications`
- **Documentation Swagger** : `/api-docs` (si disponible)
- **Documentation Backend** : `docs/PROMPT_API_LEGISLATIVES_PUBLICATION.md`
- **Clarifications** : `docs/CLARIFICATIONS_PROMPT_PUBLICATION_LEGISLATIVES.md`

---

## ✅ Conclusion

Ce document fournit toutes les informations nécessaires pour intégrer le module de publication des résultats législatives dans le frontend. Les exemples de code sont fournis pour React, mais peuvent être facilement adaptés à Vue.js, Angular, ou tout autre framework.

Pour toute question ou clarification, référez-vous à la documentation backend ou contactez l'équipe de développement.

