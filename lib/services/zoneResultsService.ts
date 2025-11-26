/**
 * Service pour récupérer les résultats électoraux par zone géographique
 * Endpoint: GET /api/v1/elections/{electionId}/results/by-zone
 */

export interface ZoneResultsStatistics {
  totalInscrits: number;
  totalVotants: number;
  tauxParticipation: number;
  totalExprimes: number;
  totalBlancs: number;
  totalNuls: number;
  nombreBureaux: number;
  nombreLieuxVote: number;
  nombreDepartements: number;
}

export interface ZoneResult {
  candidateId: string;
  candidateName: string;
  candidateNumber: number;
  partyName: string;
  partyColor: string;
  votes: number;
  percentage: number;
  rank: number;
  isWinner: boolean;
  isTied: boolean;
}

export interface ZoneInfo {
  type: 'region' | 'department' | 'votingPlace' | 'pollingStation';
  id: string;
  name: string;
  parentZone?: {
    type: string;
    name: string;
  };
}

export interface ZoneResultsData {
  electionId: string;
  electionName: string;
  zoneInfo: ZoneInfo;
  statistics: ZoneResultsStatistics;
  results: ZoneResult[];
  summary: {
    winner: ZoneResult | null;
    secondPlace: ZoneResult | null;
    totalCandidates: number;
    participationRate: number;
  };
}

export interface ZoneResultsResponse {
  success: boolean;
  data: ZoneResultsData;
  message: string;
  timestamp: string;
}

export interface ZoneResultsParams {
  regionId?: string;
  departmentId?: string;
  votingPlaceId?: string;
  pollingStationId?: string;
}

class ZoneResultsService {
  constructor() {
    // Plus besoin de baseUrl car on utilise le proxy Next.js
  }

  async getZoneResults(
    electionId: string, 
    params: ZoneResultsParams
  ): Promise<ZoneResultsResponse> {
    try {
      // En développement
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 [ZoneResultsService] Appel API pour electionId:', electionId, 'params:', params);
        console.log('🔍 [ZoneResultsService] Paramètres détaillés:', {
          regionId: params.regionId,
          departmentId: params.departmentId,
          votingPlaceId: params.votingPlaceId,
          pollingStationId: params.pollingStationId
        });
      }

      // Construire les paramètres de requête
      const queryParams = new URLSearchParams();
      if (params.regionId) queryParams.append('regionId', params.regionId);
      if (params.departmentId) queryParams.append('departmentId', params.departmentId);
      if (params.votingPlaceId) queryParams.append('votingPlaceId', params.votingPlaceId);
      if (params.pollingStationId) queryParams.append('pollingStationId', params.pollingStationId);

      const queryString = queryParams.toString();
      const url = `/api/v1/elections/${electionId}/results/by-zone${queryString ? `?${queryString}` : ''}`;

      // Utiliser le proxy Next.js au lieu d'appeler directement le backend
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Les cookies d'authentification sont automatiquement inclus
        credentials: 'include',
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 [ZoneResultsService] Réponse HTTP:', response.status, response.statusText);
      }

      // Gestion spécifique des erreurs d'authentification
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Session expirée. Veuillez vous reconnecter.';
        
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔐 [ZoneResultsService] Erreur d\'authentification:', errorMessage);
        }
        
        // Déclencher un événement personnalisé pour informer le contexte d'authentification
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-session-expired', {
            detail: { reason: 'token-expired', service: 'zoneResultsService' }
          }));
        }
        
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Erreur HTTP: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data: ZoneResultsResponse = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [ZoneResultsService] Données reçues:', data);
      }

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des résultats par zone');
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [ZoneResultsService] Erreur lors de la récupération des résultats par zone:', error);
      }
      throw error;
    }
  }
}

export const zoneResultsService = new ZoneResultsService();
