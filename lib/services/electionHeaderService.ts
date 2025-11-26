// Service simplifié pour les données du header
import type { ElectionResults } from '@/types/results';

export interface HeaderData {
  id: string;
  nom: string;
  date: string;
  type: string;
  tour: number;
  status: string;
  lastUpdate: string;
  
  // Données minimales pour le header
  inscrits: number;
  inscritsHommes: number;
  inscritsFemmes: number;
  votants: number;
  votantsHommes: number;
  votantsFemmes: number;
  tauxParticipation: number;
  suffrageExprime: number;
  
  // Liste des départements publiés
  departementsPublies: string[];
}

export interface HeaderResponse {
  success: boolean;
  data: HeaderData;
  message: string;
}

class ElectionHeaderService {
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
   * Récupérer uniquement les données nécessaires pour le header
   */
  async getHeaderData(electionId: string, token?: string): Promise<HeaderResponse> {
    try {
      const url = `/api/v1/elections/${electionId}/results/header`;
      
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

      const result: HeaderResponse = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [API Header] Résultat:', result);
      }
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
   * Données skeleton pour le développement
   */
  getSkeletonHeaderData(electionId: string): HeaderResponse {
    return {
      success: true,
      data: {
        id: electionId,
        nom: 'Élection Présidentielle 2025 - Premier Tour',
        date: '2025-10-25',
        type: 'presidential',
        tour: 1,
        status: 'preliminaires',
        lastUpdate: new Date().toISOString(),
        
        // Toutes les valeurs à zéro pour les squelettes
        inscrits: 0,
        inscritsHommes: 0,
        inscritsFemmes: 0,
        votants: 0,
        votantsHommes: 0,
        votantsFemmes: 0,
        tauxParticipation: 0,
        suffrageExprime: 0,
        
        departementsPublies: [
          'Département 1',
          'Département 2', 
          'Département 3',
          'Département 4',
          'Département 5'
        ]
      },
      message: 'Données skeleton - En attente des résultats'
    };
  }
}

export const electionHeaderService = new ElectionHeaderService();
