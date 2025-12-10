// Re-export des instances Axios configurées avec intercepteurs
export { apiClient, uploadClient } from './interceptor';

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fonction utilitaire pour gérer les erreurs
export const handleApiError = (error: unknown): string => {
  const errorObj = error as { 
    response?: { 
      data?: { message?: string }; 
      status?: number;
      headers?: Record<string, string>;
    }; 
    code?: string 
  };
  
  // Message personnalisé du backend (prioritaire) - doit être vérifié en premier
  if (errorObj.response?.data?.message) {
    return errorObj.response.data.message;
  }
  
  // ✅ SÉCURITÉ : Gestion erreur 429 (Rate Limiting)
  if (errorObj.response?.status === 429) {
    const retryAfter = errorObj.response.headers?.['retry-after'] || '60';
    return `Trop de tentatives. Veuillez réessayer dans ${retryAfter} secondes.`;
  }
  
  // ✅ Gestion erreur 401 (Non authentifié) - seulement si pas de message du backend
  if (errorObj.response?.status === 401) {
    return 'Email ou mot de passe incorrect';
  }
  
  // ✅ Gestion erreur 403 (Non autorisé)
  if (errorObj.response?.status === 403) {
    return 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action';
  }
  
  // ✅ Gestion erreur 404 (Non trouvé)
  if (errorObj.response?.status === 404) {
    return 'Ressource non trouvée';
  }
  
  // ✅ SÉCURITÉ : Gestion erreur 503 (Service unavailable / Timeout)
  if (errorObj.response?.status === 503) {
    return 'Le service est temporairement indisponible. Veuillez réessayer.';
  }
  
  // ✅ Gestion erreurs serveur 500+
  if (errorObj.response?.status && errorObj.response.status >= 500) {
    return 'Erreur serveur, veuillez réessayer plus tard';
  }
  
  // ✅ Gestion timeout côté client
  if (errorObj.code === 'ECONNABORTED') {
    return 'La requête a expiré. Veuillez réessayer.';
  }
  
  // ✅ Gestion erreur réseau
  if (errorObj.code === 'NETWORK_ERROR' || errorObj.code === 'ERR_NETWORK') {
    return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
  }
  
  return 'Une erreur inattendue s\'est produite';
};

// Fonction utilitaire pour construire les paramètres de requête
export const buildQueryParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};
