# Prompt Frontend - Section Supervision des Résultats Législatifs

## Vue d'ensemble

Ce document décrit l'intégration frontend pour la section **Supervision** de l'API des résultats législatifs. Cette section permet aux administrateurs et managers de surveiller l'état des publications, d'analyser les performances et de gérer les alertes.

**Base URL** : `/api/v1/legislatives/resultats/supervision`

**Authentification** : Toutes les routes nécessitent un token JWT dans le header `Authorization: Bearer <token>`

**Permissions** :
- **Tableau de bord** : `SADMIN`, `ADMIN`, `MANAGER`, `USER` (USER : seulement ses circonscriptions assignées)
- **Détails circonscription** : `SADMIN`, `ADMIN`, `MANAGER`, `USER` (USER : seulement ses circonscriptions assignées)
- **Statistiques avancées** : `SADMIN`, `ADMIN`, `MANAGER` uniquement

---

## 1. Tableau de bord de supervision

### Route
```
GET /api/v1/legislatives/resultats/supervision
```

### Description
Récupère le tableau de bord de supervision avec statistiques globales, monitoring par région, alertes et indicateurs de performance.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### Réponse succès (200)

```typescript
interface SupervisionDashboardResponse {
  vueEnsemble: {
    totalCirconscriptions: number;        // Ex: 255
    circonscriptionsPubliees: number;      // Ex: 200
    circonscriptionsEnAttente: number;    // Ex: 55
    tauxPublication: number;              // Ex: 78.43 (pourcentage)
  };
  regions: Array<{
    codeRegion: string;                    // Ex: "01"
    libelleRegion: string;                // Ex: "LAGUNES"
    nombreCirconscriptions: number;       // Ex: 10
    nombreCirconscriptionsPubliees: number; // Ex: 8
    tauxPublication: number;               // Ex: 75.5 (pourcentage, basé sur les circonscriptions publiées)
    nombreCels: number;                     // Ex: 25
    nombreCelsImportes: number;            // Ex: 20 (ETA_RESULTAT_CEL = 'I' ou 'PUBLISHED')
  }>;
  alertes: Array<{
    type: "ANOMALIE" | "RETARD" | "ERREUR";
    message: string;                       // Ex: "CEL S003 en attente d'import depuis plus de 24h"
    codeCirconscription?: string;         // Ex: "004"
    codeCel?: string;                     // Ex: "S003"
    priorite: "HAUTE" | "MOYENNE" | "BASSE";
  }>;
  metriquesPerformance: {
    tempsMoyenPublication: number;        // Ex: 15 (minutes)
    tauxErreur: number;                   // Ex: 2.5 (pourcentage)
    nombreImportsReussis: number;         // Ex: 450
    nombreImportsEchoues: number;          // Ex: 10
  };
  historique: Array<{
    date: string;                          // ISO 8601, Ex: "2025-12-02T10:00:00Z"
    action: string;                        // Ex: "Publication circonscription 004"
    utilisateur: string;                   // Ex: "cmgjqtg1j0037w46dgbcy95kc"
    codeCirconscription?: string;         // Ex: "004"
  }>;
}
```

### Réponses d'erreur

- **401 Unauthorized** : Token manquant ou invalide
- **403 Forbidden** : Rôle insuffisant (doit être SADMIN, ADMIN ou MANAGER)

### Exemple d'utilisation

```typescript
// React/TypeScript
const fetchSupervisionDashboard = async (token: string) => {
  try {
    const response = await fetch(
      '/api/v1/legislatives/resultats/supervision',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      // Rediriger vers la page de connexion
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      throw new Error('Accès interdit. Rôle insuffisant.');
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const data: SupervisionDashboardResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord:', error);
    throw error;
  }
};
```

### Exemple de rendu UI

```tsx
// React Component Example
const SupervisionDashboard = () => {
  const [dashboard, setDashboard] = useState<SupervisionDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetchSupervisionDashboard(token!)
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!dashboard) return <ErrorMessage />;

  return (
    <div className="supervision-dashboard">
      {/* Vue d'ensemble */}
      <StatsCards
        total={dashboard.vueEnsemble.totalCirconscriptions}
        published={dashboard.vueEnsemble.circonscriptionsPubliees}
        pending={dashboard.vueEnsemble.circonscriptionsEnAttente}
        rate={dashboard.vueEnsemble.tauxPublication}
      />

      {/* Statistiques par région */}
      <RegionsTable regions={dashboard.regions} />

      {/* Alertes */}
      <AlertsPanel
        alerts={dashboard.alertes}
        onAlertClick={(alert) => {
          if (alert.codeCirconscription) {
            navigate(`/supervision/circonscriptions/${alert.codeCirconscription}`);
          }
        }}
      />

      {/* Métriques de performance */}
      <PerformanceMetrics metrics={dashboard.metriquesPerformance} />

      {/* Historique récent */}
      <HistoryTimeline history={dashboard.historique} />
    </div>
  );
};
```

---

## 2. Détails d'une circonscription pour la supervision

### Route
```
GET /api/v1/legislatives/resultats/supervision/circonscriptions/:codeCirconscription
```

### Description
Récupère les détails complets d'une circonscription pour la supervision, incluant les résultats, l'historique des publications et les logs d'activité.

### Paramètres

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `codeCirconscription` | string | Code circonscription (COD_CE) | `"004"` |

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### Réponse succès (200)

La réponse combine les données de `CirconscriptionResultsResponse` avec des informations supplémentaires de supervision :

```typescript
interface SupervisionCirconscriptionResponse {
  // Données de base de la circonscription (voir CirconscriptionResultsResponse)
  circonscription: {
    codeCirconscription: string;
    libelleCirconscription: string;
    statutPublication: string;           // "0", "1", ou "C"
    nombreSieges: number;
  };
  candidats?: Array<{
    numeroDossier: string;
    nom: string;
    parti: string;
    score: number;
    pourcentage: number;
    classement: number;
  }>;
  listes?: Array<{
    intitule: string;
    score: number;
    pourcentage: number;
    nombreElus: number;
    classement: number;
  }>;
  metriques: {
    inscrits: number;
    votants: number;
    participation: number;
    suffrageExprime: number;
    bulletinsNuls: number;
    bulletinsBlancs: number;
  };
  cels: Array<{
    codeCel: string;
    libelleCel: string;
    statut: string;                       // "I", null, "PUBLISHED", "CANCELLED"
    nombreBureaux: number;
    tauxSaisie: number;
  }>;

  // Données supplémentaires de supervision
  historique: Array<{
    id: number;
    action: string;                        // Ex: "PUBLISH", "CANCEL"
    userId: string;
    details: string | null;
    timestamp: string;                     // ISO 8601
  }>;
  logsActivite: Array<any>;               // Actuellement vide (TODO)
}
```

### Réponses d'erreur

- **400 Bad Request** : Format de code invalide
- **401 Unauthorized** : Token manquant ou invalide
- **403 Forbidden** : Accès interdit (USER sans accès à cette circonscription)
- **404 Not Found** : Circonscription non trouvée

### Exemple d'utilisation

```typescript
const fetchSupervisionCirconscription = async (
  codeCirconscription: string,
  token: string
) => {
  try {
    const response = await fetch(
      `/api/v1/legislatives/resultats/supervision/circonscriptions/${codeCirconscription}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      throw new Error('Vous n\'avez pas accès à cette circonscription.');
    }

    if (response.status === 404) {
      throw new Error('Circonscription non trouvée.');
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const data: SupervisionCirconscriptionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    throw error;
  }
};
```

### Exemple de rendu UI

```tsx
const SupervisionCirconscriptionDetails = ({ codeCirconscription }: { codeCirconscription: string }) => {
  const [details, setDetails] = useState<SupervisionCirconscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetchSupervisionCirconscription(codeCirconscription, token!)
      .then(setDetails)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [codeCirconscription]);

  if (loading) return <Spinner />;
  if (!details) return <ErrorMessage />;

  return (
    <div className="supervision-circonscription">
      {/* En-tête avec informations de base */}
      <CirconscriptionHeader
        code={details.circonscription.codeCirconscription}
        libelle={details.circonscription.libelleCirconscription}
        statut={details.circonscription.statutPublication}
        nombreSieges={details.circonscription.nombreSieges}
      />

      {/* Métriques */}
      <MetricsCard metrics={details.metriques} />

      {/* Résultats (candidats ou listes) */}
      {details.candidats && (
        <CandidatesTable candidates={details.candidats} />
      )}
      {details.listes && (
        <ListsTable lists={details.listes} />
      )}

      {/* CELs */}
      <CelsStatusTable cels={details.cels} />

      {/* Historique des publications */}
      <PublicationHistory history={details.historique} />

      {/* Logs d'activité (si disponibles) */}
      {details.logsActivite.length > 0 && (
        <ActivityLogs logs={details.logsActivite} />
      )}
    </div>
  );
};
```

---

## 3. Statistiques avancées pour la supervision

### Route
```
GET /api/v1/legislatives/resultats/supervision/stats
```

### Description
Récupère les statistiques avancées pour la supervision avec analyses comparatives, tendances, évolutions et rapports de performance.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### Réponse succès (200)

```typescript
interface SupervisionStatsResponse {
  statistiques: {
    totalCirconscriptions: number;
    circonscriptionsPubliees: number;
    circonscriptionsEnAttente: number;
    tauxPublication: number;              // Pourcentage
    totalCels: number;
    celsImportees: number;
    celsEnAttente: number;
  };
  analyses: {
    tauxParticipationMoyen: number;        // Pourcentage
    tauxParticipationMin: number;         // Pourcentage
    tauxParticipationMax: number;         // Pourcentage
    circonscriptionsParRegion: Record<string, number>;  // Ex: { "01": 10, "02": 8 }
  };
  tendances: {
    evolutionPublication: Array<{
      date: string;                        // ISO 8601
      nombrePubliees: number;
    }>;
    evolutionImports: Array<{
      date: string;                        // ISO 8601
      nombreImports: number;
    }>;
  };
  rapports: {
    tempsMoyenImport: number;             // Minutes
    tempsMoyenPublication: number;       // Minutes
    tauxReussiteImport: number;           // Pourcentage
    tauxReussitePublication: number;       // Pourcentage
  };
}
```

### Réponses d'erreur

- **401 Unauthorized** : Token manquant ou invalide
- **403 Forbidden** : Rôle insuffisant (doit être SADMIN, ADMIN ou MANAGER)

### Exemple d'utilisation

```typescript
const fetchSupervisionStats = async (token: string) => {
  try {
    const response = await fetch(
      '/api/v1/legislatives/resultats/supervision/stats',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      throw new Error('Accès interdit. Rôle insuffisant.');
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const data: SupervisionStatsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
```

### Exemple de rendu UI

```tsx
const SupervisionStats = () => {
  const [stats, setStats] = useState<SupervisionStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetchSupervisionStats(token!)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <ErrorMessage />;

  return (
    <div className="supervision-stats">
      {/* Statistiques globales */}
      <StatsOverview stats={stats.statistiques} />

      {/* Analyses comparatives */}
      <ComparativeAnalysis
        participationMoyen={stats.analyses.tauxParticipationMoyen}
        participationMin={stats.analyses.tauxParticipationMin}
        participationMax={stats.analyses.tauxParticipationMax}
        circonscriptionsParRegion={stats.analyses.circonscriptionsParRegion}
      />

      {/* Graphiques de tendances */}
      <TrendsCharts
        evolutionPublication={stats.tendances.evolutionPublication}
        evolutionImports={stats.tendances.evolutionImports}
      />

      {/* Rapports de performance */}
      <PerformanceReports reports={stats.rapports} />
    </div>
  );
};
```

---

## Gestion des erreurs

### Erreurs communes

1. **401 Unauthorized**
   - **Cause** : Token manquant, expiré ou invalide
   - **Action** : Rediriger vers la page de connexion

2. **403 Forbidden**
   - **Cause** : Rôle insuffisant ou accès refusé à une circonscription
   - **Action** : Afficher un message d'erreur approprié

3. **404 Not Found**
   - **Cause** : Ressource non trouvée (circonscription, région, etc.)
   - **Action** : Afficher un message d'erreur et proposer de retourner à la liste

4. **500 Internal Server Error**
   - **Cause** : Erreur serveur
   - **Action** : Afficher un message d'erreur générique et logger l'erreur

### Exemple de gestion d'erreurs

```typescript
const handleApiError = (error: any, response: Response) => {
  switch (response.status) {
    case 401:
      // Token expiré ou invalide
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
    case 403:
      // Accès interdit
      showNotification('Accès interdit. Rôle insuffisant.', 'error');
      break;
    case 404:
      // Ressource non trouvée
      showNotification('Ressource non trouvée.', 'warning');
      break;
    case 500:
      // Erreur serveur
      showNotification('Erreur serveur. Veuillez réessayer plus tard.', 'error');
      break;
    default:
      showNotification('Une erreur est survenue.', 'error');
  }
};
```

---

## Bonnes pratiques

### 1. Mise en cache
- Mettre en cache les données du tableau de bord pendant 30-60 secondes
- Rafraîchir automatiquement toutes les 2-5 minutes selon l'importance

### 2. Indicateurs visuels
- Utiliser des couleurs pour les statuts :
  - **Vert** : Publié, Succès
  - **Orange** : En attente, Avertissement
  - **Rouge** : Erreur, Bloqué
  - **Gris** : Non disponible

### 3. Alertes
- Afficher les alertes de priorité HAUTE en premier
- Permettre le filtrage par type d'alerte
- Cliquer sur une alerte pour naviguer vers la circonscription concernée

### 4. Graphiques
- Utiliser des graphiques de type ligne pour les tendances temporelles
- Utiliser des graphiques en barres pour les comparaisons régionales
- Ajouter des tooltips avec les valeurs exactes

### 5. Performance
- Charger les données de manière asynchrone
- Afficher des indicateurs de chargement
- Implémenter la pagination pour les listes longues (historique, alertes)

---

## Exemple complet d'intégration

```typescript
// supervision.service.ts
import { SupervisionDashboardResponse, SupervisionStatsResponse, SupervisionCirconscriptionResponse } from './types';

const API_BASE_URL = '/api/v1/legislatives/resultats/supervision';

export class SupervisionService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getDashboard(token: string): Promise<SupervisionDashboardResponse> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return response.json();
  }

  async getCirconscriptionDetails(
    codeCirconscription: string,
    token: string
  ): Promise<SupervisionCirconscriptionResponse> {
    const response = await fetch(
      `${API_BASE_URL}/circonscriptions/${codeCirconscription}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return response.json();
  }

  async getStats(token: string): Promise<SupervisionStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return response.json();
  }
}
```

```tsx
// SupervisionPage.tsx
import React, { useState, useEffect } from 'react';
import { SupervisionService } from './services/supervision.service';
import { SupervisionDashboard } from './components/SupervisionDashboard';
import { SupervisionStats } from './components/SupervisionStats';

const SupervisionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);

  const supervisionService = new SupervisionService();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === 'dashboard') {
          const data = await supervisionService.getDashboard(token!);
          setDashboard(data);
        } else {
          const data = await supervisionService.getStats(token!);
          setStats(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="supervision-page">
      <div className="tabs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'active' : ''}
        >
          Tableau de bord
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={activeTab === 'stats' ? 'active' : ''}
        >
          Statistiques avancées
        </button>
      </div>

      {activeTab === 'dashboard' && dashboard && (
        <SupervisionDashboard data={dashboard} />
      )}

      {activeTab === 'stats' && stats && (
        <SupervisionStats data={stats} />
      )}
    </div>
  );
};

export default SupervisionPage;
```

---

## Notes importantes

1. **Permissions** : Vérifier toujours le rôle de l'utilisateur avant d'afficher les boutons/liens vers la supervision
2. **Actualisation** : Implémenter un rafraîchissement automatique pour les données critiques
3. **Navigation** : Les alertes doivent permettre de naviguer directement vers la circonscription concernée
4. **Historique** : L'historique est trié par date décroissante (plus récent en premier)
5. **Dates** : Toutes les dates sont au format ISO 8601 (UTC)

---

## Support

Pour toute question ou problème, consulter la documentation Swagger à `/api-docs` ou contacter l'équipe backend.

