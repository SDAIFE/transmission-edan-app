import { apiClient } from './client';

// Type pour les erreurs Axios
type AxiosError = {
  response?: {
    status?: number;
    data?: unknown;
  };
};

// Types pour les listes simples
export interface SimpleDepartement {
  codeDepartement: string;
  libelleDepartement: string;
}

export interface SimpleRegion {
  codeRegion: string;
  libelleRegion: string;
}

export interface SimpleCel {
  codeCellule: string;
  libelleCellule: string;
}

export interface SimpleCirconscription {
  codCe: string;
  libCe: string;
}

// Service API pour les listes de formulaires
export const listsApi = {
  // Récupérer la liste simple des départements
  // ⚠️ NOTE : Le backend utilise /circonscriptions/list/simple pour les départements
  // Les données sont transformées pour correspondre au format SimpleDepartement
  getDepartementsList: async (): Promise<SimpleDepartement[]> => {
    try {
      const response = await apiClient.get<SimpleCirconscription[]>('/circonscriptions/list/simple');
      // Transformer les données de circonscriptions en format départements
      // codCe → codeDepartement, libCe → libelleDepartement
      return response.data.map((circ) => ({
        codeDepartement: circ.codCe,
        libelleDepartement: circ.libCe,
      }));
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      // Si l'endpoint n'existe pas encore (404), retourner un tableau vide au lieu de throw
      if (axiosError.response?.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [ListsAPI] Endpoint /circonscriptions/list/simple non disponible (404). Fonctionnalité désactivée temporairement.');
        }
        return [];
      }
      console.error('❌ [ListsAPI] Erreur lors de la récupération des départements:', error);
      throw error;
    }
  },

  // Récupérer la liste simple des CELs (conforme au guide API)
  getCelsList: async (): Promise<SimpleCel[]> => {
    try {
      const response = await apiClient.get('/cels/list/simple');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      // Si l'endpoint n'existe pas encore (404), retourner un tableau vide au lieu de throw
      if (axiosError.response?.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [ListsAPI] Endpoint /cels/list/simple non disponible (404). Fonctionnalité désactivée temporairement.');
        }
        return [];
      }
      console.error('❌ [ListsAPI] Erreur lors de la récupération des CELs:', error);
      throw error;
    }
  },

  // ✨ NOUVEAU : Récupérer la liste simple des régions
  getRegionsList: async (): Promise<SimpleRegion[]> => {
    try {
      const response = await apiClient.get('/regions/list/simple');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      // Si l'endpoint n'existe pas encore (404), retourner un tableau vide au lieu de throw
      if (axiosError.response?.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [ListsAPI] Endpoint /regions/list/simple non disponible (404). Fonctionnalité désactivée temporairement.');
        }
        return [];
      }
      console.error('❌ [ListsAPI] Erreur lors de la récupération des régions:', error);
      throw error;
    }
  },

  // ✨ NOUVEAU : Récupérer la liste simple des circonscriptions
  getCirconscriptionsList: async (): Promise<SimpleCirconscription[]> => {
    try {
      const response = await apiClient.get('/circonscriptions/list/simple');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      // Si l'endpoint n'existe pas encore (404), retourner un tableau vide au lieu de throw
      if (axiosError.response?.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [ListsAPI] Endpoint /circonscriptions/list/simple non disponible (404). Fonctionnalité désactivée temporairement.');
        }
        return [];
      }
      console.error('❌ [ListsAPI] Erreur lors de la récupération des circonscriptions:', error);
      throw error;
    }
  },

  // Récupérer toutes les listes en parallèle
  getFormLists: async (): Promise<{
    departements: SimpleDepartement[];
    regions: SimpleRegion[];
    cels: SimpleCel[];
    circonscriptions: SimpleCirconscription[];
  }> => {
    try {

      // Utiliser Promise.allSettled pour gérer les erreurs individuellement
      const [departementsResult, regionsResult, celsResult, circonscriptionsResult] = await Promise.allSettled([
        listsApi.getDepartementsList(),
        listsApi.getRegionsList(),
        listsApi.getCelsList(),
        listsApi.getCirconscriptionsList()
      ]);

      // Extraire les données ou utiliser des tableaux vides en cas d'erreur
      const departements = departementsResult.status === 'fulfilled' ? departementsResult.value : [];
      const regions = regionsResult.status === 'fulfilled' ? regionsResult.value : [];
      const cels = celsResult.status === 'fulfilled' ? celsResult.value : [];
      const circonscriptions = circonscriptionsResult.status === 'fulfilled' ? circonscriptionsResult.value : [];

      // Logger les erreurs éventuelles
      if (departementsResult.status === 'rejected') {
        console.error('❌ [ListsAPI] Échec chargement départements:', departementsResult.reason);
      }
      if (regionsResult.status === 'rejected') {
        console.warn('⚠️ [ListsAPI] Échec chargement régions:', regionsResult.reason);
      }
      if (celsResult.status === 'rejected') {
        console.error('❌ [ListsAPI] Échec chargement CELs:', celsResult.reason);
      }
      if (circonscriptionsResult.status === 'rejected') {
        console.error('❌ [ListsAPI] Échec chargement circonscriptions:', circonscriptionsResult.reason);
      }

      return { departements, regions, cels, circonscriptions };
    } catch (error: unknown) {
      console.error('❌ [ListsAPI] Erreur générale lors de la récupération des listes:', error);
      // Retourner des tableaux vides plutôt que de throw pour ne pas bloquer l'application
      return { departements: [], regions: [], cels: [], circonscriptions: [] };
    }
  },
};
