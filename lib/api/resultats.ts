import { apiClient } from './interceptor';
import type {
  ResultatElection,
  CreateResultatDto,
  UpdateResultatDto,
  ResultatFilters,
} from '@/types/resultats';

/**
 * Client API pour les résultats
 */
export const resultatsApi = {
  /**
   * Récupère tous les résultats avec filtres optionnels
   */
  async getAll(filters?: ResultatFilters): Promise<ResultatElection[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    const response = await apiClient.get<ResultatElection[]>(
      `/resultats${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Récupère un résultat par ID
   */
  async getById(id: string): Promise<ResultatElection> {
    const response = await apiClient.get<ResultatElection>(`/resultats/${id}`);
    return response.data;
  },

  /**
   * Récupère le résultat d'une élection
   */
  async getByElection(electionId: string): Promise<ResultatElection | null> {
    try {
      const response = await apiClient.get<ResultatElection>(
        `/resultats?electionId=${electionId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Crée un nouveau résultat
   */
  async create(data: CreateResultatDto): Promise<ResultatElection> {
    const response = await apiClient.post<ResultatElection>('/resultats', data);
    return response.data;
  },

  /**
   * Met à jour un résultat
   */
  async update(id: string, data: UpdateResultatDto): Promise<ResultatElection> {
    const response = await apiClient.patch<ResultatElection>(`/resultats/${id}`, data);
    return response.data;
  },

  /**
   * Supprime un résultat
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/resultats/${id}`);
  },

  /**
   * Publie un résultat
   */
  async publish(id: string): Promise<ResultatElection> {
    const response = await apiClient.post<ResultatElection>(`/resultats/${id}/publish`);
    return response.data;
  },

  /**
   * Dépublie un résultat
   */
  async unpublish(id: string): Promise<ResultatElection> {
    const response = await apiClient.post<ResultatElection>(`/resultats/${id}/unpublish`);
    return response.data;
  },

  /**
   * Calcule automatiquement les pourcentages et les élus
   */
  async calculate(id: string): Promise<ResultatElection> {
    const response = await apiClient.post<ResultatElection>(`/resultats/${id}/calculate`);
    return response.data;
  },
};

