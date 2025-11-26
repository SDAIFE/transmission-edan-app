import { apiClient } from './client';

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

// Service API pour les listes de formulaires
export const listsApi = {
  // Récupérer la liste simple des départements (conforme au guide API)
  getDepartementsList: async (): Promise<SimpleDepartement[]> => {
    try {
      const response = await apiClient.get('/departements/list/simple');
      return response.data;
    } catch (error: unknown) {
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
      console.error('❌ [ListsAPI] Erreur lors de la récupération des CELs:', error);
      throw error;
    }
  },

  // ✨ NOUVEAU : Récupérer la liste simple des régions
  getRegionsList: async (): Promise<SimpleRegion[]> => {
    try {
      const response = await apiClient.get('/regions/list/simple');
      return response.data;
    } catch (error: any) {
      // Si l'endpoint n'existe pas encore (404), retourner un tableau vide au lieu de throw
      if (error.response?.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [ListsAPI] Endpoint /regions/list/simple non disponible (404). Fonctionnalité désactivée temporairement.');
        }
        return [];
      }
      console.error('❌ [ListsAPI] Erreur lors de la récupération des régions:', error);
      throw error;
    }
  },

  // Récupérer toutes les listes en parallèle
  getFormLists: async (): Promise<{
    departements: SimpleDepartement[];
    regions: SimpleRegion[];
    cels: SimpleCel[];
  }> => {
    try {
      
      // Utiliser Promise.allSettled pour gérer les erreurs individuellement
      const [departementsResult, regionsResult, celsResult] = await Promise.allSettled([
        listsApi.getDepartementsList(),
        listsApi.getRegionsList(),
        listsApi.getCelsList()
      ]);

      // Extraire les données ou utiliser des tableaux vides en cas d'erreur
      const departements = departementsResult.status === 'fulfilled' ? departementsResult.value : [];
      const regions = regionsResult.status === 'fulfilled' ? regionsResult.value : [];
      const cels = celsResult.status === 'fulfilled' ? celsResult.value : [];

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
      
      return { departements, regions, cels };
    } catch (error: unknown) {
      console.error('❌ [ListsAPI] Erreur générale lors de la récupération des listes:', error);
      // Retourner des tableaux vides plutôt que de throw pour ne pas bloquer l'application
      return { departements: [], regions: [], cels: [] };
    }
  },
};
