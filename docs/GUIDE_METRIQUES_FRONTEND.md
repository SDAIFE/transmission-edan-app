# 📊 Guide d'utilisation des métriques - Frontend

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser l'endpoint de métriques des circonscriptions depuis le frontend. Cet endpoint est accessible uniquement aux utilisateurs ayant les rôles **SADMIN** ou **ADMIN**.

---

## 🔗 Endpoint

```
GET /api/v1/metrics/circonscriptions
```

**Base URL** : `http://localhost:3001` (développement) ou votre URL de production

---

## 🔐 Authentification (Architecture sécurisée)

L'endpoint nécessite une authentification JWT via des **cookies httpOnly sécurisés**. 

### ✅ Configuration automatique

Avec notre architecture, l'authentification est gérée automatiquement :

- **Cookies httpOnly** : Les tokens sont stockés de manière sécurisée (protection XSS)
- **Intercepteur Axios** : Ajoute automatiquement les headers d'authentification
- **Refresh automatique** : Renouvelle les tokens expirés sans intervention
- **Redirection automatique** : Redirige vers `/auth/login` si session expirée

### Headers automatiques (gérés par l'intercepteur)

```http
Authorization: Bearer <accessToken_from_httpOnly_cookie>
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

### ⚠️ Important : Utiliser credentials: 'include'

Si vous utilisez `fetch` directement (non recommandé), vous DEVEZ inclure :

```javascript
fetch('/api/endpoint', {
  credentials: 'include', // ✅ CRITIQUE pour les cookies httpOnly
  // ... autres options
});
```

---

## 📥 Réponse

### Format de réponse

```json
{
  "total": 255,
  "published": 150,
  "remaining": 105
}
```

### Propriétés

| Propriété | Type | Description |
|-----------|------|-------------|
| `total` | `number` | Nombre total de circonscriptions |
| `published` | `number` | Nombre de circonscriptions publiées (STAT_PUB = '1') |
| `remaining` | `number` | Nombre de circonscriptions restantes à publier |

---

## 📝 Exemples d'utilisation

### 1. Fetch API (JavaScript natif) - Version sécurisée avec cookies httpOnly

```javascript
async function getCirconscriptionMetrics() {
  try {
    // ✅ SÉCURITÉ : Pas besoin de récupérer le token manuellement
    // Les cookies httpOnly sont automatiquement inclus avec credentials: 'include'
    
    const response = await fetch('http://localhost:3001/api/v1/metrics/circonscriptions', {
      method: 'GET',
      credentials: 'include', // ✅ CRITIQUE : Inclut automatiquement les cookies httpOnly
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide - rediriger vers login
        window.location.href = '/auth/login?session_expired=true';
        throw new Error('Session expirée. Redirection vers la page de connexion.');
      }
      if (response.status === 403) {
        throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Métriques:', data);
    // { total: 255, published: 150, remaining: 105 }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    throw error;
  }
}
```

### 2. Axios avec intercepteur d'authentification (Recommandé)

```javascript
import { apiClient } from '@/lib/api/client'; // Utilise notre client Axios configuré

async function getCirconscriptionMetrics() {
  try {
    // ✅ SÉCURITÉ : Utilise apiClient qui gère automatiquement :
    // - Les cookies httpOnly via credentials: 'include'
    // - Le refresh automatique des tokens expirés
    // - Les headers d'authentification
    
    const response = await apiClient.get('/api/v1/metrics/circonscriptions');

    const { total, published, remaining } = response.data;
    console.log(`Total: ${total}, Publiées: ${published}, Restantes: ${remaining}`);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Erreur de réponse du serveur
      if (error.response.status === 401) {
        // L'intercepteur gère déjà la redirection, mais on peut ajouter une logique
        throw new Error('Session expirée. Redirection automatique vers la connexion.');
      }
      if (error.response.status === 403) {
        throw new Error('Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).');
      }
      throw new Error(`Erreur ${error.response.status}: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // Requête envoyée mais pas de réponse
      throw new Error('Aucune réponse du serveur. Vérifiez votre connexion.');
    } else {
      // Erreur lors de la configuration de la requête
      throw new Error(`Erreur: ${error.message}`);
    }
  }
}

// ✅ Alternative : Service dédié aux métriques
export const metricsService = {
  async getCirconscriptionMetrics() {
    try {
      const response = await apiClient.get('/api/v1/metrics/circonscriptions');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};
```

### 3. React Hook personnalisé (Intégré avec notre architecture)

```typescript
// hooks/useCirconscriptionMetrics.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface CirconscriptionMetrics {
  total: number;
  published: number;
  remaining: number;
}

export function useCirconscriptionMetrics() {
  const [metrics, setMetrics] = useState<CirconscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    async function fetchMetrics() {
      // ✅ SÉCURITÉ : Vérifier l'authentification et les permissions
      if (!isAuthenticated || !user) {
        setError('Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      // ✅ PERMISSIONS : Vérifier le rôle (SADMIN ou ADMIN uniquement)
      if (!['SADMIN', 'ADMIN'].includes(user.role?.code || '')) {
        setError('Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // ✅ SÉCURITÉ : Utilise apiClient avec cookies httpOnly automatiques
        const response = await apiClient.get<CirconscriptionMetrics>(
          '/api/v1/metrics/circonscriptions'
        );

        setMetrics(response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Session expirée. Redirection automatique vers la connexion.');
          // L'intercepteur gère déjà la redirection
        } else if (err.response?.status === 403) {
          setError('Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).');
        } else {
          setError(err.message || 'Erreur lors de la récupération des métriques');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [isAuthenticated, user]);

  return { metrics, loading, error };
}
```

**Utilisation dans un composant React avec notre UI** :

```tsx
// components/MetricsDashboard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BarChart3, CheckCircle, Clock } from 'lucide-react';
import { useCirconscriptionMetrics } from '../hooks/useCirconscriptionMetrics';
import { useAuth } from '@/contexts/AuthContext';

export function MetricsDashboard() {
  const { metrics, loading, error } = useCirconscriptionMetrics();
  const { user } = useAuth();

  // ✅ PERMISSIONS : Vérification côté composant également
  if (!['SADMIN', 'ADMIN'].includes(user?.role?.code || '')) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Accès refusé. Seuls les administrateurs peuvent consulter ces métriques.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Chargement des métriques...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erreur: {error}</AlertDescription>
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

  const publishedPercentage = metrics.total > 0 
    ? ((metrics.published / metrics.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Métriques des Circonscriptions</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              Circonscriptions totales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.published}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPercentage.toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restantes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.remaining}</div>
            <p className="text-xs text-muted-foreground">
              À publier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardHeader>
          <CardTitle>Progression de la publication</CardTitle>
          <CardDescription>
            {metrics.published} sur {metrics.total} circonscriptions publiées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={publishedPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            {publishedPercentage.toFixed(1)}% complété
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Vue.js Composable

```typescript
// composables/useCirconscriptionMetrics.ts
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface CirconscriptionMetrics {
  total: number;
  published: number;
  remaining: number;
}

export function useCirconscriptionMetrics() {
  const metrics = ref<CirconscriptionMetrics | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function fetchMetrics() {
    try {
      loading.value = true;
      error.value = null;

      const token = localStorage.getItem('accessToken');
      const response = await axios.get<CirconscriptionMetrics>(
        'http://localhost:3001/api/v1/metrics/circonscriptions',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      metrics.value = response.data;
    } catch (err: any) {
      if (err.response?.status === 401) {
        error.value = 'Non authentifié. Veuillez vous reconnecter.';
      } else if (err.response?.status === 403) {
        error.value = 'Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).';
      } else {
        error.value = err.message || 'Erreur lors de la récupération des métriques';
      }
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchMetrics();
  });

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
```

**Utilisation dans un composant Vue** :

```vue
<template>
  <div class="metrics-dashboard">
    <h2>Métriques des Circonscriptions</h2>

    <div v-if="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="metrics" class="metrics-grid">
      <div class="metric-card">
        <h3>Total</h3>
        <p class="metric-value">{{ metrics.total }}</p>
      </div>
      
      <div class="metric-card">
        <h3>Publiées</h3>
        <p class="metric-value">{{ metrics.published }}</p>
        <p class="metric-percentage">
          {{ ((metrics.published / metrics.total) * 100).toFixed(1) }}%
        </p>
      </div>
      
      <div class="metric-card">
        <h3>Restantes</h3>
        <p class="metric-value">{{ metrics.remaining }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCirconscriptionMetrics } from '@/composables/useCirconscriptionMetrics';

const { metrics, loading, error } = useCirconscriptionMetrics();
</script>
```

---

## ⚠️ Gestion des erreurs

### Codes de statut HTTP

| Code | Signification | Action recommandée |
|------|---------------|-------------------|
| `200` | ✅ Succès | Afficher les métriques |
| `401` | ❌ Non authentifié | Rediriger vers la page de connexion |
| `403` | ❌ Accès refusé | Afficher un message d'erreur (rôle insuffisant) |
| `500` | ❌ Erreur serveur | Afficher un message d'erreur générique |

### Exemple de gestion d'erreurs complète (Architecture sécurisée)

```typescript
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/client';

async function getCirconscriptionMetrics() {
  try {
    // ✅ SÉCURITÉ : Plus besoin de vérifier le token manuellement
    // L'intercepteur gère automatiquement :
    // - La présence du token dans les cookies httpOnly
    // - Le refresh automatique si le token est expiré
    // - La redirection vers /auth/login si nécessaire

    const response = await apiClient.get('/api/v1/metrics/circonscriptions');
    return response.data;
  } catch (error) {
    // ✅ Utilise notre gestionnaire d'erreurs centralisé
    const errorMessage = handleApiError(error);
    
    // Gestion spécifique selon le type d'erreur
    if (error.response?.status === 401) {
      // L'intercepteur a déjà géré la redirection
      console.log('Session expirée, redirection automatique vers login');
      throw new Error('Session expirée. Redirection automatique.');
    }

    if (error.response?.status === 403) {
      throw new Error('Vous n\'avez pas les permissions nécessaires (SADMIN ou ADMIN requis).');
    }

    if (error.response?.status === 500) {
      throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
    }

    // Erreur générique
    throw new Error(errorMessage);
  }
}

// ✅ Version avec service dédié (Recommandée)
export const metricsService = {
  async getCirconscriptionMetrics() {
    try {
      const response = await apiClient.get('/api/v1/metrics/circonscriptions');
      return response.data;
    } catch (error) {
      // Le gestionnaire d'erreurs global s'occupe de tout
      throw new Error(handleApiError(error));
    }
  }
};

// ✅ Utilisation avec le contexte d'authentification
import { useAuth } from '@/contexts/AuthContext';

export function useMetricsWithAuth() {
  const { user, isAuthenticated } = useAuth();

  const getMetrics = async () => {
    // Vérifications préalables
    if (!isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    if (!['SADMIN', 'ADMIN'].includes(user?.role?.code || '')) {
      throw new Error('Permissions insuffisantes');
    }

    return await metricsService.getCirconscriptionMetrics();
  };

  return { getMetrics };
}
```

---

## 🔄 Rafraîchissement automatique

Pour rafraîchir les métriques automatiquement (ex: toutes les 30 secondes) :

```typescript
// React
useEffect(() => {
  const interval = setInterval(() => {
    fetchMetrics();
  }, 30000); // 30 secondes

  return () => clearInterval(interval);
}, []);

// Vue
onMounted(() => {
  fetchMetrics();
  const interval = setInterval(fetchMetrics, 30000);
  onUnmounted(() => clearInterval(interval));
});
```

---

## 📋 Checklist d'intégration (Architecture sécurisée)

### ✅ Sécurité et Authentification
- [ ] Utiliser `apiClient` au lieu de fetch/axios direct (gestion automatique des cookies)
- [ ] Vérifier l'authentification via `useAuth()` hook
- [ ] Vérifier les permissions utilisateur (SADMIN ou ADMIN uniquement)
- [ ] Utiliser `credentials: 'include'` si utilisation de fetch direct
- [ ] Ne jamais stocker de tokens en localStorage (vulnérable XSS)

### ✅ Gestion d'erreurs
- [ ] Gérer les erreurs 401 (session expirée - redirection automatique)
- [ ] Gérer les erreurs 403 (permissions insuffisantes)
- [ ] Utiliser `handleApiError()` pour la gestion centralisée
- [ ] Afficher des messages d'erreur appropriés à l'utilisateur

### ✅ Interface utilisateur
- [ ] Afficher un état de chargement avec `Loader2` (Lucide React)
- [ ] Utiliser les composants UI du projet (`Card`, `Alert`, `Progress`)
- [ ] Afficher les métriques de manière claire et accessible
- [ ] Implémenter une vérification des permissions côté composant

### ✅ Performance et UX
- [ ] (Optionnel) Implémenter un rafraîchissement automatique
- [ ] Gérer les états de chargement et d'erreur
- [ ] Utiliser des hooks personnalisés pour la logique métier
- [ ] Optimiser les re-renders avec `useCallback` et `useMemo`

---

## 🔗 URLs de configuration

### Développement
```
http://localhost:3001/api/v1/metrics/circonscriptions
```

### Production
```
https://votre-domaine.com/api/v1/metrics/circonscriptions
```

**Note** : Assurez-vous de configurer la base URL dans votre fichier de configuration d'environnement.

---

## 📚 Ressources supplémentaires

- [Documentation Swagger](http://localhost:3001/api/docs) - Documentation interactive de l'API
- [Guide d'authentification](./GUIDE_AUTHENTIFICATION.md) - Pour plus de détails sur l'authentification JWT
- **Architecture du projet** :
  - `lib/api/client.ts` - Client Axios configuré avec intercepteurs
  - `lib/api/interceptor.ts` - Gestion automatique de l'authentification
  - `contexts/AuthContext.tsx` - Contexte d'authentification global
  - `actions/auth.action.ts` - Gestion sécurisée des cookies httpOnly
  - `components/ui/` - Composants d'interface utilisateur

## 🔧 Configuration recommandée

### Structure de service recommandée

```typescript
// lib/services/metrics.service.ts
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/client';

export const metricsService = {
  async getCirconscriptionMetrics() {
    try {
      const response = await apiClient.get('/api/v1/metrics/circonscriptions');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};
```

### Hook personnalisé recommandé

```typescript
// hooks/useMetrics.ts
import { useState, useEffect } from 'react';
import { metricsService } from '@/lib/services/metrics.service';
import { useAuth } from '@/contexts/AuthContext';

export function useCirconscriptionMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && ['SADMIN', 'ADMIN'].includes(user?.role?.code || '')) {
      metricsService.getCirconscriptionMetrics()
        .then(setMetrics)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError('Permissions insuffisantes');
    }
  }, [isAuthenticated, user]);

  return { metrics, loading, error };
}
```

