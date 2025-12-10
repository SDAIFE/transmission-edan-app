import { apiClient, handleApiError, buildQueryParams } from "./client";

// Types locaux pour les CELs (le fichier @/types/cels n'existe pas)
interface CelResponseDto {
  codeCellule: string;
  libelleCellule: string;
  codeCirconscription?: string;
  libelleCirconscription?: string;
  codeDepartement?: string;
  libelleDepartement?: string;
  codeRegion?: string;
  libelleRegion?: string;
  typeCellule?: string;
  utilisateurAssign?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  [key: string]: unknown;
}

interface CelListResponseDto {
  cels: CelResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

interface CelStatsDto {
  totalCels: number;
  celsAssignees: number;
  celsNonAssignees: number;
  celsParType?: Record<string, number>;
  celsParRegion?: Record<string, number>;
  celsParDepartement?: Record<string, number>;
  [key: string]: unknown;
}

interface DashboardCelFilterDto {
  page?: number;
  limit?: number;
  codeRegion?: string;
  codeDepartement?: string;
  codeCirconscription?: string;
  typeCellule?: string;
  assigned?: boolean;
  search?: string;
  [key: string]: unknown;
}

interface DashboardCelListResponseDto {
  cels: CelResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats?: CelStatsDto;
  [key: string]: unknown;
}

// Service API pour les CELs
export const celsApi = {
  // Liste des CELs avec filtres
  getCels: async (filters?: DashboardCelFilterDto): Promise<CelListResponseDto> => {
    try {
      const queryString = filters ? `?${buildQueryParams(filters as Record<string, unknown>)}` : '';
      const response = await apiClient.get(`/cels${queryString}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // Détails d'une CEL par code
  getCelByCode: async (codeCellule: string): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/${codeCellule}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // Mise à jour d'une CEL
  updateCel: async (codeCellule: string, updates: Partial<CelResponseDto>): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.patch(`/cels/${codeCellule}`, updates);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // Assigner un utilisateur à une CEL
  assignUser: async (codeCellule: string, userId: string): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.patch(`/cels/${codeCellule}/assign-user`, { userId });
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // Désassigner un utilisateur d'une CEL
  unassignUser: async (codeCellule: string): Promise<CelResponseDto> => {
    try {
      const response = await apiClient.patch(`/cels/${codeCellule}/unassign-user`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // Statistiques des CELs
  getStats: async (): Promise<CelStatsDto> => {
    try {
      const response = await apiClient.get('/cels/stats/overview');
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs par département
  getCelsByDepartement: async (codeDepartement: string): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/departement/${codeDepartement}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs par région
  getCelsByRegion: async (codeRegion: string): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/region/${codeRegion}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs non assignées
  getUnassignedCels: async (): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get('/cels/unassigned/list');
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // CELs par type
  getCelsByType: async (typeCellule: string): Promise<CelListResponseDto> => {
    try {
      const response = await apiClient.get(`/cels/type/${typeCellule}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },

  // Dashboard CELs avec filtres avancés
  getDashboardCels: async (filters?: DashboardCelFilterDto): Promise<DashboardCelListResponseDto> => {
    try {
      const queryString = filters ? `?${buildQueryParams(filters as Record<string, unknown>)}` : '';
      const response = await apiClient.get(`/dashboard/cels${queryString}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(handleApiError(error));
    }
  },
};
