# Prompt Frontend - Liste des CELs par Région et Circonscription

## Vue d'ensemble

Ce document décrit l'intégration frontend pour la route **Liste des CELs classées par région et circonscription**. Cette route permet de récupérer toutes les CELs organisées hiérarchiquement par région et circonscription avec leur statut d'import.

**Route** : `GET /api/v1/legislatives/resultats/cels-by-region`

**Authentification** : Token JWT requis dans le header `Authorization: Bearer <token>`

**Permissions** :
- **SADMIN**, **ADMIN** : Accès à toutes les CELs
- **MANAGER**, **USER** : Accès uniquement aux CELs des circonscriptions assignées

---

## Route

### Endpoint
```
GET /api/v1/legislatives/resultats/cels-by-region
```

### Description
Récupère la liste des CELs organisées par région et circonscription avec leur statut `ETA_RESULTAT_CEL`. La structure est hiérarchique : Région → Circonscription → CELs.

### Headers
```javascript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### Réponse succès (200)

```typescript
interface CelsByRegionResponse {
  regions: Array<{
    codeRegion: string;                    // Ex: "01"
    libelleRegion: string | null;          // Ex: "LAGUNES"
    circonscriptions: Array<{
      codeCirconscription: string;         // Ex: "004"
      libelleCirconscription: string | null; // Ex: "ANANGUIE, CECHI ET RUBINO"
      cels: Array<{
        codeCel: string;                    // Ex: "S003"
        libelleCel: string | null;          // Ex: "CESP CECHI"
        etatResultat: string | null;        // "I", "PUBLISHED", "CANCELLED", ou null
      }>;
    }>;
  }>;
  totalCels: number;                        // Ex: 150
}
```

### Valeurs possibles pour `etatResultat`

- **`"I"`** : CEL importée (résultats disponibles)
- **`"PUBLISHED"`** : CEL publiée
- **`"CANCELLED"`** : Publication annulée
- **`null`** : CEL non importée (en attente)

### Réponses d'erreur

- **401 Unauthorized** : Token manquant, expiré ou invalide
- **403 Forbidden** : Accès interdit (rôle insuffisant)

### Exemple de réponse

```json
{
  "regions": [
    {
      "codeRegion": "01",
      "libelleRegion": "LAGUNES",
      "circonscriptions": [
        {
          "codeCirconscription": "004",
          "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
          "cels": [
            {
              "codeCel": "S003",
              "libelleCel": "CESP CECHI",
              "etatResultat": "I"
            },
            {
              "codeCel": "S004",
              "libelleCel": "CESP ANANGUIE",
              "etatResultat": "PUBLISHED"
            },
            {
              "codeCel": "S005",
              "libelleCel": "CESP RUBINO",
              "etatResultat": null
            }
          ]
        },
        {
          "codeCirconscription": "005",
          "libelleCirconscription": "AUTRE CIRCONSCRIPTION",
          "cels": [
            {
              "codeCel": "S010",
              "libelleCel": "CESP AUTRE",
              "etatResultat": "I"
            }
          ]
        }
      ]
    },
    {
      "codeRegion": "02",
      "libelleRegion": "HAUTS-BASSINS",
      "circonscriptions": [
        {
          "codeCirconscription": "010",
          "libelleCirconscription": "CIRCONSCRIPTION HAUTS-BASSINS",
          "cels": []
        }
      ]
    }
  ],
  "totalCels": 4
}
```

---

## Exemple d'utilisation

### TypeScript/React

```typescript
// Types
interface CelItem {
  codeCel: string;
  libelleCel: string | null;
  etatResultat: string | null;
}

interface CirconscriptionCels {
  codeCirconscription: string;
  libelleCirconscription: string | null;
  cels: CelItem[];
}

interface RegionCels {
  codeRegion: string;
  libelleRegion: string | null;
  circonscriptions: CirconscriptionCels[];
}

interface CelsByRegionResponse {
  regions: RegionCels[];
  totalCels: number;
}

// Fonction de récupération
const fetchCelsByRegion = async (token: string): Promise<CelsByRegionResponse> => {
  try {
    const response = await fetch(
      '/api/v1/legislatives/resultats/cels-by-region',
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
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expirée');
    }

    if (response.status === 403) {
      throw new Error('Accès interdit. Rôle insuffisant.');
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data: CelsByRegionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des CELs par région:', error);
    throw error;
  }
};
```

### Exemple de composant React

```tsx
import React, { useState, useEffect } from 'react';

const CelsByRegionComponent: React.FC = () => {
  const [data, setData] = useState<CelsByRegionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token manquant');
        }
        const result = await fetchCelsByRegion(token);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des CELs...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  if (!data || data.regions.length === 0) {
    return <div className="empty">Aucune CEL trouvée</div>;
  }

  return (
    <div className="cels-by-region">
      <div className="header">
        <h2>Liste des CELs par Région</h2>
        <p className="total">Total: {data.totalCels} CELs</p>
      </div>

      {data.regions.map((region) => (
        <div key={region.codeRegion} className="region-section">
          <h3 className="region-title">
            {region.libelleRegion || `Région ${region.codeRegion}`}
            <span className="region-code">({region.codeRegion})</span>
          </h3>

          {region.circonscriptions.map((circ) => (
            <div key={circ.codeCirconscription} className="circonscription-section">
              <h4 className="circonscription-title">
                {circ.libelleCirconscription || `Circonscription ${circ.codeCirconscription}`}
                <span className="circonscription-code">({circ.codeCirconscription})</span>
              </h4>

              {circ.cels.length === 0 ? (
                <p className="no-cels">Aucune CEL dans cette circonscription</p>
              ) : (
                <div className="cels-list">
                  {circ.cels.map((cel) => (
                    <div
                      key={cel.codeCel}
                      className={`cel-item cel-${getCelStatusClass(cel.etatResultat)}`}
                    >
                      <div className="cel-code">{cel.codeCel}</div>
                      <div className="cel-libelle">
                        {cel.libelleCel || `CEL ${cel.codeCel}`}
                      </div>
                      <div className="cel-status">
                        {getCelStatusBadge(cel.etatResultat)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Fonctions utilitaires
const getCelStatusClass = (etat: string | null): string => {
  switch (etat) {
    case 'I':
      return 'imported';
    case 'PUBLISHED':
      return 'published';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
};

const getCelStatusBadge = (etat: string | null): JSX.Element => {
  const statusConfig = {
    I: { label: 'Importée', color: 'success' },
    PUBLISHED: { label: 'Publiée', color: 'primary' },
    CANCELLED: { label: 'Annulée', color: 'warning' },
    null: { label: 'En attente', color: 'secondary' },
  };

  const config = statusConfig[etat as keyof typeof statusConfig] || statusConfig.null;

  return (
    <span className={`badge badge-${config.color}`}>
      {config.label}
    </span>
  );
};

export default CelsByRegionComponent;
```

### Exemple avec filtrage et recherche

```tsx
const CelsByRegionWithFilters: React.FC = () => {
  const [data, setData] = useState<CelsByRegionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    // Charger les données...
  }, []);

  // Filtrer les données
  const filteredData = useMemo(() => {
    if (!data) return null;

    const filteredRegions = data.regions
      .map((region) => {
        const filteredCircs = region.circonscriptions
          .map((circ) => {
            let filteredCels = circ.cels;

            // Filtre par statut
            if (filterStatus !== null) {
              filteredCels = filteredCels.filter(
                (cel) => cel.etatResultat === filterStatus
              );
            }

            // Recherche par code ou libellé
            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              filteredCels = filteredCels.filter(
                (cel) =>
                  cel.codeCel.toLowerCase().includes(term) ||
                  cel.libelleCel?.toLowerCase().includes(term) ||
                  circ.codeCirconscription.toLowerCase().includes(term) ||
                  circ.libelleCirconscription?.toLowerCase().includes(term) ||
                  region.codeRegion.toLowerCase().includes(term) ||
                  region.libelleRegion?.toLowerCase().includes(term)
              );
            }

            return {
              ...circ,
              cels: filteredCels,
            };
          })
          .filter((circ) => circ.cels.length > 0); // Ne garder que les circonscriptions avec CELs

        return {
          ...region,
          circonscriptions: filteredCircs,
        };
      })
      .filter((region) => region.circonscriptions.length > 0); // Ne garder que les régions avec circonscriptions

    const totalCels = filteredRegions.reduce(
      (total, region) =>
        total +
        region.circonscriptions.reduce(
          (sum, circ) => sum + circ.cels.length,
          0
        ),
      0
    );

    return {
      regions: filteredRegions,
      totalCels,
    };
  }, [data, searchTerm, filterStatus]);

  return (
    <div className="cels-by-region-with-filters">
      {/* Barre de recherche et filtres */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Rechercher par code, libellé, région, circonscription..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus || ''}
          onChange={(e) =>
            setFilterStatus(e.target.value || null)
          }
          className="status-filter"
        >
          <option value="">Tous les statuts</option>
          <option value="I">Importées</option>
          <option value="PUBLISHED">Publiées</option>
          <option value="CANCELLED">Annulées</option>
          <option value="null">En attente</option>
        </select>
      </div>

      {/* Affichage des données filtrées */}
      {filteredData && (
        <div className="results">
          <p className="results-count">
            {filteredData.totalCels} CEL(s) trouvée(s)
          </p>
          {/* Afficher les régions filtrées... */}
        </div>
      )}
    </div>
  );
};
```

---

## Gestion des erreurs

### Erreurs communes

1. **401 Unauthorized**
   - **Cause** : Token manquant, expiré ou invalide
   - **Action** : Supprimer le token du localStorage et rediriger vers la page de connexion

2. **403 Forbidden**
   - **Cause** : Rôle insuffisant ou accès refusé
   - **Action** : Afficher un message d'erreur approprié et masquer les fonctionnalités non accessibles

3. **500 Internal Server Error**
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
      showNotification(
        'Vous n\'avez pas accès à cette ressource.',
        'error'
      );
      break;
    case 500:
      // Erreur serveur
      showNotification(
        'Erreur serveur. Veuillez réessayer plus tard.',
        'error'
      );
      break;
    default:
      showNotification('Une erreur est survenue.', 'error');
  }
};
```

---

## Bonnes pratiques

### 1. Mise en cache
- Mettre en cache les données pendant 30-60 secondes
- Rafraîchir automatiquement toutes les 2-5 minutes selon l'importance

### 2. Indicateurs visuels pour les statuts
- Utiliser des couleurs cohérentes :
  - **Vert** : `"I"` (Importée) - Succès
  - **Bleu** : `"PUBLISHED"` (Publiée) - Information
  - **Orange** : `"CANCELLED"` (Annulée) - Avertissement
  - **Gris** : `null` (En attente) - Neutre

### 3. Affichage hiérarchique
- Utiliser des composants accordéon ou des listes imbriquées
- Permettre l'expansion/réduction par région et circonscription
- Afficher le nombre de CELs par niveau (région, circonscription)

### 4. Performance
- Implémenter la pagination virtuelle si le nombre de CELs est très élevé
- Utiliser `useMemo` pour les calculs de filtrage
- Charger les données de manière asynchrone avec indicateurs de chargement

### 5. Accessibilité
- Utiliser des balises sémantiques (`<section>`, `<article>`)
- Ajouter des `aria-label` pour les statuts
- Assurer la navigation au clavier

---

## Exemple complet d'intégration

### Service TypeScript

```typescript
// services/cels.service.ts
import { CelsByRegionResponse } from '../types/cels';

const API_BASE_URL = '/api/v1/legislatives/resultats';

export class CelsService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getCelsByRegion(token: string): Promise<CelsByRegionResponse> {
    const response = await fetch(
      `${API_BASE_URL}/cels-by-region`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expirée');
    }

    if (response.status === 403) {
      throw new Error('Accès interdit');
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return response.json();
  }
}
```

### Hook React personnalisé

```tsx
// hooks/useCelsByRegion.ts
import { useState, useEffect } from 'react';
import { CelsService } from '../services/cels.service';
import { CelsByRegionResponse } from '../types/cels';

export const useCelsByRegion = () => {
  const [data, setData] = useState<CelsByRegionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const celsService = new CelsService();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token manquant');
        }
        const result = await celsService.getCelsByRegion(token);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }
      const result = await celsService.getCelsByRegion(token);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
```

### Composant avec hook

```tsx
// components/CelsByRegionPage.tsx
import React from 'react';
import { useCelsByRegion } from '../hooks/useCelsByRegion';
import { CelsTreeView } from './CelsTreeView';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const CelsByRegionPage: React.FC = () => {
  const { data, loading, error, refetch } = useCelsByRegion();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  if (!data || data.regions.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune CEL trouvée</p>
        <button onClick={refetch}>Actualiser</button>
      </div>
    );
  }

  return (
    <div className="cels-by-region-page">
      <div className="page-header">
        <h1>Liste des CELs par Région</h1>
        <div className="header-actions">
          <button onClick={refetch} className="btn-refresh">
            Actualiser
          </button>
          <span className="total-cels">
            {data.totalCels} CEL(s) au total
          </span>
        </div>
      </div>

      <CelsTreeView data={data} />
    </div>
  );
};

export default CelsByRegionPage;
```

### Composant d'affichage en arbre

```tsx
// components/CelsTreeView.tsx
import React, { useState } from 'react';
import { CelsByRegionResponse } from '../types/cels';

interface CelsTreeViewProps {
  data: CelsByRegionResponse;
}

const CelsTreeView: React.FC<CelsTreeViewProps> = ({ data }) => {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedCircs, setExpandedCircs] = useState<Set<string>>(new Set());

  const toggleRegion = (codeRegion: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(codeRegion)) {
      newExpanded.delete(codeRegion);
    } else {
      newExpanded.add(codeRegion);
    }
    setExpandedRegions(newExpanded);
  };

  const toggleCirconscription = (codeCirc: string) => {
    const newExpanded = new Set(expandedCircs);
    if (newExpanded.has(codeCirc)) {
      newExpanded.delete(codeCirc);
    } else {
      newExpanded.add(codeCirc);
    }
    setExpandedCircs(newExpanded);
  };

  const getStatusColor = (etat: string | null): string => {
    switch (etat) {
      case 'I':
        return '#28a745'; // Vert
      case 'PUBLISHED':
        return '#007bff'; // Bleu
      case 'CANCELLED':
        return '#ffc107'; // Orange
      default:
        return '#6c757d'; // Gris
    }
  };

  const getStatusLabel = (etat: string | null): string => {
    switch (etat) {
      case 'I':
        return 'Importée';
      case 'PUBLISHED':
        return 'Publiée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="cels-tree-view">
      {data.regions.map((region) => {
        const isRegionExpanded = expandedRegions.has(region.codeRegion);
        const totalCelsInRegion = region.circonscriptions.reduce(
          (sum, circ) => sum + circ.cels.length,
          0
        );

        return (
          <div key={region.codeRegion} className="tree-node region-node">
            <div
              className="node-header region-header"
              onClick={() => toggleRegion(region.codeRegion)}
            >
              <span className="expand-icon">
                {isRegionExpanded ? '▼' : '▶'}
              </span>
              <span className="node-title">
                {region.libelleRegion || `Région ${region.codeRegion}`}
              </span>
              <span className="node-code">{region.codeRegion}</span>
              <span className="node-count">{totalCelsInRegion} CEL(s)</span>
            </div>

            {isRegionExpanded && (
              <div className="node-children">
                {region.circonscriptions.map((circ) => {
                  const isCircExpanded = expandedCircs.has(
                    circ.codeCirconscription
                  );

                  return (
                    <div
                      key={circ.codeCirconscription}
                      className="tree-node circonscription-node"
                    >
                      <div
                        className="node-header circonscription-header"
                        onClick={() =>
                          toggleCirconscription(circ.codeCirconscription)
                        }
                      >
                        <span className="expand-icon">
                          {isCircExpanded ? '▼' : '▶'}
                        </span>
                        <span className="node-title">
                          {circ.libelleCirconscription ||
                            `Circonscription ${circ.codeCirconscription}`}
                        </span>
                        <span className="node-code">
                          {circ.codeCirconscription}
                        </span>
                        <span className="node-count">
                          {circ.cels.length} CEL(s)
                        </span>
                      </div>

                      {isCircExpanded && (
                        <div className="node-children cels-list">
                          {circ.cels.length === 0 ? (
                            <div className="empty-cels">
                              Aucune CEL dans cette circonscription
                            </div>
                          ) : (
                            circ.cels.map((cel) => (
                              <div
                                key={cel.codeCel}
                                className="cel-item"
                                style={{
                                  borderLeft: `4px solid ${getStatusColor(
                                    cel.etatResultat
                                  )}`,
                                }}
                              >
                                <div className="cel-code">{cel.codeCel}</div>
                                <div className="cel-libelle">
                                  {cel.libelleCel || `CEL ${cel.codeCel}`}
                                </div>
                                <div
                                  className="cel-status"
                                  style={{
                                    color: getStatusColor(cel.etatResultat),
                                  }}
                                >
                                  {getStatusLabel(cel.etatResultat)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CelsTreeView;
```

---

## Statistiques et agrégations

### Calculer des statistiques par région

```typescript
const calculateRegionStats = (data: CelsByRegionResponse) => {
  return data.regions.map((region) => {
    const stats = {
      totalCels: 0,
      importedCels: 0,
      publishedCels: 0,
      cancelledCels: 0,
      pendingCels: 0,
    };

    region.circonscriptions.forEach((circ) => {
      circ.cels.forEach((cel) => {
        stats.totalCels++;
        switch (cel.etatResultat) {
          case 'I':
            stats.importedCels++;
            break;
          case 'PUBLISHED':
            stats.publishedCels++;
            break;
          case 'CANCELLED':
            stats.cancelledCels++;
            break;
          default:
            stats.pendingCels++;
        }
      });
    });

    return {
      codeRegion: region.codeRegion,
      libelleRegion: region.libelleRegion,
      ...stats,
      tauxImport: stats.totalCels > 0
        ? Math.round((stats.importedCels / stats.totalCels) * 100)
        : 0,
    };
  });
};
```

---

## Notes importantes

1. **Permissions** : Vérifier toujours le rôle de l'utilisateur avant d'afficher les données
2. **Performance** : Pour un grand nombre de CELs, considérer l'implémentation de la pagination ou du chargement progressif
3. **Actualisation** : Implémenter un rafraîchissement automatique pour les données critiques
4. **Statuts** : Les statuts `ETA_RESULTAT_CEL` peuvent être `null` (non importé), `"I"` (importé), `"PUBLISHED"` (publié), ou `"CANCELLED"` (annulé)
5. **Structure hiérarchique** : La réponse est organisée par région, puis par circonscription, puis par CEL

---

## Support

Pour toute question ou problème, consulter la documentation Swagger à `/api-docs` ou contacter l'équipe backend.

