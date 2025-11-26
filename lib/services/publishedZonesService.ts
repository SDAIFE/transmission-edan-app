/**
 * Service pour récupérer les zones géographiques avec résultats publiés
 * Endpoint: GET /api/v1/elections/{electionId}/results/published-zones
 */

export interface PollingStation {
  id: string;
  name: string;
}

export interface VotingPlace {
  id: string;
  name: string;
  pollingStations: PollingStation[];
}

export interface Department {
  id: string;
  name: string;
  votingPlaces: VotingPlace[];
}

export interface Region {
  id: string;
  name: string;
  departments: Department[];
}

export interface PublishedZonesData {
  electionId: string;
  electionName: string;
  regions: Region[];
}

export interface PublishedZonesResponse {
  success: boolean;
  data: PublishedZonesData;
  message: string;
  timestamp: string;
}

class PublishedZonesService {
  constructor() {
    // Plus besoin de baseUrl car on utilise le proxy Next.js
  }

  async getPublishedZones(electionId: string): Promise<PublishedZonesResponse> {
    try {
      // En développement
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 [PublishedZonesService] Appel API pour electionId:', electionId);
      }

      // Utiliser le proxy Next.js au lieu d'appeler directement le backend
      const response = await fetch(`/api/v1/elections/${electionId}/results/published-zones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Les cookies d'authentification sont automatiquement inclus
        credentials: 'include',
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 [PublishedZonesService] Réponse HTTP:', response.status, response.statusText);
      }

      // Gestion spécifique des erreurs d'authentification
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Session expirée. Veuillez vous reconnecter.';
        
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔐 [PublishedZonesService] Erreur d\'authentification:', errorMessage);
        }
        
        // Déclencher un événement personnalisé pour informer le contexte d'authentification
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-session-expired', {
            detail: { reason: 'token-expired', service: 'publishedZonesService' }
          }));
        }
        
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Erreur HTTP: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data: PublishedZonesResponse = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [PublishedZonesService] Données reçues:', data);
      }

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des zones publiées');
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [PublishedZonesService] Erreur lors de la récupération des zones publiées:', error);
      }
      throw error;
    }
  }
}

export const publishedZonesService = new PublishedZonesService();
