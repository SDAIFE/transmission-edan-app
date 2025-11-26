import { apiClient, handleApiError, buildQueryParams } from './client';
import type { 
  CelListResponseDto, 
  CelResponseDto, 
  CelStatsDto,
  DashboardCelListResponseDto,
  DashboardCelFilterDto 
} from '@/types/cels';

// Service API pour les CELs
export const celsApi = {
  // Liste des CELs avec filtres
  getCels: async (filters?: DashboardCelFilterDto): Promise<CelListResponseDto> => {
    try {
      const queryString = filters ? `?${buildQueryParams(filters as Record<string, unknown>)}` : '';
      const response = await apiClient.get(`/cels${queryString}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Détails d'une CEL par code
  getCelByCode: async (codeCellule: string): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/${codeCellule}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mise à jour d'une CEL
  updateCel: async (codeCellule: string, updates: Partial<CelResponseDto>): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.patch(`/cels/${codeCellule}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Assigner un utilisateur à une CEL
  assignUser: async (codeCellule: string, userId: string): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.patch(`/cels/${codeCellule}/assign-user`, { userId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Désassigner un utilisateur d'une CEL
  unassignUser: async (codeCellule: string): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.patch(`/cels/${codeCellule}/unassign-user`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Statistiques des CELs
  getStats: async (): Promise<CelStatsDto> => {
    try {
      const response = await apiClient.get('/cels/stats/overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs par département
  getCelsByDepartement: async (codeDepartement: string): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/departement/${codeDepartement}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs par région
  getCelsByRegion: async (codeRegion: string): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/region/${codeRegion}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs non assignées
  getUnassignedCels: async (): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get('/cels/unassigned/list');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs par type
  getCelsByType: async (typeCellule: string): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/type/${typeCellule}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Dashboard CELs avec filtres avancés
  getDashboardCels: async (filters?: DashboardCelFilterDto): Promise<DashboardCelListResponseDto> => {
    try {
      const queryString = filters ? `?${buildQueryParams(filters as Record<string, unknown>)}` : '';
      const response = await apiClient.get(`/dashboard/cels${queryString}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
