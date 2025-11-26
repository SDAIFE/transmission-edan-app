// Configuration pour l'API
export const config = {
  // URL de base de l'API NEXT_PUBLIC_API_URL
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  
  // Timeout pour les requêtes API
  apiTimeout: 10000,
  
  // Cache TTL en millisecondes
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  
  // Mode développement - désactivé pour utiliser les données du backend
  useMockData: false,
};

// Export de l'URL API pour compatibilité
export const API_URL = config.apiBaseUrl;

// Fonction utilitaire pour vérifier si on doit utiliser les données mock
export const shouldUseMockData = (): boolean => {
  // Utiliser la configuration définie dans config.useMockData
  return config.useMockData;
};
