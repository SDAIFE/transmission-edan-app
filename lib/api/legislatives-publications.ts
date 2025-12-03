import { apiClient } from './client';
import type {
  LegislativePublicationStats,
  CirconscriptionQuery,
  CirconscriptionListResponse,
  PublicationActionResult,
  CirconscriptionDetails,
  CirconscriptionDataResponse,
  NationalDataResponse,
} from '@/types/legislatives-publications';

/**
 * Service API pour les publications des résultats législatives
 * 
 * Base URL: /api/v1/legislatives/publications
 */
export const legislativesPublicationsApi = {
  /**
   * Récupérer les statistiques globales des circonscriptions et CELs
   * 
   * Permissions: SADMIN, ADMIN, USER (données filtrées pour USER)
   * 
   * @returns Statistiques globales
   */
  getStats: async (): Promise<LegislativePublicationStats | null> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('📊 [LegislativesPublicationsAPI] Récupération des statistiques...');
      }

      const response = await apiClient.get<LegislativePublicationStats>(
        '/legislatives/publications/stats'
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesPublicationsAPI] Statistiques récupérées:', response.data);
      }

      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403) {
        console.warn(
          '⚠️ [LegislativesPublicationsAPI] Permissions insuffisantes pour accéder aux statistiques'
        );
        return null;
      }
      console.error(
        '❌ [LegislativesPublicationsAPI] Erreur lors de la récupération des statistiques:',
        error
      );
      throw error;
    }
  },

  /**
   * Récupérer la liste paginée des circonscriptions avec leurs métriques
   * 
   * Permissions: SADMIN, ADMIN, USER (circonscriptions assignées)
   * 
   * @param query Paramètres de requête (pagination, filtres)
   * @returns Liste des circonscriptions avec pagination
   */
  getCirconscriptions: async (
    query?: CirconscriptionQuery
  ): Promise<CirconscriptionListResponse | null> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('📋 [LegislativesPublicationsAPI] Récupération des circonscriptions:', query);
      }

      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.statPub) params.append('statPub', query.statPub);
      if (query?.search) params.append('search', query.search);

      const queryString = params.toString();
      const url = queryString
        ? `/legislatives/publications/circonscriptions?${queryString}`
        : '/legislatives/publications/circonscriptions';

      const response = await apiClient.get<CirconscriptionListResponse>(url);

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesPublicationsAPI] Circonscriptions récupérées:', {
          count: response.data.circonscriptions.length,
          total: response.data.total,
          page: response.data.page,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403) {
        console.warn(
          '⚠️ [LegislativesPublicationsAPI] Permissions insuffisantes pour accéder aux circonscriptions'
        );
        return null;
      }
      console.error(
        '❌ [LegislativesPublicationsAPI] Erreur lors de la récupération des circonscriptions:',
        error
      );
      throw error;
    }
  },

  /**
   * Publier une circonscription après validation que toutes les CELs sont importées
   * 
   * Permissions: SADMIN, ADMIN uniquement
   * 
   * @param codeCirconscription Code de la circonscription (COD_CE, ex: "004")
   * @returns Résultat de la publication
   */
  publishCirconscription: async (
    codeCirconscription: string
  ): Promise<PublicationActionResult> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(
          '📢 [LegislativesPublicationsAPI] Publication de la circonscription:',
          codeCirconscription
        );
      }

      const response = await apiClient.post<PublicationActionResult>(
        `/legislatives/publications/circonscriptions/${codeCirconscription}/publish`,
        {}
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesPublicationsAPI] Publication réussie:', response.data);
      }

      return response.data;
    } catch (error: any) {
      console.error(
        '❌ [LegislativesPublicationsAPI] Erreur lors de la publication:',
        error
      );

      // Gestion des erreurs spécifiques
      if (error?.response?.status === 400) {
        const errorMessage =
          error.response.data?.message ||
          'Impossible de publier la circonscription. Vérifiez que toutes les CELs sont importées.';
        throw new Error(errorMessage);
      }

      if (error?.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour publier une circonscription.');
      }

      if (error?.response?.status === 404) {
        throw new Error('Circonscription non trouvée.');
      }

      throw error;
    }
  },

  /**
   * Annuler la publication d'une circonscription
   * 
   * Permissions: SADMIN, ADMIN uniquement
   * 
   * @param codeCirconscription Code de la circonscription (COD_CE, ex: "004")
   * @returns Résultat de l'annulation
   */
  cancelPublication: async (
    codeCirconscription: string
  ): Promise<PublicationActionResult> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(
          '❌ [LegislativesPublicationsAPI] Annulation de la publication:',
          codeCirconscription
        );
      }

      const response = await apiClient.post<PublicationActionResult>(
        `/legislatives/publications/circonscriptions/${codeCirconscription}/cancel`,
        {}
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesPublicationsAPI] Annulation réussie:', response.data);
      }

      return response.data;
    } catch (error: any) {
      console.error(
        '❌ [LegislativesPublicationsAPI] Erreur lors de l\'annulation:',
        error
      );

      if (error?.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour annuler une publication.');
      }

      if (error?.response?.status === 404) {
        throw new Error('Circonscription non trouvée.');
      }

      throw error;
    }
  },

  /**
   * Récupérer les détails complets d'une circonscription
   * Inclut la liste des CELs et l'historique de publication
   * 
   * Permissions: SADMIN, ADMIN, USER (circonscriptions assignées)
   * 
   * @param codeCirconscription Code de la circonscription (COD_CE, ex: "004")
   * @returns Détails de la circonscription
   */
  getCirconscriptionDetails: async (
    codeCirconscription: string
  ): Promise<CirconscriptionDetails> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(
          '🔍 [LegislativesPublicationsAPI] Récupération des détails:',
          codeCirconscription
        );
      }

      const response = await apiClient.get<CirconscriptionDetails>(
        `/legislatives/publications/circonscriptions/${codeCirconscription}/details`
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesPublicationsAPI] Détails récupérés:', {
          code: response.data.codeCirconscription,
          cels: response.data.cels.length,
          history: response.data.history.length,
        });
      }

      return response.data;
    } catch (error: any) {
      console.error(
        '❌ [LegislativesPublicationsAPI] Erreur lors de la récupération des détails:',
        error
      );

      if (error?.response?.status === 403) {
        throw new Error('Vous n\'avez pas accès à cette circonscription.');
      }

      if (error?.response?.status === 404) {
        throw new Error('Circonscription non trouvée.');
      }

      throw error;
    }
  },

  /**
   * Récupérer les données agrégées d'une circonscription avec les scores des candidats
   * et les métriques par CEL
   * 
   * ⚠️ IMPORTANT : Cet endpoint est crucial pour les utilisateurs USER
   * qui doivent voir les données consolidées par CELs
   * 
   * Permissions: SADMIN, ADMIN, USER (circonscriptions assignées)
   * 
   * @param codeCirconscription Code de la circonscription (COD_CE, ex: "004")
   * @returns Données agrégées avec scores des candidats et données par CEL
   */
  getCirconscriptionData: async (
    codeCirconscription: string
  ): Promise<CirconscriptionDataResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(
          '📊 [LegislativesPublicationsAPI] Récupération des données agrégées:',
          codeCirconscription
        );
      }

      const response = await apiClient.get<CirconscriptionDataResponse>(
        `/legislatives/publications/circonscriptions/${codeCirconscription}/data`
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesPublicationsAPI] Données agrégées récupérées:', {
          code: response.data.codeCirconscription,
          candidats: response.data.candidats.length,
          cels: response.data.cels.length,
        });
      }

      return response.data;
    } catch (error: any) {
      console.error(
        '❌ [LegislativesPublicationsAPI] Erreur lors de la récupération des données agrégées:',
        error
      );

      if (error?.response?.status === 403) {
        throw new Error('Vous n\'avez pas accès à cette circonscription.');
      }

      if (error?.response?.status === 404) {
        throw new Error('Circonscription non trouvée.');
      }

      throw error;
    }
  },

  /**
   * Récupérer les données agrégées au niveau national
   * 
   * Permissions: SADMIN, ADMIN uniquement
   * 
   * @returns Données nationales avec statistiques et scores des candidats
   */
  getNationalData: async (): Promise<NationalDataResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('🌍 [LegislativesPublicationsAPI] Récupération des données nationales...');
      }

      const response = await apiClient.get<NationalDataResponse>(
        '/legislatives/publications/national/data'
      );

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ [LegislativesPublicationsAPI] Données nationales récupérées:', {
          candidats: response.data.candidats.length,
          circonscriptions: response.data.circonscriptions.length,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403) {
        throw new Error(
          'Accès interdit. Seuls les administrateurs peuvent accéder aux données nationales.'
        );
      }
      console.error(
        '❌ [LegislativesPublicationsAPI] Erreur lors de la récupération des données nationales:',
        error
      );
      throw error;
    }
  },
};

