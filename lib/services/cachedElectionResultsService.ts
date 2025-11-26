// services/cachedElectionResultsService.ts
import { electionResultsService, ElectionResultsQuery, ElectionResultsResponse } from './electionResultsService';
import { LocalCache } from '@/lib/utils/cache';

export class CachedElectionResultsService {
  async getElectionResults(
    electionId: string, 
    query: ElectionResultsQuery = {},
    token?: string
  ): Promise<ElectionResultsResponse> {
    const cacheKey = `${electionId}_${JSON.stringify(query)}`;
    
    // Vérifier le cache local
    const cachedData = LocalCache.get(cacheKey);
    if (cachedData) {
      console.log('📦 Données récupérées depuis le cache');
      return cachedData;
    }

    // Récupérer depuis l'API
    console.log('🌐 Récupération des données depuis l\'API');
    const data = await electionResultsService.getElectionResults(electionId, query, token);
    
    // Mettre en cache
    LocalCache.set(cacheKey, data);
    
    return data;
  }

  async getElectionResultsSummary(
    electionId: string, 
    token?: string
  ): Promise<ElectionResultsResponse> {
    const cacheKey = `${electionId}_summary`;
    
    const cachedData = LocalCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await electionResultsService.getElectionResultsSummary(electionId, token);
    LocalCache.set(cacheKey, data);
    
    return data;
  }

  async getElectionCandidates(
    electionId: string, 
    token?: string
  ): Promise<ElectionResultsResponse> {
    const cacheKey = `${electionId}_candidates`;
    
    const cachedData = LocalCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await electionResultsService.getElectionCandidates(electionId, token);
    LocalCache.set(cacheKey, data);
    
    return data;
  }

  // Méthode pour vider le cache si nécessaire
  clearCache(): void {
    LocalCache.clear();
  }

  // Méthode pour nettoyer le cache expiré
  clearExpiredCache(): void {
    LocalCache.clearExpired();
  }
}

export const cachedElectionResultsService = new CachedElectionResultsService();
