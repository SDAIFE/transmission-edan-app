import { apiClient } from './interceptor';
import type {
  Circonscription,
  CreateCirconscriptionDto,
  UpdateCirconscriptionDto,
  CirconscriptionFilters,
} from '@/types/circonscriptions';

/**
 * Client API pour les circonscriptions
 */
export const circonscriptionsApi = {
  /**
   * Récupère toutes les circonscriptions avec filtres optionnels
   */
  async getAll(filters?: CirconscriptionFilters): Promise<Circonscription[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await apiClient.get<Circonscription[]>(
      `/circonscriptions${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Récupère une circonscription par ID
   */
  async getById(id: string): Promise<Circonscription> {
    const response = await apiClient.get<Circonscription>(`/circonscriptions/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle circonscription
   */
  async create(data: CreateCirconscriptionDto): Promise<Circonscription> {
    const response = await apiClient.post<Circonscription>('/circonscriptions', data);
    return response.data;
  },

  /**
   * Met à jour une circonscription
   */
  async update(id: string, data: UpdateCirconscriptionDto): Promise<Circonscription> {
    const response = await apiClient.patch<Circonscription>(`/circonscriptions/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une circonscription
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/circonscriptions/${id}`);
  },

  /**
   * Récupère les statistiques d'une circonscription
   */
  async getStats(id: string): Promise<{
    nombreElections: number;
    nombreCandidatures: number;
    nombreResultats: number;
  }> {
    const response = await apiClient.get(`/circonscriptions/${id}/stats`);
    return response.data;
  },
};

