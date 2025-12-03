import { apiClient } from './client';
import type {
  SupervisionDashboardResponse,
  SupervisionCirconscriptionResponse,
  SupervisionStatsResponse,
} from '@/types/legislatives-supervision';

/**
 * Service API pour la supervision des résultats législatifs
 * 
 * Base URL: /api/v1/legislatives/resultats/supervision
 * 
 * Permissions:
 * - Tableau de bord: SADMIN, ADMIN, MANAGER uniquement
 * - Détails circonscription: SADMIN, ADMIN, MANAGER, USER (USER: seulement ses circonscriptions assignées)
 * - Statistiques avancées: SADMIN, ADMIN, MANAGER uniquement
 */
export const legislativesSupervisionApi = {
  /**
   * Récupérer le tableau de bord de supervision
   * 
   * Permissions: SADMIN, ADMIN, MANAGER uniquement
   * 
   * @returns Tableau de bord avec statistiques globales, monitoring par région, alertes et indicateurs de performance
   */
  getDashboard: async (): Promise<SupervisionDashboardResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('📊 [LegislativesSupervisionAPI] Récupération du tableau de bord...');
      }

      const response = await apiClient.get<SupervisionDashboardResponse>(
        '/legislatives/resultats/supervision'
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesSupervisionAPI] Tableau de bord récupéré:', response.data);
      }

      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
      
      if (errorObj.response?.status === 401) {
        // Rediriger vers la page de connexion
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expirée, veuillez vous reconnecter');
      }

      if (errorObj.response?.status === 403) {
        throw new Error('Accès interdit. Rôle insuffisant (doit être SADMIN, ADMIN ou MANAGER).');
      }

      console.error(
        '❌ [LegislativesSupervisionAPI] Erreur lors de la récupération du tableau de bord:',
        error
      );
      throw error;
    }
  },

  /**
   * Récupérer les détails complets d'une circonscription pour la supervision
   * 
   * Permissions: SADMIN, ADMIN, MANAGER, USER (USER: seulement ses circonscriptions assignées)
   * 
   * @param codeCirconscription Code circonscription (COD_CE)
   * @returns Détails complets avec résultats, historique des publications et logs d'activité
   */
  getCirconscriptionDetails: async (
    codeCirconscription: string
  ): Promise<SupervisionCirconscriptionResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(
          '📊 [LegislativesSupervisionAPI] Récupération des détails pour:',
          codeCirconscription
        );
      }

      const response = await apiClient.get<SupervisionCirconscriptionResponse>(
        `/legislatives/resultats/supervision/circonscriptions/${codeCirconscription}`
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesSupervisionAPI] Détails récupérés:', response.data);
      }

      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
      
      if (errorObj.response?.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expirée, veuillez vous reconnecter');
      }

      if (errorObj.response?.status === 403) {
        throw new Error('Vous n\'avez pas accès à cette circonscription.');
      }

      if (errorObj.response?.status === 404) {
        throw new Error('Circonscription non trouvée.');
      }

      if (errorObj.response?.status === 400) {
        throw new Error('Format de code invalide.');
      }

      console.error(
        '❌ [LegislativesSupervisionAPI] Erreur lors de la récupération des détails:',
        error
      );
      throw error;
    }
  },

  /**
   * Récupérer les statistiques avancées pour la supervision
   * 
   * Permissions: SADMIN, ADMIN, MANAGER uniquement
   * 
   * @returns Statistiques avancées avec analyses comparatives, tendances, évolutions et rapports de performance
   */
  getStats: async (): Promise<SupervisionStatsResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('📊 [LegislativesSupervisionAPI] Récupération des statistiques avancées...');
      }

      const response = await apiClient.get<SupervisionStatsResponse>(
        '/legislatives/resultats/supervision/stats'
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesSupervisionAPI] Statistiques récupérées:', response.data);
      }

      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
      
      if (errorObj.response?.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expirée, veuillez vous reconnecter');
      }

      if (errorObj.response?.status === 403) {
        throw new Error('Accès interdit. Rôle insuffisant (doit être SADMIN, ADMIN ou MANAGER).');
      }

      console.error(
        '❌ [LegislativesSupervisionAPI] Erreur lors de la récupération des statistiques:',
        error
      );
      throw error;
    }
  },
};

