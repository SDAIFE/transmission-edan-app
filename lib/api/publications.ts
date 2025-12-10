import { apiClient } from "./client";
import type {
  DepartmentStats,
  DepartmentListResponse,
  PublicationActionResult,
  DepartmentDataResponse,
  EntityListResponse,
  EntityActionResult,
  PublishableEntity,
  // EntityType, // ❌ NON UTILISÉ
  CommuneDetails,
  // DepartmentDetails, // ❌ NON UTILISÉ
} from "@/types/publications";

// Types locaux pour les résultats nationaux (le fichier @/types/national-results n'existe pas)
interface NationalCandidate {
  numeroOrdre?: number;
  parti?: string;
  nom?: string;
  score?: number;
  pourcentage?: number;
  photo?: string;
}

interface BulletinsInfo {
  nombre?: number;
  pourcentage?: number;
}

interface NationalResultsResponse {
  inscrits?: number;
  votants?: number;
  tauxParticipation?: number;
  nombreBureauxVote?: number;
  bulletinsNuls?: BulletinsInfo;
  suffrageExprime?: number;
  bulletinsBlancs?: BulletinsInfo;
  candidats?: NationalCandidate[];
}

interface NationalResultsFilters {
  typeElection?: string;
  tour?: number;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface DepartmentListQuery {
  page?: number;
  limit?: number;
  codeDepartement?: string;
  publicationStatus?: 'PUBLISHED' | 'CANCELLED' | 'PENDING';
  search?: string;
}

export interface EntityListQuery {
  page?: number;
  limit?: number;
  codeDepartement?: string;        // Filtre par département (ex: "022" pour Abidjan)
  publicationStatus?: 'PUBLISHED' | 'CANCELLED' | 'PENDING';
  search?: string;
  type?: 'DEPARTMENT' | 'COMMUNE'; // Filtre par type d'entité
}

export const publicationsApi = {
  // Récupérer les statistiques des départements
  getStats: async (): Promise<DepartmentStats | null> => {
    try {
      const response = await apiClient.get('/publications/stats');
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (errorObj.response?.status === 403) {
        // console.warn('⚠️ [PublicationsAPI] Permissions insuffisantes pour accéder aux statistiques');
        return null;
      }
      // console.error('❌ [PublicationsAPI] Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Récupérer la liste des départements
  getDepartments: async (query?: DepartmentListQuery): Promise<DepartmentListResponse | null> => {
    try {
      const response = await apiClient.get('/publications/departments', { params: query });
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (errorObj.response?.status === 403) {
        // console.warn('⚠️ [PublicationsAPI] Permissions insuffisantes pour accéder aux départements');
        return null;
      }
      // console.error('❌ [PublicationsAPI] Erreur lors de la récupération des départements:', error);
      throw error;
    }
  },

  // Publier un département
  publishDepartment: async (id: string): Promise<PublicationActionResult> => {
    // eslint-disable-next-line
    try {
      const response = await apiClient.post(
        `/publications/departments/${id}/publish`
      );
      return response.data;
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la publication du département:', error);
      throw error;
    }
  },

  // Annuler la publication d'un département
  cancelPublication: async (id: string): Promise<PublicationActionResult> => {
    // eslint-disable-next-line
    try {
      const response = await apiClient.post(
        `/publications/departments/${id}/cancel`
      );
      return response.data;
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de l\'annulation de la publication:', error);
      throw error;
    }
  },

  // Récupérer les détails d'un département
  getDepartmentDetails: async (id: string): Promise<unknown> => {
    // eslint-disable-next-line
    try {
      const response = await apiClient.get(
        `/publications/departments/${id}/details`
      );
      return response.data;
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la récupération des détails:', error);
      throw error;
    }
  },

  // Récupérer les données agrégées d'un département ou d'une commune par code
  getDepartmentData: async (codeEntite: string, query?: { page?: number; limit?: number; search?: string }): Promise<DepartmentDataResponse | null> => {
    try {
      // ✅ CORRECTION : Détecter si c'est une commune (format "022-001-004" = 2 tirets) ou un département (format "001" = 0 tiret)
      const tirets = (codeEntite.match(/-/g) || []).length;
      const isCommune = tirets >= 1; // Au moins 1 tiret = commune

      const endpoint = isCommune
        ? `/publications/communes/${codeEntite}/data`
        : `/publications/departments/${codeEntite}/data`;
      // if(process.env.NODE_ENV === 'development') {
      //   console.log(`🔍 [PublicationsAPI] Récupération des données pour ${isCommune ? 'commune' : 'département'}: ${codeEntite}`);
      //   console.log(`📍 [PublicationsAPI] Format détecté: ${tirets} tiret(s) → ${isCommune ? 'COMMUNE' : 'DÉPARTEMENT'}`);
      //   console.log(`📍 [PublicationsAPI] Endpoint utilisé: ${endpoint}`);
      // }
      const response = await apiClient.get(endpoint, {
        params: query
      });

      // if(process.env.NODE_ENV === 'development') {
      //   console.log('✅ [PublicationsAPI] Données récupérées avec succès:', response.data);
      // }
      return response.data;
    } catch (error: unknown) {
      // console.error(`❌ [PublicationsAPI] Erreur lors de la récupération des données pour ${codeEntite}:`, error);
      // console.log('🔍 [PublicationsAPI] Structure de l\'erreur:', {
      //   status: (error as { response?: { status?: number } })?.response?.status,
      //   statusText: (error as { response?: { statusText?: string } })?.response?.statusText,
      //   message: (error as { message?: string })?.message,
      //   code: (error as { code?: string })?.code
      // });

      const errorObj = error as {
        response?: { status?: number; statusText?: string };
        message?: string;
        code?: string;
      };

      if (errorObj.response?.status === 404) {
        throw new Error("Entité non trouvée");
      } else if (errorObj.response?.status === 401) {
        throw new Error("Token invalide");
      } else if (errorObj.response?.status === 403) {
        throw new Error("Accès non autorisé");
      } else if (errorObj.response?.status === 500) {
        throw new Error("Erreur serveur");
      }

      throw error;
    }
  },

  // ==================== NOUVELLES MÉTHODES POUR ENTITÉS (DÉPARTEMENTS + COMMUNES) ====================

  // Récupérer la liste des entités publiables (départements + communes)
  getEntities: async (query?: EntityListQuery): Promise<EntityListResponse | null> => {
    try {
      // if(process.env.NODE_ENV === 'development') {
      //   console.log('📡 [PublicationsAPI] Récupération des entités avec filtres:', query);
      // }
      const response = await apiClient.get("/publications/departments", {
        params: query,
      });
      // if(process.env.NODE_ENV === 'development') {
      //   console.log('✅ [PublicationsAPI] Réponse reçue:', {
      //     hasEntities: !!response.data?.entities,
      //     hasDepartments: !!response.data?.departments,
      //     total: response.data?.total,
      //     page: response.data?.page
      //   });
      // }

      // Le backend retourne déjà le bon format avec 'entities'
      if (response.data && response.data.entities) {
        //en developpement
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('✅ [PublicationsAPI] Format correct détecté (entities):', {
        //     count: response.data.entities.length,
        //     total: response.data.total,
        //     firstEntity: response.data.entities[0]
        //   });
        // }
        return response.data;
      }

      // Compatibilité : Si le backend retourne 'departments', le convertir en 'entities'
      if (response.data && response.data.departments && !response.data.entities) {
        //en developpement
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('🔄 [PublicationsAPI] Conversion departments → entities (ancien format)');
        // }

        // Transformer les départements en entités avec le bon format
        const entities = response.data.departments.map(
          (dept: Record<string, unknown>) => ({
            id: dept.id,
            code: dept.code || dept.codeDepartement,
            libelle: dept.libelle || dept.libelleDepartement,
            type: dept.type || 'DEPARTMENT' as const,
            codeDepartement: dept.codeDepartement,
            codeCommune: dept.codeCommune,
            totalCels: dept.totalCels,
            importedCels: dept.importedCels,
            pendingCels: dept.pendingCels,
            publicationStatus: dept.publicationStatus,
            lastUpdate: dept.lastUpdate,
            cels: dept.cels || []
          }));

        return {
          entities,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages
        };
      }

      //en developpement
      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('⚠️ [PublicationsAPI] Format de réponse inattendu:', response.data);
      // }
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (errorObj.response?.status === 403) {
        // console.warn('⚠️ [PublicationsAPI] Permissions insuffisantes pour accéder aux entités');
        return null;
      }
      // console.error('❌ [PublicationsAPI] Erreur lors de la récupération des entités:', error);
      throw error;
    }
  },

  // Publier une entité (département ou commune)
  publishEntity: async (entity: PublishableEntity): Promise<EntityActionResult> => {
    try {
      const endpoint = entity.type === 'DEPARTMENT'
        ? `/publications/departments/${entity.id}/publish`
        : `/publications/communes/${entity.id}/publish`;

      const response = await apiClient.post(endpoint);
      return {
        success: true,
        message: response.data.message,
        entity: response.data.entity
      };
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la publication de l\'entité:', error);
      const errorObj = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          errorObj.response?.data?.message || "Erreur lors de la publication",
        error: errorObj.response?.data?.error,
      };
    }
  },

  // Annuler la publication d'une entité (département ou commune)
  cancelEntity: async (entity: PublishableEntity): Promise<EntityActionResult> => {
    try {
      const endpoint = entity.type === 'DEPARTMENT'
        ? `/publications/departments/${entity.id}/cancel`
        : `/publications/communes/${entity.id}/cancel`;

      const response = await apiClient.post(endpoint);
      return {
        success: true,
        message: response.data.message,
        entity: response.data.entity
      };
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de l\'annulation de l\'entité:', error);
      const errorObj = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          errorObj.response?.data?.message || "Erreur lors de l'annulation",
        error: errorObj.response?.data?.error,
      };
    }
  },

  // ==================== MÉTHODES SPÉCIFIQUES AUX COMMUNES ====================

  // Récupérer les détails d'une commune
  getCommuneDetails: async (id: string): Promise<CommuneDetails> => {
    // eslint-disable-next-line
    try {
      const response = await apiClient.get(
        `/publications/communes/${id}/details`
      );
      return response.data;
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la récupération des détails de la commune:', error);
      throw error;
    }
  },

  // Publier une commune d'Abidjan
  publishCommune: async (id: string): Promise<EntityActionResult> => {
    try {
      const response = await apiClient.post(`/publications/communes/${id}/publish`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la publication de la commune:', error);
      const errorObj = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          errorObj.response?.data?.message ||
          "Erreur lors de la publication de la commune",
        error: errorObj.response?.data?.error,
      };
    }
  },

  // Annuler la publication d'une commune
  cancelCommune: async (id: string): Promise<EntityActionResult> => {
    try {
      const response = await apiClient.post(`/publications/communes/${id}/cancel`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de l\'annulation de la commune:', error);
      const errorObj = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          errorObj.response?.data?.message ||
          "Erreur lors de l'annulation de la commune",
        error: errorObj.response?.data?.error,
      };
    }
  },

  // Récupérer uniquement les communes d'Abidjan
  getAbidjanCommunes: async (
    query?: Omit<EntityListQuery, "codeDepartement">
  ): Promise<EntityListResponse | null> => {
    // eslint-disable-next-line
    try {
      //en developpement
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('📡 [PublicationsAPI] Récupération des communes d\'Abidjan');
      // }

      // Utiliser getEntities avec le filtre codeDepartement=022
      const response = await publicationsApi.getEntities({
        ...query,
        codeDepartement: "022",
      });

      if (response) {
        //en developpement
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('✅ [PublicationsAPI] Communes d\'Abidjan récupérées:', {
        //     count: response.entities.length,
        //     total: response.total
        //   });
        // }
      }

      return response;
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la récupération des communes d\'Abidjan:', error);
      throw error;
    }
  },

  // ✨ NOUVEAU : Récupérer les résultats nationaux
  getNationalResults: async (filters?: NationalResultsFilters): Promise<NationalResultsResponse> => {
    try {

      const params = new URLSearchParams();
      if (filters?.typeElection) params.append('typeElection', filters.typeElection);
      if (filters?.tour) params.append('tour', filters.tour.toString());
      if (filters?.statut) params.append('statut', filters.statut);
      if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters?.dateFin) params.append('dateFin', filters.dateFin);

      const queryString = params.toString();
      const endpoint = `/publications/national/data${queryString ? `?${queryString}` : ''}`;

      //en developpement
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`📍 [PublicationsAPI] Endpoint utilisé: ${endpoint}`);
      // }

      const response = await apiClient.get(endpoint);

      return response.data;
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la récupération des résultats nationaux:', error);

      const errorObj = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (errorObj.response?.status === 404) {
        // console.warn('⚠️ [PublicationsAPI] Route des résultats nationaux non trouvée - backend pas encore implémenté');
        throw new Error(
          "La route des résultats nationaux n'est pas encore disponible côté backend"
        );
      }

      if (errorObj.response?.status === 403) {
        // console.warn('⚠️ [PublicationsAPI] Permissions insuffisantes pour accéder aux résultats nationaux');
        throw new Error(
          "Permissions insuffisantes pour accéder aux résultats nationaux"
        );
      }

      throw error;
    }
  },

  // ✨ NOUVEAU : Générer le PDF des résultats nationaux
  generateNationalResultsPDF: async (options?: {
    includeImages?: boolean;
    format?: "A4" | "A3";
    orientation?: "portrait" | "landscape";
  }): Promise<Blob> => {
    // eslint-disable-next-line
    try {
      //en developpement
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('📄 [PublicationsAPI] Génération du PDF des résultats nationaux...');
      // }

      const params = new URLSearchParams();
      if (options?.includeImages) params.append("includeImages", "true");
      if (options?.format) params.append("format", options.format);
      if (options?.orientation)
        params.append("orientation", options.orientation);

      const queryString = params.toString();
      const endpoint = `/publications/national/pdf${queryString ? `?${queryString}` : ""
        }`;

      //en developpement
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`📍 [PublicationsAPI] Endpoint PDF utilisé: ${endpoint}`);
      // }

      const response = await apiClient.get(endpoint, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      });

      return response.data;
    } catch (error: unknown) {
      // console.error('❌ [PublicationsAPI] Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }
};
