import { apiClient, handleApiError, buildQueryParams } from './client';
import type { 
  DepartementListResponseDto, 
  DepartementResponseDto, 
  DepartementStatsDto 
} from '@/types/departements';

// Service API pour les départements
export const departementsApi = {
  // Liste des départements avec filtres
  getDepartements: async (filters?: Record<string, unknown>): Promise<DepartementListResponseDto> => {
    try {
      const queryString = filters ? `?${buildQueryParams(filters)}` : '';
      const response = await apiClient.get(`/departements${queryString}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Détails d'un département par code
  getDepartementByCode: async (codeDepartement: string): Promise<DepartementResponseDto> => {
    try {
      const response = await apiClient.get(`/departements/${codeDepartement}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mise à jour d'un département
  updateDepartement: async (codeDepartement: string, updates: Partial<DepartementResponseDto>): Promise<DepartementResponseDto> => {
    try {
      const response = await apiClient.patch(`/departements/${codeDepartement}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Assigner un utilisateur à un département
  assignUser: async (codeDepartement: string, userId: string): Promise<DepartementResponseDto> => {
    try {
      const response = await apiClient.patch(`/departements/${codeDepartement}/assign-user`, { userId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Désassigner un utilisateur d'un département
  unassignUser: async (codeDepartement: string): Promise<DepartementResponseDto> => {
    try {
      const response = await apiClient.patch(`/departements/${codeDepartement}/unassign-user`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Statistiques des départements
  getStats: async (): Promise<DepartementStatsDto> => {
    try {
      const response = await apiClient.get('/departements/stats/overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Départements par région
  getDepartementsByRegion: async (codeRegion: string): Promise<DepartementListResponseDto> => {
    try {
      const response = await apiClient.get(`/departements/region/${codeRegion}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
