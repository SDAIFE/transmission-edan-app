# 📊 Guide d'utilisation des Métriques Temps Réel - Frontend

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser les endpoints de métriques en temps réel depuis le frontend. Ces endpoints sont accessibles selon le rôle de l'utilisateur :
- **USER** : Métriques basées sur les cellules assignées
- **ADMIN** : Métriques globales (toutes les circonscriptions)
- **SADMIN** : Métriques globales (toutes les circonscriptions)

---

## 🔗 Endpoints disponibles

### 1. Métriques de base des circonscriptions
```
GET /api/v1/metrics/circonscriptions
```
**Accès** : SADMIN, ADMIN  
**Documentation** : Voir [GUIDE_METRIQUES_FRONTEND.md](./GUIDE_METRIQUES_FRONTEND.md)

### 2. Métriques temps réel (nouveau)
```
GET /api/v1/metrics/realtime-metrics
```
**Accès** : Tous les utilisateurs authentifiés  
**Description** : Métriques optimisées pour des mises à jour fréquentes, adaptées au rôle

### 3. Rafraîchissement forcé (nouveau)
```
POST /api/v1/metrics/refresh-metrics
```
**Accès** : SADMIN, ADMIN  
**Description** : Force le rafraîchissement des métriques (invalidation du cache)

---

## ⚠️ IMPORTANT : Architecture sécurisée

**Ce projet utilise une architecture sécurisée avec :**
- ✅ **Proxy Next.js** : Toutes les requêtes passent par `/api/backend` qui est automatiquement transformé en `${API_URL}/api/v1/`
- ✅ **Cookies httpOnly** : Les tokens sont stockés de manière sécurisée (pas de localStorage)
- ✅ **apiClient** : Client Axios configuré avec intercepteurs automatiques
- ✅ **Gestion d'erreurs centralisée** : Utilise `handleApiError()` pour toutes les erreurs

**Ne jamais utiliser :**
- ❌ URLs directes vers le backend (erreurs CORS)
- ❌ `localStorage` pour les tokens (vulnérable XSS)
- ❌ `fetch` ou `axios` direct (utiliser `apiClient`)

---

## 📡 Endpoint : Métriques Temps Réel

### URL
```
GET /api/v1/metrics/realtime-metrics
```

### Authentification
```http
Authorization: Bearer <accessToken>
```

### Réponse

La structure de la réponse varie selon le rôle de l'utilisateur :

#### Pour USER
```json
{
  "success": true,
  "message": "Métriques temps réel récupérées avec succès",
  "data": {
    "totalCels": 100,
    "celsAvecImport": 75,
    "celsSansImport": 25,
    "tauxProgressionPersonnel": 75.0,
    "celsParStatut": {
      "pending": 10,
      "imported": 75,
      "error": 5,
      "processing": 0
    },
    "dernierImport": "2025-11-28T10:00:00.000Z",
    "nombreErreurs": 5,
    "alertes": {
      "celsSansImport": 25,
      "celsEnErreur": 5,
      "celsEnAttente": 10
    },
    "celsAssignees": 100,
    "celsAvecImportAssignees": 75,
    "celsSansImportAssignees": 25,
    "timestamp": "2025-11-28T10:00:00.000Z",
    "activiteRecente": {
      "imports24h": 10,
      "timestamp": "2025-11-28T10:00:00.000Z"
    },
    "importsEnCours": {
      "count": 3,
      "imports": [
        {
          "id": 1,
          "COD_CE": "001",
          "NOM_FICHIER": "resultats.xlsx",
          "STATUT_IMPORT": "PROCESSING",
          "DATE_IMPORT": "2025-11-28T09:00:00.000Z"
        }
      ]
    },
    "alertesCritiques": {
      "importsErreur": 2,
      "timestamp": "2025-11-28T10:00:00.000Z"
    }
  }
}
```

#### Pour ADMIN/SADMIN
```json
{
  "success": true,
  "message": "Métriques temps réel récupérées avec succès",
  "data": {
    "totalCels": 500,
    "celsAvecImport": 400,
    "celsSansImport": 100,
    "tauxProgression": 80.0,
    "celsParStatut": {
      "pending": 50,
      "imported": 400,
      "error": 20,
      "processing": 30
    },
    "nombreErreurs": 20,
    "alertes": {
      "celsSansImport": 100,
      "celsEnErreur": 20,
      "celsEnAttente": 50
    },
    "totalRegions": 31,
    "totalCirconscriptions": 205,
    "totalUtilisateurs": 50,
    "utilisateursParRole": [
      { "role": "SADMIN", "count": 2 },
      { "role": "ADMIN", "count": 5 },
      { "role": "USER", "count": 43 }
    ],
    "importsParJour": [
      {
        "date": "2025-11-28",
        "nombreImports": 10,
        "nombreReussis": 9,
        "nombreEchoues": 1
      }
    ],
    "circonscriptionsAssignees": 205,
    "utilisateursActifs": 45,
    "celsParCirconscription": [
      {
        "COD_CE": "001",
        "LIB_CE": "Circonscription 1",
        "totalCels": 10,
        "celsAvecImport": 8,
        "tauxProgression": 80.0
      }
    ],
    "timestamp": "2025-11-28T10:00:00.000Z",
    "activiteRecente": {
      "imports24h": 50,
      "timestamp": "2025-11-28T10:00:00.000Z"
    },
    "importsEnCours": {
      "count": 5,
      "imports": [...]
    },
    "alertesCritiques": {
      "importsErreur": 5,
      "timestamp": "2025-11-28T10:00:00.000Z"
    }
  }
}
```

### En cas d'erreur
```json
{
  "success": false,
  "message": "Erreur lors de la récupération des métriques temps réel",
  "error": "Message d'erreur détaillé"
}
```

---

## 📡 Endpoint : Rafraîchissement Forcé

### URL
```
POST /api/v1/metrics/refresh-metrics
```

### Authentification (Architecture sécurisée)

L'authentification est gérée automatiquement via les **cookies httpOnly** :

- ✅ **Cookies httpOnly** : Les tokens sont stockés de manière sécurisée
- ✅ **Intercepteur Axios** : Ajoute automatiquement les headers d'authentification
- ✅ **Proxy Next.js** : Toutes les requêtes passent par `/api/backend` qui est transformé automatiquement

**Headers automatiques (gérés par l'intercepteur)** :
```http
Authorization: Bearer <accessToken_from_httpOnly_cookie>
Content-Type: application/json
```

### Accès
**Autorisé** : SADMIN, ADMIN  
**Refusé** : USER, non authentifié

### ⚠️ Important : Utiliser le proxy Next.js

Toutes les requêtes doivent passer par le proxy Next.js :
- **Requête** : `/api/backend/metrics/refresh-metrics`
- **Proxy Next.js** : Transforme automatiquement en `${NEXT_PUBLIC_API_URL}/api/v1/metrics/refresh-metrics`

### Réponse
```json
{
  "success": true,
  "message": "Métriques rafraîchies avec succès",
  "timestamp": "2025-11-28T10:00:00.000Z"
}
```

---

## 📝 Exemples d'utilisation

### 1. Utilisation du service dashboardApi (Recommandé)

```typescript
import { dashboardApi } from '@/lib/api/dashboard';
import { handleApiError } from '@/lib/api/client';

// Récupérer les métriques temps réel
async function getRealtimeMetrics() {
  try {
    // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
    // Pas besoin de token manuel, les cookies httpOnly sont inclus automatiquement
    const metrics = await dashboardApi.getRealtimeMetrics();
    return metrics;
  } catch (error) {
    // Utilise le gestionnaire d'erreurs centralisé
    throw new Error(handleApiError(error));
  }
}

// Rafraîchir les métriques (SADMIN/ADMIN uniquement)
async function refreshMetrics() {
  try {
    // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
    const result = await dashboardApi.refreshMetrics();
    return result;
  } catch (error) {
    const errorObj = error as { response?: { status?: number } };
    
    if (errorObj.response?.status === 403) {
      throw new Error('Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).');
    }
    
    throw new Error(handleApiError(error));
  }
}
```

### 1.1. Fetch API avec proxy Next.js (Alternative)

```javascript
async function getRealtimeMetrics() {
  try {
    // ✅ PROXY : Utilise le proxy Next.js via /api/backend
    // Le proxy transforme automatiquement en ${API_URL}/api/v1/metrics/realtime-metrics
    const response = await fetch('/api/backend/metrics/realtime-metrics', {
      method: 'GET',
      credentials: 'include', // ✅ CRITIQUE : Inclut les cookies httpOnly
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // L'intercepteur gère déjà la redirection
        throw new Error('Session expirée. Redirection automatique vers la connexion.');
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erreur lors de la récupération des métriques');
    }
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}
```

### 2. Utilisation d'apiClient (Architecture sécurisée)

```typescript
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/client';

// Récupérer les métriques temps réel
async function getRealtimeMetrics() {
  try {
    // ✅ PROXY : Utilise apiClient qui gère automatiquement :
    // - Les cookies httpOnly via credentials: 'include'
    // - Le refresh automatique des tokens expirés
    // - Les headers d'authentification
    const response = await apiClient.get('/metrics/realtime-metrics');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Erreur lors de la récupération des métriques');
    }
  } catch (error) {
    if (error.response?.status === 401) {
      // L'intercepteur gère déjà la redirection
      throw new Error('Session expirée. Redirection automatique.');
    }
    throw new Error(handleApiError(error));
  }
}

// Rafraîchir les métriques (SADMIN/ADMIN uniquement)
async function refreshMetrics() {
  try {
    // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
    const response = await apiClient.post('/metrics/refresh-metrics');
    return response.data;
  } catch (error) {
    const errorObj = error as { response?: { status?: number } };
    
    if (errorObj.response?.status === 401) {
      throw new Error('Session expirée. Redirection automatique.');
    }
    if (errorObj.response?.status === 403) {
      throw new Error('Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).');
    }
    throw new Error(handleApiError(error));
  }
}
```

### 3. React Hook personnalisé (Intégré avec notre architecture)

```typescript
// hooks/useRealtimeMetrics.ts
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeMetricsDto } from '@/types/dashboard';

/**
 * Hook personnalisé pour les métriques temps réel
 * 
 * Caractéristiques :
 * - Utilise dashboardApi avec authentification automatique (cookies httpOnly)
 * - Vérification automatique des permissions
 * - Gestion d'état complète (loading, error, data)
 * - Support du rafraîchissement automatique
 * - Intégration avec le contexte d'authentification
 */
export function useRealtimeMetrics(
  autoRefresh = false, 
  refreshInterval = 30000
) {
  const [metrics, setMetrics] = useState<RealtimeMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchMetrics = useCallback(async () => {
    // Vérifications préalables
    if (!isAuthenticated || !user) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // ✅ PROXY : Utilise dashboardApi qui passe automatiquement par le proxy Next.js
      // Les cookies httpOnly sont inclus automatiquement
      const data = await dashboardApi.getRealtimeMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      const errorObj = err as { 
        message?: string; 
        response?: { status?: number } 
      };
      
      if (errorObj.response?.status === 401) {
        setError('Session expirée. Redirection automatique vers la connexion.');
        // L'intercepteur gère déjà la redirection
      } else {
        const errorMessage = errorObj.message || 'Erreur lors de la récupération des métriques';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMetrics();
    }
  }, [fetchMetrics, isAuthenticated, user]);

  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !user || loading || error) {
      return;
    }

    const interval = setInterval(() => {
      fetchMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, user, loading, error, refreshInterval, fetchMetrics]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const userRole = user.role?.code;
      
      // ✅ PERMISSIONS : Seuls les admins peuvent forcer le rafraîchissement
      if (userRole === 'ADMIN' || userRole === 'SADMIN') {
        await dashboardApi.refreshMetrics();
      }
      
      // Recharger les métriques après rafraîchissement
      await fetchMetrics();
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number } };
      
      if (errorObj.response?.status === 403) {
        throw new Error('Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).');
      }
      throw err;
    }
  }, [isAuthenticated, user, fetchMetrics]);

  return { 
    metrics, 
    loading, 
    error, 
    refresh, 
    refetch: fetchMetrics 
  };
}
```

**Utilisation dans un composant React avec notre UI** :

```tsx
// components/RealtimeMetricsDashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useAuth } from '@/contexts/AuthContext';

export function RealtimeMetricsDashboard() {
  const { user } = useAuth();
  const { metrics, loading, error, refresh, refetch } = useRealtimeMetrics(true, 30000);

  if (loading && !metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Chargement des métriques...</span>
        </CardContent>
      </Card>
    );
  }

  if (error && !metrics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Erreur: {error}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertDescription>Aucune donnée disponible</AlertDescription>
      </Alert>
    );
  }

  // Calcul du taux de progression selon le rôle
  const tauxProgression = metrics.tauxProgression || metrics.tauxProgressionPersonnel || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métriques Temps Réel</h2>
          <p className="text-sm text-muted-foreground">
            Dernière mise à jour: {new Date(metrics.timestamp).toLocaleString('fr-FR')}
          </p>
        </div>
        
        {['ADMIN', 'SADMIN'].includes(user?.role?.code || '') && (
          <Button onClick={refresh} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CELs</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCels}</div>
            <p className="text-xs text-muted-foreground">
              Taux: {tauxProgression.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec Import</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.celsAvecImport}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.celsParStatut?.imported || 0} importées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sans Import</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.celsSansImport}</div>
            <p className="text-xs text-muted-foreground">
              En attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.alertes?.celsEnErreur || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Erreurs détectées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      {metrics.activiteRecente && (
        <Card>
          <CardHeader>
            <CardTitle>Activité récente (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Imports: <strong>{metrics.activiteRecente.imports24h || 0}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Imports en cours */}
      {metrics.importsEnCours && metrics.importsEnCours.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imports en cours ({metrics.importsEnCours.count})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {metrics.importsEnCours.imports?.map((imp: any) => (
                <li key={imp.id} className="flex items-center justify-between">
                  <span>{imp.NOM_FICHIER}</span>
                  <span className="text-sm text-muted-foreground">{imp.STATUT_IMPORT}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 4. Utilisation du hook existant (Recommandé)

Le projet contient déjà un hook `useDashboardMetrics` qui gère les métriques. Pour les métriques temps réel, utilisez directement le composant `RealtimeMetrics` :

```tsx
import { RealtimeMetrics } from '@/components/dashboard/realtime-metrics';

export function DashboardPage() {
  return (
    <div>
      {/* Le composant gère automatiquement l'authentification et les permissions */}
      <RealtimeMetrics 
        enabled={true}
        refreshInterval={60000} // 1 minute
      />
    </div>
  );
}
```

Ou utilisez le service directement :

```typescript
import { dashboardApi } from '@/lib/api/dashboard';

// Dans votre composant
const metrics = await dashboardApi.getRealtimeMetrics();
```

---

## 🔄 Rafraîchissement automatique

Le hook `useRealtimeMetrics` gère automatiquement le rafraîchissement :

```typescript
// Utilisation avec rafraîchissement automatique
const { metrics, loading, error } = useRealtimeMetrics(
  true,    // autoRefresh activé
  30000    // Toutes les 30 secondes
);

// Ou avec le composant RealtimeMetrics
<RealtimeMetrics 
  enabled={true}
  refreshInterval={30000} // 30 secondes
/>
```

**Recommandations d'intervalle** :
- **USER** : 60 secondes (1 minute) - données personnelles
- **ADMIN/SADMIN** : 30-60 secondes - données globales
- **Production** : Éviter les intervalles < 30 secondes pour réduire la charge serveur

---

## ⚠️ Gestion des erreurs

### Codes de statut HTTP

| Code | Signification | Action recommandée |
|------|---------------|-------------------|
| `200` | ✅ Succès | Afficher les métriques |
| `401` | ❌ Non authentifié | Rediriger vers la page de connexion |
| `403` | ❌ Accès refusé | Afficher un message (pour refresh-metrics uniquement) |
| `500` | ❌ Erreur serveur | Afficher un message d'erreur générique |

---

## 📋 Checklist d'intégration (Architecture sécurisée)

### ✅ Sécurité et Authentification
- [ ] Utiliser `dashboardApi` ou `apiClient` au lieu de fetch/axios direct
- [ ] Vérifier l'authentification via `useAuth()` hook
- [ ] Ne jamais utiliser `localStorage` pour les tokens (vulnérable XSS)
- [ ] Utiliser `credentials: 'include'` si utilisation de fetch direct
- [ ] S'assurer que toutes les requêtes passent par le proxy Next.js

### ✅ Gestion d'erreurs
- [ ] Gérer les erreurs 401 (session expirée - redirection automatique)
- [ ] Gérer les erreurs 403 (permissions insuffisantes pour refresh-metrics)
- [ ] Utiliser `handleApiError()` pour la gestion centralisée
- [ ] Afficher des messages d'erreur appropriés à l'utilisateur

### ✅ Interface utilisateur
- [ ] Afficher un état de chargement avec `Loader2` (Lucide React)
- [ ] Utiliser les composants UI du projet (`Card`, `Alert`, `Button`)
- [ ] Adapter l'affichage selon le rôle (USER vs ADMIN/SADMIN)
- [ ] Afficher les métriques de manière claire et accessible

### ✅ Performance et UX
- [ ] Implémenter un rafraîchissement automatique avec intervalle approprié
- [ ] Gérer les états de chargement et d'erreur
- [ ] Utiliser des hooks personnalisés pour la logique métier
- [ ] Optimiser les re-renders avec `useCallback` et `useMemo`

---

## 🔗 URLs de configuration (Via proxy Next.js)

### ✅ Architecture sécurisée

**Ne jamais utiliser les URLs directes !** Utilisez toujours le proxy Next.js :

### Développement
```
Requête : /api/backend/metrics/realtime-metrics
Proxy Next.js transforme en : ${NEXT_PUBLIC_API_URL}/api/v1/metrics/realtime-metrics
```

### Production
```
Requête : /api/backend/metrics/realtime-metrics
Proxy Next.js transforme en : ${NEXT_PUBLIC_API_URL}/api/v1/metrics/realtime-metrics
```

### Configuration

Le proxy est configuré dans `next.config.ts` :
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

**Variables d'environnement** :
- `NEXT_PUBLIC_API_URL` : URL du backend (ex: `http://localhost:3001` ou `http://10.100.40.144:8081`)

---

## 📚 Ressources supplémentaires

- [Guide métriques de base](./GUIDE_METRIQUES_FRONTEND.md) - Pour les métriques simples
- [Guide d'authentification](./GUIDE_AUTHENTIFICATION.md) - Pour plus de détails sur l'authentification JWT
- **Architecture du projet** :
  - `lib/api/dashboard.ts` - Service API pour les métriques dashboard
  - `lib/api/client.ts` - Client Axios configuré avec intercepteurs
  - `lib/api/interceptor.ts` - Gestion automatique de l'authentification
  - `contexts/AuthContext.tsx` - Contexte d'authentification global
  - `hooks/use-dashboard-metrics.ts` - Hook pour les métriques dashboard
  - `components/dashboard/realtime-metrics.tsx` - Composant métriques temps réel
  - `components/ui/` - Composants d'interface utilisateur

## 🔧 Configuration recommandée

### Structure de service recommandée

```typescript
// lib/services/realtime-metrics.service.ts
import { dashboardApi } from '@/lib/api/dashboard';
import { handleApiError } from '@/lib/api/client';

export const realtimeMetricsService = {
  async getMetrics() {
    try {
      const metrics = await dashboardApi.getRealtimeMetrics();
      return metrics;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async refresh() {
    try {
      const result = await dashboardApi.refreshMetrics();
      return result;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};
```

### Hook personnalisé recommandé

```typescript
// hooks/useRealtimeMetrics.ts
import { useState, useEffect, useCallback } from 'react';
import { realtimeMetricsService } from '@/lib/services/realtime-metrics.service';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeMetrics(autoRefresh = false, refreshInterval = 30000) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      realtimeMetricsService.getMetrics()
        .then(setMetrics)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, user]);

  // Rafraîchissement automatique...
  
  return { metrics, loading, error };
}
```

---

**Dernière mise à jour** : 2025-11-28

