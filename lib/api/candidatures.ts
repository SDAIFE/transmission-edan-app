import { apiClient } from './interceptor';
import type {
  Candidature,
  CreateCandidatureDto,
  UpdateCandidatureDto,
  CandidatureFilters,
} from '@/types/candidatures';

/**
 * Client API pour les candidatures
 */
export const candidaturesApi = {
  /**
   * Récupère toutes les candidatures avec filtres optionnels
   */
  async getAll(filters?: CandidatureFilters): Promise<Candidature[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await apiClient.get<Candidature[]>(
      `/candidatures${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Récupère une candidature par ID
   */
  async getById(id: string): Promise<Candidature> {
    const response = await apiClient.get<Candidature>(`/candidatures/${id}`);
    return response.data;
  },

  /**
   * Récupère les candidatures d'une élection
   */
  async getByElection(electionId: string): Promise<Candidature[]> {
    const response = await apiClient.get<Candidature[]>(
      `/candidatures?electionId=${electionId}`
    );
    return response.data;
  },

  /**
   * Crée une nouvelle candidature
   */
  async create(data: CreateCandidatureDto): Promise<Candidature> {
    const response = await apiClient.post<Candidature>('/candidatures', data);
    return response.data;
  },

  /**
   * Met à jour une candidature
   */
  async update(id: string, data: UpdateCandidatureDto): Promise<Candidature> {
    const response = await apiClient.patch<Candidature>(`/candidatures/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une candidature
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/candidatures/${id}`);
  },

  /**
   * Met à jour les résultats d'une candidature (nombre de voix)
   */
  async updateVoix(id: string, nombreVoix: number): Promise<Candidature> {
    const response = await apiClient.patch<Candidature>(`/candidatures/${id}/voix`, {
      nombreVoix,
    });
    return response.data;
  },

  /**
   * Réordonne les candidatures d'une élection
   */
  async reorder(electionId: string, candidatureIds: string[]): Promise<Candidature[]> {
    const response = await apiClient.post<Candidature[]>(
      `/candidatures/reorder`,
      { electionId, candidatureIds }
    );
    return response.data;
  },
};

