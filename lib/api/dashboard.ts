import { apiClient } from './client';
import type { 
  DashboardResponseDto, 
  DashboardFiltersDto, 
  UserDashboardStatsDto, 
  AdminDashboardStatsDto,
  SadminDashboardStatsDto,
  RealtimeMetricsDto,
  RefreshMetricsResponseDto
} from '@/types/dashboard';

/**
 * API client pour les métriques du dashboard
 */
export const dashboardApi = {
  /**
   * Récupère les métriques du dashboard selon le rôle de l'utilisateur
   * 
   * Pour USER : Retourne uniquement les données de l'utilisateur connecté
   * Pour ADMIN/SADMIN : Retourne toutes les données du système
   */
  async getDashboardMetrics(filters?: DashboardFiltersDto): Promise<DashboardResponseDto> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.userId) {
        params.append('userId', filters.userId);
      }
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }
      if (filters?.includeInactive !== undefined) {
        params.append('includeInactive', filters.includeInactive.toString());
      }

      const response = await apiClient.get(`/dashboard/metrics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques du dashboard:', error);
      throw error;
    }
  },

  /**
   * Récupère les métriques spécifiques aux utilisateurs USER
   * (Données restreintes à l'utilisateur connecté)
   */
  async getUserDashboardMetrics(): Promise<UserDashboardStatsDto> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 [DashboardAPI] Appel GET /dashboard/user-metrics');
      }
      const response = await apiClient.get('/dashboard/user-metrics');
      if (process.env.NODE_ENV === 'development') {
      console.log('📡 [DashboardAPI] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
    }
      return response.data.data;
    } catch (error: any) {
      console.error('❌ [DashboardAPI] Erreur getUserDashboardMetrics:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  /**
   * Récupère les métriques globales pour les administrateurs
   * (Toutes les données du système)
   */
  async getAdminDashboardMetrics(): Promise<AdminDashboardStatsDto | SadminDashboardStatsDto> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 [DashboardAPI] Appel GET /dashboard/admin-metrics');
      }
      const response = await apiClient.get('/dashboard/admin-metrics');
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 [DashboardAPI] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
          data: response.data,
          headers: response.headers
        });
      }
      return response.data.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
      console.error('❌ [DashboardAPI] Erreur getAdminDashboardMetrics:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
      throw error;
    }
  },

  /**
   * Récupère les métriques en temps réel
   * (Disponible uniquement pour ADMIN/SADMIN)
   */
  async getRealtimeMetrics(): Promise<RealtimeMetricsDto> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 [DashboardAPI] Appel GET /dashboard/realtime-metrics');
      }
      const response = await apiClient.get('/dashboard/realtime-metrics');
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 [DashboardAPI] Réponse reçue:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data.data,
          headers: response.headers
        });
      }
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur lors de la récupération des métriques temps réel:', error);
      }
      throw error;
    }
  },

  /**
   * Met à jour les métriques du dashboard
   * (Disponible pour tous les rôles authentifiés)
   */
  async refreshMetrics(): Promise<RefreshMetricsResponseDto> {
    try {
      const response = await apiClient.post('/dashboard/refresh-metrics');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des métriques:', error);
      throw error;
    }
  }
};