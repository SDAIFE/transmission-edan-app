// Hook personnalisé pour les métriques des circonscriptions

import { useState, useEffect, useCallback } from 'react';
import { metricsService, type CirconscriptionMetrics, type ExtendedMetrics } from '@/lib/services/metrics.service';
import { useAuth } from '@/contexts/AuthContext';

// Interface pour l'état du hook
interface UseCirconscriptionMetricsState {
  metrics: ExtendedMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastFetch: Date | null;
}

// Options pour le hook
interface UseCirconscriptionMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
  enabled?: boolean;
}

/**
 * Hook personnalisé pour récupérer les métriques des circonscriptions
 * 
 * Caractéristiques :
 * - Vérification automatique de l'authentification et des permissions
 * - Gestion d'état complète (loading, error, data)
 * - Fonction de refetch manuelle
 * - Support du rafraîchissement automatique
 * - Intégration avec le contexte d'authentification
 * 
 * @param options Options de configuration du hook
 * @returns État et fonctions pour gérer les métriques
 */
export function useCirconscriptionMetrics(
  options: UseCirconscriptionMetricsOptions = {}
): UseCirconscriptionMetricsState {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 secondes par défaut
    enabled = true,
  } = options;

  // États locaux
  const [metrics, setMetrics] = useState<ExtendedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Contexte d'authentification
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  /**
   * Fonction de récupération des métriques
   */
  const fetchMetrics = useCallback(async () => {
    // Vérifications préalables
    if (!enabled || authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    // ✅ PERMISSIONS : Vérifier le rôle (SADMIN ou ADMIN uniquement)
    const userRole = user.role?.code || '';
    if (!['SADMIN', 'ADMIN'].includes(userRole)) {
      setError('Accès refusé. Rôle insuffisant (SADMIN ou ADMIN requis).');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [useCirconscriptionMetrics] Récupération des métriques...');
      }

      const data = await metricsService.getExtendedCirconscriptionMetrics();
      
      setMetrics(data);
      setLastFetch(new Date());

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [useCirconscriptionMetrics] Métriques récupérées:', data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération des métriques';
      setError(errorMessage);

      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useCirconscriptionMetrics] Erreur:', err);
      }

      // Gestion spécifique des erreurs
      if (err.message?.includes('401') || err.message?.includes('Session expirée')) {
        // L'intercepteur gère déjà la redirection
        console.log('Session expirée, redirection automatique');
      } else if (err.message?.includes('403')) {
        setError('Accès refusé. Permissions insuffisantes.');
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, authLoading, isAuthenticated, user]);

  /**
   * Fonction de refetch manuelle
   */
  const refetch = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Effet pour le chargement initial
   */
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Effet pour le rafraîchissement automatique
   */
  useEffect(() => {
    if (!autoRefresh || !enabled || loading || error) {
      return;
    }

    const interval = setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [useCirconscriptionMetrics] Rafraîchissement automatique...');
      }
      fetchMetrics();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, enabled, loading, error, refreshInterval, fetchMetrics]);

  /**
   * Nettoyage lors du démontage
   */
  useEffect(() => {
    return () => {
      // Nettoyage si nécessaire
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 [useCirconscriptionMetrics] Nettoyage du hook');
      }
    };
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch,
    lastFetch,
  };
}

/**
 * Hook simplifié pour une utilisation basique
 */
export function useCirconscriptionMetricsSimple() {
  return useCirconscriptionMetrics({
    enabled: true,
    autoRefresh: false,
  });
}

/**
 * Hook avec rafraîchissement automatique
 */
export function useCirconscriptionMetricsLive(refreshInterval = 30000) {
  return useCirconscriptionMetrics({
    enabled: true,
    autoRefresh: true,
    refreshInterval,
  });
}
