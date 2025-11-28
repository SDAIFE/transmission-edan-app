// Service de métriques - Gestion des appels API pour les statistiques

import { apiClient, handleApiError } from '@/lib/api/client';

// Types pour les métriques des circonscriptions
export interface CirconscriptionMetrics {
  total: number;
  published: number;
  remaining: number;
}

// Interface pour les métriques étendues (futures extensions)
export interface ExtendedMetrics extends CirconscriptionMetrics {
  publishedPercentage: number;
  lastUpdate?: Date;
}

/**
 * Service de métriques centralisé
 * 
 * Caractéristiques :
 * - Utilise apiClient avec authentification automatique (cookies httpOnly)
 * - Gestion d'erreurs centralisée avec handleApiError
 * - Types TypeScript stricts pour la sécurité
 * - Extensible pour d'autres types de métriques
 */
export const metricsService = {
  /**
   * Récupère les métriques des circonscriptions
   * Endpoint: GET /metrics/circonscriptions
   * Permissions: SADMIN, ADMIN uniquement
   * 
   * ✅ CORRECTION : Utilise le chemin relatif car apiClient a déjà baseURL='/api/backend'
   * Le rewrite Next.js transforme automatiquement en /api/v1/metrics/circonscriptions
   */
  async getCirconscriptionMetrics(): Promise<CirconscriptionMetrics> {
    try {
      // ✅ CORRECTION : Chemin relatif sans /api/v1/ car le proxy l'ajoute automatiquement
      // apiClient baseURL = '/api/backend'
      // Rewrite Next.js : '/api/backend/metrics/circonscriptions' → '${API_URL}/api/v1/metrics/circonscriptions'
      if (process.env.NODE_ENV === 'development') {
        console.warn('📊 [MetricsService] Récupération des métriques circonscriptions...');
      }

      const response = await apiClient.get<CirconscriptionMetrics>(
        '/metrics/circonscriptions'
      );

      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [MetricsService] Métriques récupérées:', response.data);
      }

      // ✅ VALIDATION : Vérifier que les données reçues sont valides
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }

      const { total, published, remaining } = response.data;

      // ✅ VALIDATION : Vérifier que toutes les propriétés requises sont présentes
      if (
        typeof total !== 'number' ||
        typeof published !== 'number' ||
        typeof remaining !== 'number'
      ) {
        throw new Error('Format de données invalide: propriétés manquantes ou incorrectes');
      }

      // ✅ VALIDATION : Vérifier que les valeurs sont cohérentes
      if (total < 0 || published < 0 || remaining < 0) {
        throw new Error('Données invalides: valeurs négatives détectées');
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [MetricsService] Erreur récupération métriques:', error);
      }

      // ✅ GESTION D'ERREUR : Gestion spécifique pour les erreurs de permissions
      const errorObj = error as { response?: { status?: number } };
      if (errorObj.response?.status === 403) {
        throw new Error('Accès refusé. Seuls les administrateurs (SADMIN/ADMIN) peuvent consulter ces métriques.');
      }

      // Utilise le gestionnaire d'erreurs centralisé pour les autres erreurs
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Récupère les métriques avec calculs étendus
   * Ajoute des calculs côté client pour éviter la surcharge serveur
   * 
   * @returns Métriques étendues avec pourcentages et date de mise à jour
   * @throws Error si les données sont invalides ou si la requête échoue
   */
  async getExtendedCirconscriptionMetrics(): Promise<ExtendedMetrics> {
    try {
      const baseMetrics = await this.getCirconscriptionMetrics();

      // ✅ VALIDATION : Vérifier que les données sont valides
      if (
        typeof baseMetrics.total !== 'number' ||
        typeof baseMetrics.published !== 'number' ||
        typeof baseMetrics.remaining !== 'number'
      ) {
        throw new Error('Format de données invalide reçu du serveur');
      }

      // ✅ VALIDATION : Vérifier la cohérence des données
      if (baseMetrics.published + baseMetrics.remaining !== baseMetrics.total) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '⚠️ [MetricsService] Incohérence détectée dans les métriques:',
            `published (${baseMetrics.published}) + remaining (${baseMetrics.remaining}) !== total (${baseMetrics.total})`
          );
        }
        // On continue quand même mais on log l'avertissement
      }

      // Calculs étendus côté client
      const publishedPercentage = baseMetrics.total > 0
        ? (baseMetrics.published / baseMetrics.total) * 100
        : 0;

      return {
        ...baseMetrics,
        publishedPercentage: Math.round(publishedPercentage * 100) / 100, // Arrondi à 2 décimales
        lastUpdate: new Date(),
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [MetricsService] Erreur métriques étendues:', error);
      }
      throw new Error(handleApiError(error));
    }
  },

  // 🚀 EXTENSIBILITÉ : Placeholder pour futures métriques
  /**
   * Récupère les métriques des départements (à implémenter)
   * 
   * @returns Métriques des départements
   * @throws Error si l'endpoint n'est pas encore disponible
   */
  async getDepartementMetrics(): Promise<never> {
    // TODO: Implémenter quand l'endpoint sera disponible
    // Exemple de structure future :
    // interface DepartementMetrics {
    //   total: number;
    //   published: number;
    //   remaining: number;
    // }
    throw new Error('Endpoint des métriques départements non encore implémenté');
  },

  /**
   * Récupère les métriques des cellules (à implémenter)
   * 
   * @returns Métriques des cellules
   * @throws Error si l'endpoint n'est pas encore disponible
   */
  async getCelluleMetrics(): Promise<never> {
    // TODO: Implémenter quand l'endpoint sera disponible
    // Exemple de structure future :
    // interface CelluleMetrics {
    //   total: number;
    //   published: number;
    //   remaining: number;
    // }
    throw new Error('Endpoint des métriques cellules non encore implémenté');
  },
};

// Les types CirconscriptionMetrics et ExtendedMetrics sont déjà exportés via les interfaces ci-dessus
