import type { CandidatesDetailedResponse } from '@/types/results';

class CandidatesDetailedService {
  constructor() {
    // Plus besoin de baseUrl car on utilise le proxy Next.js
  }

  async getCandidatesDetailed(electionId: string): Promise<CandidatesDetailedResponse> {
    try {
        //en developpement
        if (process.env.NODE_ENV === 'development') {
          console.log('🌐 [Service] Appel API pour electionId:', electionId);
        }
      
      // Utiliser le proxy Next.js au lieu d'appeler directement le backend
      const response = await fetch(`/api/v1/elections/${electionId}/results/candidates-detailed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Les cookies d'authentification sont automatiquement inclus
        credentials: 'include',
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 [Service] Réponse HTTP:', response.status, response.statusText);
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: CandidatesDetailedResponse = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [Service] Données reçues:', data);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des données');
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [Service] Erreur lors de la récupération des candidats détaillés:', error);
      }
      throw error;
    }
  }
}

export const candidatesDetailedService = new CandidatesDetailedService();
