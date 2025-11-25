import { apiClient } from './interceptor';
import type {
  Election,
  CreateElectionDto,
  UpdateElectionDto,
  ElectionFilters,
} from '@/types/elections';

/**
 * Client API pour les élections
 */
export const electionsApi = {
  /**
   * Récupère toutes les élections avec filtres optionnels
   */
  async getAll(filters?: ElectionFilters): Promise<Election[]> {
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
    
    const response = await apiClient.get<Election[]>(
      `/elections${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Récupère une élection par ID
   */
  async getById(id: string): Promise<Election> {
    const response = await apiClient.get<Election>(`/elections/${id}`);
    return response.data;
  },

  /**
   * Récupère les élections d'une circonscription
   */
  async getByCirconscription(circonscriptionId: string): Promise<Election[]> {
    const response = await apiClient.get<Election[]>(
      `/elections?circonscriptionId=${circonscriptionId}`
    );
    return response.data;
  },

  /**
   * Crée une nouvelle élection
   */
  async create(data: CreateElectionDto): Promise<Election> {
    const response = await apiClient.post<Election>('/elections', data);
    return response.data;
  },

  /**
   * Met à jour une élection
   */
  async update(id: string, data: UpdateElectionDto): Promise<Election> {
    const response = await apiClient.patch<Election>(`/elections/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une élection
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/elections/${id}`);
  },

  /**
   * Change le statut d'une élection
   */
  async updateStatut(id: string, statut: Election['statut']): Promise<Election> {
    const response = await apiClient.patch<Election>(`/elections/${id}/statut`, { statut });
    return response.data;
  },
};

