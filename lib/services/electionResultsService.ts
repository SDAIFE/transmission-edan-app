// services/electionResultsService.ts
import type { ElectionResults, ResultsFilters } from '@/types/results';
import { skeletonElectionResults } from '@/lib/mock-data/skeleton-results';
import { shouldUseMockData } from '@/lib/config/api';

export interface ElectionResultsQuery {
  level?: 'national' | 'regional' | 'departemental' | 'bureau';
  regionId?: string;
  departementId?: string;
  lieuVoteId?: string;
  search?: string;
  sortBy?: 'nom' | 'participation' | 'votes';
  sortOrder?: 'asc' | 'desc';
  view?: 'card' | 'table' | 'chart';
  includeStatistics?: boolean;
}

export interface ElectionResultsResponse {
  success: boolean;
  data: ElectionResults;
  message: string;
}

class ElectionResultsService {
  private getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    }
    
    return headers;
  }

  /**
   * Récupérer les résultats complets d'une élection
   */
  async getElectionResults(
    electionId: string, 
    query: ElectionResultsQuery = {},
    token?: string
  ): Promise<ElectionResultsResponse> {
    // Si le mode mock est activé, utiliser les données skeleton
    if (shouldUseMockData()) {
      console.log('🔧 Mode développement : utilisation des données skeleton');
      return {
        success: true,
        data: skeletonElectionResults,
        message: 'Données skeleton - En attente des résultats'
      };
    }

    try {
      // Construire les paramètres de requête
      const searchParams = new URLSearchParams();
      
      if (query.level) searchParams.append('level', query.level);
      if (query.regionId) searchParams.append('regionId', query.regionId);
      if (query.departementId) searchParams.append('departementId', query.departementId);
      if (query.lieuVoteId) searchParams.append('lieuVoteId', query.lieuVoteId);
      if (query.search) searchParams.append('search', query.search);
      if (query.sortBy) searchParams.append('sortBy', query.sortBy);
      if (query.sortOrder) searchParams.append('sortOrder', query.sortOrder);
      if (query.view) searchParams.append('view', query.view);
      
      // Toujours inclure les statistiques par défaut
      if (query.includeStatistics !== false) {
        searchParams.append('includeStatistics', 'true');
      }

      const queryString = searchParams.toString();
      const url = `/api/elections/${electionId}/results${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Messages conviviaux selon le type d'erreur
        let errorMessage = '';
        switch (response.status) {
          case 400:
            errorMessage = `Paramètres invalides: ${errorData.message || 'Vérifiez vos paramètres de requête'}`;
            break;
          case 401:
            errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
            break;
          case 403:
            errorMessage = 'Accès refusé. Permissions insuffisantes.';
            break;
          case 404:
            errorMessage = 'Les résultats électoraux ne sont pas encore disponibles. Veuillez réessayer plus tard.';
            break;
          case 500:
            errorMessage = 'Le serveur rencontre des difficultés temporaires. Veuillez réessayer dans quelques minutes.';
            break;
          default:
            errorMessage = errorData.message || `Une erreur est survenue (${response.status}). Veuillez réessayer.`;
        }
        
        throw new Error(errorMessage);
      }

      const result: ElectionResultsResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la récupération des données');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue. Veuillez réessayer.');
    }
  }

  /**
   * Récupérer un résumé des résultats (plus léger)
   */
  async getElectionResultsSummary(
    electionId: string, 
    token?: string
  ): Promise<ElectionResultsResponse> {
    // Si le mode mock est activé, utiliser les données skeleton
    if (shouldUseMockData()) {
      console.log('🔧 Mode développement : utilisation des données skeleton (summary)');
      return {
        success: true,
        data: skeletonElectionResults,
        message: 'Résumé skeleton - En attente des résultats'
      };
    }

    try {
      const url = `/api/elections/${electionId}/results/summary`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur lors de la récupération du résumé');
    }
  }

  /**
   * Récupérer uniquement la liste des candidats
   */
  async getElectionCandidates(
    electionId: string, 
    token?: string
  ): Promise<ElectionResultsResponse> {
    // Si le mode mock est activé, utiliser les données skeleton
    if (shouldUseMockData()) {
      console.log('🔧 Mode développement : utilisation des données skeleton (candidates)');
      return {
        success: true,
        data: skeletonElectionResults,
        message: 'Candidats skeleton - En attente des résultats'
      };
    }

    try {
      const url = `/api/elections/${electionId}/results/candidates`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur lors de la récupération des candidats');
    }
  }
}

export const electionResultsService = new ElectionResultsService();
