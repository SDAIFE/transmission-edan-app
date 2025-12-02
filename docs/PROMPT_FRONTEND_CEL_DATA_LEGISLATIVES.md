# Guide Frontend : Route GET /api/v1/legislatives/upload/cel/:codeCellule/data

## 📋 Vue d'ensemble

Cette route permet de récupérer les données importées d'une CEL (Cellule Électorale Locale) avec les métriques agrégées. Elle retourne les données de tous les bureaux de vote de la CEL, incluant les scores des candidats (colonnes dynamiques) et les statistiques globales.

**Endpoint** : `GET /api/v1/legislatives/upload/cel/:codeCellule/data`

**Contexte** : API Législatives - Gestion des imports et affichage des résultats

---

## 🔐 Authentification et Permissions

### Authentification requise
- **Type** : JWT Bearer Token
- **Header** : `Authorization: Bearer <token>`

### Permissions
- **Rôles autorisés** : `SADMIN`, `ADMIN`, `USER`
- **Restrictions USER** : Les utilisateurs avec le rôle `USER` ne peuvent accéder qu'aux CELs des circonscriptions qui leur sont assignées

### Codes de statut HTTP
- `200` : Succès - Données récupérées
- `401` : Non authentifié - Token manquant ou invalide
- `403` : Accès interdit - CEL non accessible pour l'utilisateur (USER)
- `404` : CEL non trouvée ou aucun import réussi

---

## 📥 Structure de la Requête

### Paramètres d'URL

| Paramètre | Type | Requis | Description | Exemple |
|-----------|------|--------|-------------|---------|
| `codeCellule` | `string` | ✅ Oui | Code de la CEL (4 caractères) | `S003` |

### Exemple de requête

```http
GET /api/v1/legislatives/upload/cel/S003/data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Structure de la Réponse

### Réponse complète

```typescript
interface CelDataResponse {
  codeCellule: string;              // Code CEL (ex: "S003")
  libelleCellule: string;           // Libellé CEL (ex: "CESP CECHI")
  codeCirconscription: string;      // Code circonscription (ex: "004")
  libelleCirconscription: string | null;  // Libellé circonscription
  totalBureaux: number;             // Nombre total de bureaux de vote
  data: CelDataItem[];              // Tableau des bureaux de vote
  metrics: CelMetrics;              // Métriques agrégées
}
```

### Structure d'un élément de données (CelDataItem)

```typescript
interface CelDataItem {
  id: number;                       // ID du bureau de vote
  codeCellule: string;              // Code CEL
  ordre: number;                    // Ordre d'affichage (1, 2, 3...)
  referenceLieuVote: string;        // Référence LV (12 chiffres)
  libelleLieuVote: string;          // Libellé du lieu de vote
  numeroBureauVote: string;          // Numéro du bureau (ex: "01")
  
  // Données démographiques
  populationHommes: number;         // Population hommes
  populationFemmes: number;         // Population femmes
  populationTotale: number;         // Population totale
  
  // Données de vote
  votantsHommes: number;            // Votants hommes
  votantsFemmes: number;            // Votants femmes
  totalVotants: number;             // Total votants
  tauxParticipation: number;         // Taux de participation (%)
  
  // Bulletins
  bulletinsNuls: number;             // Bulletins nuls
  suffrageExprime: number;          // Suffrage exprimé
  bulletinsBlancs: number;           // Bulletins blancs
  
  // Statut
  statutSuppressionBv: string | null; // Statut suppression BV ("OK" | "NOK" | null)
  
  // Scores des candidats (colonnes dynamiques)
  // Les clés sont les NUM_DOS des candidats
  [numDos: string]: number | string | null;  // Ex: "U-02108": 10, "U-02122": 20
}
```

### Structure des métriques (CelMetrics)

```typescript
interface CelMetrics {
  inscrits: {
    total: number;      // Total des inscrits
    hommes: number;     // Inscrits hommes
    femmes: number;     // Inscrits femmes
  };
  votants: {
    total: number;      // Total des votants
    hommes: number;    // Votants hommes
    femmes: number;     // Votants femmes
  };
  tauxParticipation: number;    // Taux de participation global (%)
  suffrageExprime: number;       // Total suffrage exprimé
  bulletinsBlancs: number;       // Total bulletins blancs
  bulletinsNuls: number;         // Total bulletins nuls
}
```

### Exemple de réponse JSON

```json
{
  "codeCellule": "S003",
  "libelleCellule": "CESP CECHI",
  "codeCirconscription": "004",
  "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO, COMMUNES ET SOUS-PREFECTURES",
  "totalBureaux": 15,
  "data": [
    {
      "id": 123,
      "codeCellule": "S003",
      "ordre": 1,
      "referenceLieuVote": "001006098001",
      "libelleLieuVote": "EPP 1 CECHI",
      "numeroBureauVote": "01",
      "populationHommes": 198,
      "populationFemmes": 202,
      "populationTotale": 400,
      "votantsHommes": 50,
      "votantsFemmes": 50,
      "totalVotants": 100,
      "tauxParticipation": 25.0,
      "bulletinsNuls": 0,
      "suffrageExprime": 100,
      "bulletinsBlancs": 0,
      "statutSuppressionBv": "OK",
      "U-02108": 10,
      "U-02122": 20,
      "U-02123": 15,
      "U-02136": 12,
      "U-02143": 8,
      "U-02145": 10,
      "U-02147": 5,
      "U-03509": 8,
      "U-03517": 7,
      "U-03529": 5
    },
    {
      "id": 124,
      "codeCellule": "S003",
      "ordre": 2,
      "referenceLieuVote": "001006098002",
      "libelleLieuVote": "EPP 2 CECHI",
      "numeroBureauVote": "02",
      "populationHommes": 150,
      "populationFemmes": 150,
      "populationTotale": 300,
      "votantsHommes": 40,
      "votantsFemmes": 40,
      "totalVotants": 80,
      "tauxParticipation": 26.67,
      "bulletinsNuls": 0,
      "suffrageExprime": 75,
      "bulletinsBlancs": 5,
      "statutSuppressionBv": "NOK",
      "U-02108": 8,
      "U-02122": 15,
      "U-02123": 12,
      "U-02136": 10,
      "U-02143": 7,
      "U-02145": 8,
      "U-02147": 4,
      "U-03509": 5,
      "U-03517": 4,
      "U-03529": 2
    }
  ],
  "metrics": {
    "inscrits": {
      "total": 6000,
      "hommes": 3000,
      "femmes": 3000
    },
    "votants": {
      "total": 1500,
      "hommes": 750,
      "femmes": 750
    },
    "tauxParticipation": 25.0,
    "suffrageExprime": 1450,
    "bulletinsBlancs": 30,
    "bulletinsNuls": 20
  }
}
```

---

## 🎯 Cas d'utilisation

### 1. Affichage des données d'une CEL
Afficher un tableau avec toutes les données des bureaux de vote d'une CEL, incluant les scores des candidats.

### 2. Affichage des métriques
Afficher un résumé statistique de la CEL (inscrits, votants, taux de participation, etc.).

### 3. Export Excel
Utiliser les données pour générer un fichier Excel avec le même format que l'import.

### 4. Tableau de bord
Afficher les métriques agrégées pour plusieurs CELs.

---

## 💻 Exemples d'implémentation

### React avec Axios

```typescript
import axios from 'axios';

interface CelDataResponse {
  codeCellule: string;
  libelleCellule: string;
  codeCirconscription: string;
  libelleCirconscription: string | null;
  totalBureaux: number;
  data: Array<Record<string, any>>;
  metrics: {
    inscrits: { total: number; hommes: number; femmes: number };
    votants: { total: number; hommes: number; femmes: number };
    tauxParticipation: number;
    suffrageExprime: number;
    bulletinsBlancs: number;
    bulletinsNuls: number;
  };
}

const API_BASE_URL = 'http://your-api-url/api/v1';

async function getCelData(
  codeCellule: string,
  token: string
): Promise<CelDataResponse> {
  try {
    const response = await axios.get<CelDataResponse>(
      `${API_BASE_URL}/legislatives/upload/cel/${codeCellule}/data`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('CEL non trouvée ou aucun import réussi');
      }
      if (error.response?.status === 403) {
        throw new Error('Accès interdit à cette CEL');
      }
      if (error.response?.status === 401) {
        throw new Error('Non authentifié');
      }
    }
    throw error;
  }
}

// Utilisation dans un composant React
function CelDataComponent({ codeCellule }: { codeCellule: string }) {
  const [data, setData] = useState<CelDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getCelData(codeCellule, token!);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchData();
    }
  }, [codeCellule, token]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!data) return null;

  // Extraire les colonnes de candidats (scores dynamiques)
  const candidateColumns = Object.keys(data.data[0] || {}).filter(
    (key) => key.startsWith('U-') || key.match(/^\d{2}-\d{5}$/)
  );

  return (
    <div>
      <h2>{data.libelleCellule} ({data.codeCellule})</h2>
      <p>Circonscription : {data.libelleCirconscription}</p>
      <p>Total bureaux : {data.totalBureaux}</p>

      {/* Métriques */}
      <div className="metrics">
        <h3>Métriques</h3>
        <p>Inscrits : {data.metrics.inscrits.total}</p>
        <p>Votants : {data.metrics.votants.total}</p>
        <p>Taux de participation : {data.metrics.tauxParticipation}%</p>
        <p>Suffrage exprimé : {data.metrics.suffrageExprime}</p>
      </div>

      {/* Tableau des données */}
      <table>
        <thead>
          <tr>
            <th>Ordre</th>
            <th>REF_LV</th>
            <th>Lieu de vote</th>
            <th>BV</th>
            <th>Pop. Hommes</th>
            <th>Pop. Femmes</th>
            <th>Pop. Totale</th>
            <th>Votants</th>
            <th>Taux Part.</th>
            <th>Bul. Nuls</th>
            <th>Suff. Exp.</th>
            <th>Bul. Blancs</th>
            <th>Statut</th>
            {/* Colonnes dynamiques pour les candidats */}
            {candidateColumns.map((numDos) => (
              <th key={numDos}>{numDos}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row) => (
            <tr key={row.id}>
              <td>{row.ordre}</td>
              <td>{row.referenceLieuVote}</td>
              <td>{row.libelleLieuVote}</td>
              <td>{row.numeroBureauVote}</td>
              <td>{row.populationHommes}</td>
              <td>{row.populationFemmes}</td>
              <td>{row.populationTotale}</td>
              <td>{row.totalVotants}</td>
              <td>{row.tauxParticipation}%</td>
              <td>{row.bulletinsNuls}</td>
              <td>{row.suffrageExprime}</td>
              <td>{row.bulletinsBlancs}</td>
              <td>{row.statutSuppressionBv || '-'}</td>
              {/* Scores des candidats */}
              {candidateColumns.map((numDos) => (
                <td key={numDos}>{row[numDos] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Vue.js avec Axios

```vue
<template>
  <div v-if="loading">Chargement...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else-if="celData">
    <h2>{{ celData.libelleCellule }} ({{ celData.codeCellule }})</h2>
    <p>Circonscription : {{ celData.libelleCirconscription }}</p>
    
    <!-- Métriques -->
    <div class="metrics">
      <h3>Métriques</h3>
      <div class="metric-item">
        <span>Inscrits :</span>
        <strong>{{ celData.metrics.inscrits.total }}</strong>
      </div>
      <div class="metric-item">
        <span>Votants :</span>
        <strong>{{ celData.metrics.votants.total }}</strong>
      </div>
      <div class="metric-item">
        <span>Taux de participation :</span>
        <strong>{{ celData.metrics.tauxParticipation }}%</strong>
      </div>
    </div>

    <!-- Tableau -->
    <table>
      <thead>
        <tr>
          <th>Ordre</th>
          <th>Lieu de vote</th>
          <th>BV</th>
          <th>Pop. Totale</th>
          <th>Votants</th>
          <th>Taux Part.</th>
          <th v-for="col in candidateColumns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in celData.data" :key="row.id">
          <td>{{ row.ordre }}</td>
          <td>{{ row.libelleLieuVote }}</td>
          <td>{{ row.numeroBureauVote }}</td>
          <td>{{ row.populationTotale }}</td>
          <td>{{ row.totalVotants }}</td>
          <td>{{ row.tauxParticipation }}%</td>
          <td v-for="col in candidateColumns" :key="col">
            {{ row[col] || 0 }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const props = defineProps<{
  codeCellule: string;
}>();

const celData = ref(null);
const loading = ref(true);
const error = ref<string | null>(null);

const candidateColumns = computed(() => {
  if (!celData.value?.data?.[0]) return [];
  return Object.keys(celData.value.data[0]).filter(
    (key) => key.startsWith('U-') || key.match(/^\d{2}-\d{5}$/)
  );
});

onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `/api/v1/legislatives/upload/cel/${props.codeCellule}/data`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    celData.value = response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      error.value = 'CEL non trouvée ou aucun import réussi';
    } else if (err.response?.status === 403) {
      error.value = 'Accès interdit à cette CEL';
    } else {
      error.value = 'Erreur lors du chargement des données';
    }
  } finally {
    loading.value = false;
  }
});
</script>
```

### Angular avec HttpClient

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CelDataService {
  private apiUrl = 'http://your-api-url/api/v1';

  constructor(private http: HttpClient) {}

  getCelData(codeCellule: string, token: string): Observable<CelDataResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<CelDataResponse>(
      `${this.apiUrl}/legislatives/upload/cel/${codeCellule}/data`,
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => new Error('CEL non trouvée ou aucun import réussi'));
        }
        if (error.status === 403) {
          return throwError(() => new Error('Accès interdit à cette CEL'));
        }
        if (error.status === 401) {
          return throwError(() => new Error('Non authentifié'));
        }
        return throwError(() => new Error('Erreur lors de la récupération des données'));
      })
    );
  }
}

// Composant Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CelDataService } from './cel-data.service';

@Component({
  selector: 'app-cel-data',
  template: `
    <div *ngIf="loading">Chargement...</div>
    <div *ngIf="error">{{ error }}</div>
    <div *ngIf="celData">
      <h2>{{ celData.libelleCellule }} ({{ celData.codeCellule }})</h2>
      <p>Total bureaux : {{ celData.totalBureaux }}</p>
      
      <div class="metrics">
        <h3>Métriques</h3>
        <p>Inscrits : {{ celData.metrics.inscrits.total }}</p>
        <p>Votants : {{ celData.metrics.votants.total }}</p>
        <p>Taux de participation : {{ celData.metrics.tauxParticipation }}%</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Lieu de vote</th>
            <th>BV</th>
            <th>Votants</th>
            <th *ngFor="let col of candidateColumns">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of celData.data">
            <td>{{ row.ordre }}</td>
            <td>{{ row.libelleLieuVote }}</td>
            <td>{{ row.numeroBureauVote }}</td>
            <td>{{ row.totalVotants }}</td>
            <td *ngFor="let col of candidateColumns">
              {{ row[col] || 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class CelDataComponent implements OnInit {
  celData: CelDataResponse | null = null;
  loading = true;
  error: string | null = null;
  candidateColumns: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private celDataService: CelDataService
  ) {}

  ngOnInit() {
    const codeCellule = this.route.snapshot.paramMap.get('codeCellule');
    const token = localStorage.getItem('token');

    if (codeCellule && token) {
      this.celDataService.getCelData(codeCellule, token).subscribe({
        next: (data) => {
          this.celData = data;
          // Extraire les colonnes de candidats
          if (data.data.length > 0) {
            this.candidateColumns = Object.keys(data.data[0]).filter(
              (key) => key.startsWith('U-') || key.match(/^\d{2}-\d{5}$/)
            );
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
    }
  }
}
```

### Fetch API (Vanilla JavaScript)

```javascript
async function getCelData(codeCellule, token) {
  try {
    const response = await fetch(
      `http://your-api-url/api/v1/legislatives/upload/cel/${codeCellule}/data`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CEL non trouvée ou aucun import réussi');
      }
      if (response.status === 403) {
        throw new Error('Accès interdit à cette CEL');
      }
      if (response.status === 401) {
        throw new Error('Non authentifié');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    throw error;
  }
}

// Utilisation
const token = localStorage.getItem('token');
getCelData('S003', token)
  .then((data) => {
    console.log('Données CEL:', data);
    console.log('Métriques:', data.metrics);
    console.log('Nombre de bureaux:', data.totalBureaux);
    
    // Extraire les colonnes de candidats
    const candidateColumns = Object.keys(data.data[0] || {}).filter(
      (key) => key.startsWith('U-') || key.match(/^\d{2}-\d{5}$/)
    );
    console.log('Candidats:', candidateColumns);
  })
  .catch((error) => {
    console.error('Erreur:', error.message);
  });
```

---

## ⚠️ Points d'attention

### 1. Colonnes dynamiques des candidats
Les scores des candidats sont retournés comme propriétés dynamiques de chaque objet `data`. Les clés sont les `NUM_DOS` des candidats (format : `U-02108`, `U-02122`, etc.).

**Pour extraire les colonnes de candidats :**
```typescript
const candidateColumns = Object.keys(data.data[0] || {}).filter(
  (key) => key.startsWith('U-') || key.match(/^\d{2}-\d{5}$/)
);
```

### 2. Gestion des valeurs nulles
- `statutSuppressionBv` peut être `null`
- Certains champs numériques peuvent être `0` si non renseignés
- Toujours vérifier l'existence des valeurs avant affichage

### 3. Import requis
La route retourne une erreur `404` si aucun import réussi n'existe pour la CEL. Vérifier d'abord qu'un import a été effectué avec succès.

### 4. Permissions USER
Les utilisateurs avec le rôle `USER` ne peuvent accéder qu'aux CELs des circonscriptions qui leur sont assignées. Une erreur `403` sera retournée si l'accès est refusé.

### 5. Format des nombres
- Les taux sont retournés en pourcentage (ex: `25.0` pour 25%)
- Les nombres peuvent être des `Float` ou des entiers
- Formater selon les besoins d'affichage

### 6. Performance
Pour les CELs avec beaucoup de bureaux de vote, la réponse peut être volumineuse. Considérer :
- La pagination côté frontend si nécessaire
- Le chargement progressif des données
- La mise en cache des métriques

---

## 🔄 Exemple de workflow complet

```typescript
// 1. Récupérer les données
const celData = await getCelData('S003', token);

// 2. Afficher les informations de base
console.log(`CEL: ${celData.libelleCellule} (${celData.codeCellule})`);
console.log(`Circonscription: ${celData.libelleCirconscription}`);
console.log(`Total bureaux: ${celData.totalBureaux}`);

// 3. Afficher les métriques
console.log('=== MÉTRIQUES ===');
console.log(`Inscrits: ${celData.metrics.inscrits.total}`);
console.log(`  - Hommes: ${celData.metrics.inscrits.hommes}`);
console.log(`  - Femmes: ${celData.metrics.inscrits.femmes}`);
console.log(`Votants: ${celData.metrics.votants.total}`);
console.log(`Taux de participation: ${celData.metrics.tauxParticipation}%`);
console.log(`Suffrage exprimé: ${celData.metrics.suffrageExprime}`);
console.log(`Bulletins blancs: ${celData.metrics.bulletinsBlancs}`);
console.log(`Bulletins nuls: ${celData.metrics.bulletinsNuls}`);

// 4. Extraire les colonnes de candidats
const candidateColumns = Object.keys(celData.data[0] || {}).filter(
  (key) => key.startsWith('U-') || key.match(/^\d{2}-\d{5}$/)
);

// 5. Traiter chaque bureau de vote
celData.data.forEach((row) => {
  console.log(`\nBV ${row.numeroBureauVote} - ${row.libelleLieuVote}`);
  console.log(`  Population: ${row.populationTotale}`);
  console.log(`  Votants: ${row.totalVotants}`);
  console.log(`  Taux participation: ${row.tauxParticipation}%`);
  
  // Afficher les scores des candidats
  candidateColumns.forEach((numDos) => {
    console.log(`  ${numDos}: ${row[numDos] || 0}`);
  });
});
```

---

## 📊 Exemple d'affichage dans un tableau

```html
<table class="cel-data-table">
  <thead>
    <tr>
      <th rowspan="2">Ordre</th>
      <th rowspan="2">REF_LV</th>
      <th rowspan="2">Lieu de vote</th>
      <th rowspan="2">BV</th>
      <th colspan="3">Population</th>
      <th colspan="3">Votants</th>
      <th rowspan="2">Taux Part.</th>
      <th rowspan="2">Bul. Nuls</th>
      <th rowspan="2">Suff. Exp.</th>
      <th rowspan="2">Bul. Blancs</th>
      <th rowspan="2">Statut</th>
      <th [colspan]="candidateColumns.length">Scores candidats</th>
    </tr>
    <tr>
      <th>Hommes</th>
      <th>Femmes</th>
      <th>Totale</th>
      <th>Hommes</th>
      <th>Femmes</th>
      <th>Total</th>
      <th *ngFor="let col of candidateColumns">{{ col }}</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let row of celData.data">
      <td>{{ row.ordre }}</td>
      <td>{{ row.referenceLieuVote }}</td>
      <td>{{ row.libelleLieuVote }}</td>
      <td>{{ row.numeroBureauVote }}</td>
      <td>{{ row.populationHommes }}</td>
      <td>{{ row.populationFemmes }}</td>
      <td>{{ row.populationTotale }}</td>
      <td>{{ row.votantsHommes }}</td>
      <td>{{ row.votantsFemmes }}</td>
      <td>{{ row.totalVotants }}</td>
      <td>{{ row.tauxParticipation | number:'1.2-2' }}%</td>
      <td>{{ row.bulletinsNuls }}</td>
      <td>{{ row.suffrageExprime }}</td>
      <td>{{ row.bulletinsBlancs }}</td>
      <td>
        <span [class]="getStatutClass(row.statutSuppressionBv)">
          {{ row.statutSuppressionBv || '-' }}
        </span>
      </td>
      <td *ngFor="let col of candidateColumns">
        {{ row[col] || 0 }}
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="totals">
      <td colspan="4"><strong>Totaux</strong></td>
      <td>{{ celData.metrics.inscrits.hommes }}</td>
      <td>{{ celData.metrics.inscrits.femmes }}</td>
      <td>{{ celData.metrics.inscrits.total }}</td>
      <td>{{ celData.metrics.votants.hommes }}</td>
      <td>{{ celData.metrics.votants.femmes }}</td>
      <td>{{ celData.metrics.votants.total }}</td>
      <td>{{ celData.metrics.tauxParticipation | number:'1.2-2' }}%</td>
      <td>{{ celData.metrics.bulletinsNuls }}</td>
      <td>{{ celData.metrics.suffrageExprime }}</td>
      <td>{{ celData.metrics.bulletinsBlancs }}</td>
      <td colspan="2"></td>
      <td *ngFor="let col of candidateColumns">
        {{ getTotalScore(col) }}
      </td>
    </tr>
  </tfoot>
</table>
```

---

## 🎨 Suggestions de style

### Badge pour le statut de suppression BV

```css
.statut-ok {
  background-color: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}

.statut-nok {
  background-color: #dc3545;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}
```

### Mise en évidence des métriques

```css
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.metric-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}
```

---

## ✅ Checklist d'intégration

- [ ] Authentification JWT configurée
- [ ] Gestion des erreurs (401, 403, 404)
- [ ] Extraction des colonnes de candidats dynamiques
- [ ] Affichage des métriques agrégées
- [ ] Tableau avec toutes les colonnes fixes
- [ ] Colonnes dynamiques pour les scores des candidats
- [ ] Formatage des nombres (taux, pourcentages)
- [ ] Gestion des valeurs nulles
- [ ] Indicateur de chargement
- [ ] Messages d'erreur utilisateur
- [ ] Responsive design pour mobile
- [ ] Export Excel (optionnel)

---

## 📚 Ressources complémentaires

- **Route d'import** : `POST /api/v1/legislatives/upload/excel`
- **Liste des imports** : `GET /api/v1/legislatives/upload/imports`
- **Statistiques** : `GET /api/v1/legislatives/upload/stats`
- **Format Excel CEL** : `GET /api/v1/cels/:codeCellule/data/excel-format`

---

## 🔗 Documentation Swagger

Une fois l'API déployée, la documentation Swagger complète est disponible à :
`http://your-api-url/api-docs`

La route est documentée sous le tag **"Upload Législatives"** avec tous les détails des paramètres et réponses.

