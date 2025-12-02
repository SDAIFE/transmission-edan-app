'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/lib/api/dashboard';
import type {
  UserDashboardStatsDto,
  AdminDashboardStatsDto,
  SadminDashboardStatsDto,
  DashboardFiltersDto
} from '@/types/dashboard';

interface UseDashboardMetricsReturn {
  // Données
  userMetrics: UserDashboardStatsDto | null;
  adminMetrics: AdminDashboardStatsDto | SadminDashboardStatsDto | null;

  // États
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  refreshMetrics: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook personnalisé pour gérer les métriques du dashboard
 * 
 * Comportement :
 * - USER : Récupère uniquement ses propres données
 * - ADMIN/SADMIN : Récupère toutes les données du système
 */
export function useDashboardMetrics(filters?: DashboardFiltersDto): UseDashboardMetricsReturn {
  const { user, isAuthenticated } = useAuth();
  const [userMetrics, setUserMetrics] = useState<UserDashboardStatsDto | null>(null);
  const [adminMetrics, setAdminMetrics] = useState<AdminDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Récupère les métriques selon le rôle de l'utilisateur
   */
  const fetchMetrics = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      setError(null);

      const userRole = user.role?.code;

      if (userRole === 'USER') {
        // Pour les utilisateurs USER : données restreintes
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [useDashboardMetrics] Récupération des métriques utilisateur...');
        }

        try {
          const metrics = await dashboardApi.getUserDashboardMetrics();
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 [useDashboardMetrics] Métriques utilisateur reçues:', metrics);
          }

          // ✅ CORRECTION : Normaliser les données pour s'assurer que toutes les propriétés sont définies
          const normalizedMetrics: UserDashboardStatsDto = {
            totalCels: metrics.totalCels ?? 0,
            celsAvecImport: metrics.celsAvecImport ?? 0,
            celsSansImport: metrics.celsSansImport ?? 0,
            tauxProgression: metrics.tauxProgression ?? 0,
            celsParStatut: metrics.celsParStatut ?? {
              pending: 0,
              imported: 0,
              error: 0,
              processing: 0
            },
            nombreErreurs: metrics.nombreErreurs ?? 0,
            alertes: metrics.alertes ?? {
              celsSansImport: 0,
              celsEnErreur: 0,
              celsEnAttente: 0
            },
            celsAssignees: metrics.celsAssignees ?? 0,
            celsAvecImportAssignees: metrics.celsAvecImportAssignees ?? 0,
            celsSansImportAssignees: metrics.celsSansImportAssignees ?? 0,
            tauxProgressionPersonnel: metrics.tauxProgressionPersonnel ?? 0
          };

          setUserMetrics(normalizedMetrics);
          setAdminMetrics(null);
        } catch (apiError: any) {
          console.warn('⚠️ [useDashboardMetrics] API non disponible, utilisation des données mockées');
          console.error('❌ [useDashboardMetrics] Erreur API:', apiError);

          // Données mockées temporaires pour USER
          const mockUserMetrics = {
            totalCels: 150,
            celsAvecImport: 120,
            celsSansImport: 30,
            tauxProgression: 80.0,
            celsParStatut: {
              pending: 25,
              imported: 120,
              error: 5,
              processing: 0
            },
            nombreErreurs: 5,
            alertes: {
              celsSansImport: 30,
              celsEnErreur: 5,
              celsEnAttente: 25
            },
            celsAssignees: 150,
            celsAvecImportAssignees: 120,
            celsSansImportAssignees: 30,
            tauxProgressionPersonnel: 80.0
          };

          setUserMetrics(mockUserMetrics);
          setAdminMetrics(null);
          setError('API non disponible - Données de démonstration');
        }

      } else if (userRole === 'ADMIN' || userRole === 'SADMIN') {
        // Pour les administrateurs : toutes les données
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [useDashboardMetrics] Récupération des métriques admin...');
        }

        try {
          const metrics = await dashboardApi.getAdminDashboardMetrics();
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 [useDashboardMetrics] Métriques admin reçues:', metrics);
          }
          setAdminMetrics(metrics);
          setUserMetrics(null);
        } catch (apiError: any) {
          console.warn('⚠️ [useDashboardMetrics] API non disponible, utilisation des données mockées');
          console.error('❌ [useDashboardMetrics] Erreur API:', apiError);

          // Données mockées temporaires pour ADMIN/SADMIN
          const mockAdminMetrics = userRole === 'SADMIN' ? {
            totalCels: 564,
            celsAvecImport: 0,
            celsSansImport: 564,
            tauxProgression: 0,
            celsParStatut: {
              pending: 0,
              imported: 0,
              error: 0,
              processing: 0
            },
            nombreErreurs: 0,
            alertes: {
              celsSansImport: 564,
              celsEnErreur: 0,
              celsEnAttente: 0
            },
            totalRegions: 39,
            totalDepartements: 114,
            totalUtilisateurs: 5,
            utilisateursParRole: [
              { role: "ADMIN", count: 2 },
              { role: "SADMIN", count: 2 },
              { role: "USER", count: 1 }
            ],
            importsParJour: [
              { date: "2024-01-15", nombreImports: 0, nombrePublications: 0 },
              { date: "2024-01-16", nombreImports: 0, nombrePublications: 0 },
              { date: "2024-01-17", nombreImports: 0, nombrePublications: 0 },
              { date: "2024-01-18", nombreImports: 0, nombrePublications: 0 },
              { date: "2024-01-19", nombreImports: 0, nombrePublications: 0 },
              { date: "2024-01-20", nombreImports: 0, nombrePublications: 0 },
              { date: "2024-01-21", nombreImports: 0, nombrePublications: 0 }
            ]
          } : {
            totalCels: 500,
            celsAvecImport: 400,
            celsSansImport: 100,
            tauxProgression: 80.0,
            celsParStatut: {
              pending: 50,
              imported: 400,
              error: 20,
              processing: 5
            },
            nombreErreurs: 20,
            alertes: {
              celsSansImport: 100,
              celsEnErreur: 20,
              celsEnAttente: 50
            }
          };

          setAdminMetrics(mockAdminMetrics);
          setUserMetrics(null);
          setError('API non disponible - Données de démonstration');
        }
      }

      setLastUpdated(new Date());
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [useDashboardMetrics] Métriques récupérées avec succès');
      }

    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useDashboardMetrics] Erreur générale:', error);
      }
      setError(error.message || 'Erreur lors de la récupération des métriques');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, filters]);

  /**
   * Rafraîchit les métriques
   */
  const refreshMetrics = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      setError(null);

      const userRole = user.role?.code;

      if (userRole === 'ADMIN' || userRole === 'SADMIN') {
        // Seuls les admins peuvent forcer le rafraîchissement
        await dashboardApi.refreshMetrics();
      }

      // Récupérer les nouvelles métriques
      await fetchMetrics();

    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useDashboardMetrics] Erreur de rafraîchissement:', error);
      }
      setError(error.message || 'Erreur lors du rafraîchissement des métriques');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchMetrics]);

  /**
   * Efface les erreurs
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Récupération initiale des métriques
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMetrics();
    }
  }, [fetchMetrics]);

  /**
   * Rafraîchissement automatique toutes les 10 minutes (optimisé)
   * Réduit pour éviter les appels API excessifs et les rafraîchissements de page
   */
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [useDashboardMetrics] Rafraîchissement automatique des métriques...');
      }
      fetchMetrics();
    }, 10 * 60 * 1000); // 10 minutes (augmenté de 5 à 10 minutes)

    return () => clearInterval(interval);
  }, [fetchMetrics, isAuthenticated, user]);

  return {
    userMetrics,
    adminMetrics,
    loading,
    error,
    lastUpdated,
    refreshMetrics,
    clearError,
  };
}
