import { apiClient } from "./client";
import type {
  DashboardResponseDto,
  DashboardFiltersDto,
  UserDashboardStatsDto,
  AdminDashboardStatsDto,
  SadminDashboardStatsDto,
  RealtimeMetricsDto,
  RefreshMetricsResponseDto,
} from "@/types/dashboard";

/**
 * API client pour les métriques du dashboard
 */
export const dashboardApi = {
  /**
   * Récupère les métriques du dashboard selon le rôle de l'utilisateur
   *
   * Pour USER : Retourne uniquement les données de l'utilisateur connecté
   * Pour ADMIN/SADMIN : Retourne toutes les données du système
   *
   * ✅ PROXY NEXT.JS : Utilise le proxy via apiClient pour éviter les erreurs CORS
   */
  async getDashboardMetrics(
    filters?: DashboardFiltersDto
  ): Promise<DashboardResponseDto> {
    try {
      const params = new URLSearchParams();

      if (filters?.userId) {
        params.append("userId", filters.userId);
      }
      if (filters?.dateFrom) {
        params.append("dateFrom", filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        params.append("dateTo", filters.dateTo.toISOString());
      }
      if (filters?.includeInactive !== undefined) {
        params.append("includeInactive", filters.includeInactive.toString());
      }

      // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
      const response = await apiClient.get(
        `/dashboard/metrics?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ [DashboardAPI] Erreur lors de la récupération des métriques du dashboard:",
          error
        );
      }
      throw error;
    }
  },

  /**
   * Récupère les métriques spécifiques aux utilisateurs USER
   * (Données restreintes à l'utilisateur connecté)
   *
   * ✅ PROXY NEXT.JS : Utilise le proxy via apiClient pour éviter les erreurs CORS
   */
  async getUserDashboardMetrics(): Promise<UserDashboardStatsDto> {
    try {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "🌐 [DashboardAPI] Appel GET /metrics/user-metrics (via proxy Next.js)"
        );
      }

      // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
      const response = await apiClient.get("/metrics/user-metrics");

      if (process.env.NODE_ENV === "development") {
        console.warn("📡 [DashboardAPI] Réponse reçue:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers,
        });
      }

      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
        };
        config?: {
          url?: string;
          method?: string;
          headers?: unknown;
        };
      };

      if (process.env.NODE_ENV === "development") {
        console.error("❌ [DashboardAPI] Erreur getUserDashboardMetrics:", {
          message: errorObj.message,
          status: errorObj.response?.status,
          statusText: errorObj.response?.statusText,
          data: errorObj.response?.data,
          config: {
            url: errorObj.config?.url,
            method: errorObj.config?.method,
            headers: errorObj.config?.headers,
          },
        });
      }
      throw error;
    }
  },

  /**
   * Récupère les métriques globales pour les administrateurs
   * (Toutes les données du système)
   *
   * ✅ PROXY NEXT.JS : Utilise le proxy via apiClient pour éviter les erreurs CORS
   */
  async getAdminDashboardMetrics(): Promise<
    AdminDashboardStatsDto | SadminDashboardStatsDto
  > {
    try {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "🌐 [DashboardAPI] Appel GET /metrics/admin-metrics (via proxy Next.js)"
        );
      }

      // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
      const response = await apiClient.get("/metrics/admin-metrics");

      if (process.env.NODE_ENV === "development") {
        console.warn("📡 [DashboardAPI] Réponse reçue:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers,
        });
      }

      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
        };
        config?: {
          url?: string;
          method?: string;
          headers?: unknown;
        };
      };

      if (process.env.NODE_ENV === "development") {
        console.error("❌ [DashboardAPI] Erreur getAdminDashboardMetrics:", {
          message: errorObj.message,
          status: errorObj.response?.status,
          statusText: errorObj.response?.statusText,
          data: errorObj.response?.data,
          config: {
            url: errorObj.config?.url,
            method: errorObj.config?.method,
            headers: errorObj.config?.headers,
          },
        });
      }
      throw error;
    }
  },

  /**
   * Récupère les métriques en temps réel
   * (Disponible uniquement pour ADMIN/SADMIN)
   *
   * ✅ PROXY NEXT.JS : Utilise le proxy via apiClient pour éviter les erreurs CORS
   * Le proxy transforme automatiquement :
   * - Requête : /api/backend/metrics/realtime-metrics
   * - Destination : ${NEXT_PUBLIC_API_URL}/api/v1/metrics/realtime-metrics
   */
  async getRealtimeMetrics(): Promise<RealtimeMetricsDto> {
    try {
      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('🌐 [DashboardAPI] Appel GET /metrics/realtime-metrics (via proxy Next.js)');
      // }

      // PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
      // apiClient baseURL = '/api/backend'
      // Rewrite Next.js : '/api/backend/metrics/realtime-metrics' → '${API_URL}/api/v1/metrics/realtime-metrics'
      const response = await apiClient.get("/metrics/realtime-metrics");

      if (process.env.NODE_ENV === "development") {
        console.warn("📡 [DashboardAPI] Réponse reçue:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data.data,
          headers: response.headers,
        });
      }

      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ [DashboardAPI] Erreur lors de la récupération des métriques temps réel:",
          error
        );
      }
      throw error;
    }
  },

  /**
   * Met à jour les métriques du dashboard
   * (Disponible pour tous les rôles authentifiés)
   *
   * ✅ PROXY NEXT.JS : Utilise le proxy via apiClient pour éviter les erreurs CORS
   */
  async refreshMetrics(): Promise<RefreshMetricsResponseDto> {
    try {
      // ✅ PROXY : Utilise apiClient qui passe automatiquement par le proxy Next.js
      const response = await apiClient.post("/metrics/refresh-metrics");
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ [DashboardAPI] Erreur lors du rafraîchissement des métriques:",
          error
        );
      }
      throw error;
    }
  },
};
