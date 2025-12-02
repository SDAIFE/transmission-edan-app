import { apiClient, uploadClient } from "./client";
import type {
  ImportData,
  ImportListResponse,
  ImportStats,
  ImportFilters,
  UploadRequestParams,
  CelDataResponse,
} from "@/types/upload";
import { ImportStatus } from "@/types/upload";

// Service API pour l'upload de fichiers Excel
export const uploadApi = {
  // ✅ CORRECTION : Upload fichier .xlsm uniquement (le backend fait la conversion)
  // Selon la documentation : Le frontend envoie uniquement le fichier Excel (.xlsm)
  // Le backend convertit en CSV, extrait les métadonnées et insère les données
  uploadExcel: async (params: UploadRequestParams): Promise<ImportData> => {
    try {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("📤 [UploadAPI] Upload du fichier Excel (.xlsm)...");
        // eslint-disable-next-line no-console
        console.log("📋 [UploadAPI] Paramètres:", {
          fileName: params.file.name,
          codeCellule: params.codeCellule,
          fileSize: `${(params.file.size / 1024 / 1024).toFixed(2)}MB`,
        });
      }

      // 1. ✅ Validation : .xlsm ou .xlsx (selon la doc, les deux sont acceptés)
      const isValidExtension =
        params.file.name.endsWith(".xlsm") ||
        params.file.name.endsWith(".xlsx");

      if (!isValidExtension) {
        throw new Error("Type de fichier invalide. Seuls les fichiers .xlsm et .xlsx sont acceptés.");
      }

      // 2. ✅ Validation de la taille (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (params.file.size > maxSize) {
        throw new Error("Le fichier est trop volumineux. Taille maximale : 10MB");
      }

      // 3. ✅ Envoyer UNIQUEMENT le fichier Excel au backend
      // Le backend se charge de la conversion CSV et de la validation
      const formData = new FormData();
      formData.append("excelFile", params.file); // ✅ Fichier Excel uniquement
      formData.append("codCel", params.codeCellule); // ✅ Utiliser "codCel" selon la doc

      // 4. ✅ Utiliser uploadClient (timeout plus long pour fichiers volumineux)
      const response = await uploadClient.post("legislatives/upload/excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.log(`📊 [UploadAPI] Progression: ${percentCompleted}%`);
            }
          }
        },
      });

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("✅ [UploadAPI] Fichier traité avec succès par le backend:", {
          importId: response.data.importId,
          codCel: response.data.codCel,
          nombreBureauxTraites: response.data.nombreBureauxTraites,
        });
      }

      return response.data;
    } catch (error: unknown) {
      console.error("❌ [UploadAPI] Erreur lors de l'upload:", error);

      // Gestion détaillée des erreurs
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: {
            data: { message?: string; error?: string; details?: unknown };
            status: number;
          };
        };

        console.error("📥 [UploadAPI] Réponse d'erreur du serveur:", {
          status: axiosError.response.status,
          data: axiosError.response.data,
        });

        // Créer une erreur plus informative
        const errorMessage =
          axiosError.response.data.message ||
          axiosError.response.data.error ||
          `Erreur serveur (${axiosError.response.status})`;

        const uploadError = new Error(errorMessage);
        (uploadError as { status?: number; details?: unknown }).status = axiosError.response.status;
        (uploadError as { status?: number; details?: unknown }).details = axiosError.response.data;
        throw uploadError;
      }

      // Erreur réseau ou autre
      if (error instanceof Error) {
        throw new Error(`Erreur de connexion: ${error.message}`);
      }

      throw new Error("Erreur inconnue lors de l'upload");
    }
  },

  // Récupérer la liste des imports avec filtres
  getImports: async (
    filters?: ImportFilters
  ): Promise<ImportListResponse | null> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());
      if (filters?.codeCellule) {
        // Si codeCellule contient plusieurs valeurs séparées par des virgules
        const celCodes = filters.codeCellule.split(",");
        celCodes.forEach((code) => {
          queryParams.append("codeCellule", code.trim());
        });
      }
      if (filters?.statut) queryParams.append("statut", filters.statut);
      // ✨ NOUVEAU : Filtres géographiques
      if (filters?.codeRegion) queryParams.append("codeRegion", filters.codeRegion);
      if (filters?.codeDepartement) queryParams.append("codeDepartement", filters.codeDepartement);

      const queryString = queryParams.toString();
      const url = queryString
        ? `legislatives/upload/imports?${queryString}`
        : "legislatives/upload/imports";

      if (process.env.NODE_ENV === "development") {
        console.log("🌐 [UploadAPI] Requête GET imports:", {
          url,
          queryParams: Object.fromEntries(queryParams.entries()),
          filters,
          fullUrl: `/api/backend${url}`,
        });
      }

      const response = await apiClient.get(url);

      if (process.env.NODE_ENV === "development") {
        console.log("📥 [UploadAPI] Réponse imports:", {
          dataLength: response.data?.imports?.length || 0,
          total: response.data?.total || 0,
          filters: filters,
          responseStatus: response.status,
          responseHeaders: response.headers,
          firstImport: response.data?.imports?.[0] || null,
        });
      }

      return response.data;
    } catch (error: any) {
      // Si l'erreur est 403 (Forbidden), l'utilisateur n'a pas les permissions
      if (error?.response?.status === 403 || error?.status === 403) {
        console.warn(
          "⚠️ [UploadAPI] Utilisateur sans permissions pour les imports",
          {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            code: error?.code,
          }
        );
        return null; // Retourner null au lieu de lancer une erreur
      }

      console.error(
        "❌ [UploadAPI] Erreur lors de la récupération des imports:",
        error
      );
      console.log("🔍 [UploadAPI] Structure de l'erreur imports:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
        code: error?.code,
      });
      throw error; // Relancer les autres erreurs
    }
  },

  // Récupérer les statistiques des imports
  getStats: async (): Promise<ImportStats | null> => {
    try {
      const response = await apiClient.get("legislatives/upload/stats");
      return response.data;
    } catch (error: any) {
      // Si l'erreur est 403 (Forbidden), l'utilisateur n'a pas les permissions
      if (error?.response?.status === 403 || error?.status === 403) {
        console.warn(
          "⚠️ [UploadAPI] Utilisateur sans permissions pour les statistiques",
          {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            code: error?.code,
          }
        );
        return null; // Retourner null au lieu de lancer une erreur
      }

      console.error(
        "❌ [UploadAPI] Erreur lors de la récupération des statistiques:",
        error
      );
      console.log("🔍 [UploadAPI] Structure de l'erreur:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
        code: error?.code,
      });
      throw error; // Relancer les autres erreurs
    }
  },

  // Récupérer les imports d'une CEL spécifique
  getImportsByCel: async (
    codeCellule: string,
    page?: number,
    limit?: number
  ): Promise<ImportListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());

      const queryString = queryParams.toString();
      const url = queryString
        ? `/upload/imports/cel/${codeCellule}?${queryString}`
        : `/upload/imports/cel/${codeCellule}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error(
        "❌ [UploadAPI] Erreur lors de la récupération des imports de la CEL:",
        error
      );
      throw error;
    }
  },

  // Récupérer les imports par statut
  getImportsByStatus: async (
    status: ImportStatus,
    page?: number,
    limit?: number
  ): Promise<ImportListResponse> => {
    try {
      console.log(
        "📋 [UploadAPI] Récupération des imports par statut:",
        status
      );

      const queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());

      const queryString = queryParams.toString();
      const url = queryString
        ? `/upload/imports/statut/${status}?${queryString}`
        : `/upload/imports/statut/${status}`;

      const response = await apiClient.get(url);

      console.log(
        "✅ [UploadAPI] Imports par statut récupérés:",
        response.data.total
      );
      return response.data;
    } catch (error: unknown) {
      console.error(
        "❌ [UploadAPI] Erreur lors de la récupération des imports par statut:",
        error
      );
      throw error;
    }
  },

  // Récupérer un import spécifique par ID
  getImportById: async (id: string): Promise<ImportData> => {
    try {
      console.log("📋 [UploadAPI] Récupération de l'import:", id);

      const response = await apiClient.get(`/upload/imports/${id}`);

      console.log("✅ [UploadAPI] Import récupéré:", response.data.nomFichier);
      return response.data;
    } catch (error: unknown) {
      console.error(
        "❌ [UploadAPI] Erreur lors de la récupération de l'import:",
        error
      );
      throw error;
    }
  },

  // Supprimer un import
  deleteImport: async (id: string): Promise<void> => {
    try {
      console.log("🗑️ [UploadAPI] Suppression de l'import:", id);

      await apiClient.delete(`/upload/imports/${id}`);

      console.log("✅ [UploadAPI] Import supprimé");
    } catch (error: unknown) {
      console.error(
        "❌ [UploadAPI] Erreur lors de la suppression de l'import:",
        error
      );
      throw error;
    }
  },

  // Télécharger un fichier d'import
  downloadImport: async (id: string): Promise<Blob> => {
    try {
      console.log("⬇️ [UploadAPI] Téléchargement de l'import:", id);

      const response = await apiClient.get(`/upload/imports/${id}/download`, {
        responseType: "blob",
      });

      console.log("✅ [UploadAPI] Fichier téléchargé");
      return response.data;
    } catch (error: unknown) {
      console.error("❌ [UploadAPI] Erreur lors du téléchargement:", error);
      throw error;
    }
  },

  // Relancer le traitement d'un import en erreur
  retryImport: async (id: string): Promise<ImportData> => {
    try {
      console.log("🔄 [UploadAPI] Relance du traitement de l'import:", id);

      const response = await apiClient.post(`/upload/imports/${id}/retry`);

      console.log("✅ [UploadAPI] Traitement relancé");
      return response.data;
    } catch (error: unknown) {
      console.error(
        "❌ [UploadAPI] Erreur lors de la relance du traitement:",
        error
      );
      throw error;
    }
  },
};

// ✅ Valider le type de fichier (.xlsm ou .xlsx)
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  // Vérifier l'extension .xlsm
  if (!file.name.endsWith(".xlsm")) {
    return false;
  }

  // Vérifier le type MIME
  return allowedTypes.includes(file.type);
};

// Valider la taille du fichier
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Valider le nom du fichier
export const validateFileName = (
  fileName: string,
  celName: string
): {
  isValid: boolean;
  message: string;
  confidence: number;
} => {
  // Normaliser les noms (supprimer accents, espaces, casse)
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer accents
      .replace(/\s+/g, "") // Supprimer espaces
      .replace(/[^a-z0-9]/g, ""); // Garder seulement lettres et chiffres
  };

  const normalizedFileName = normalizeString(fileName);
  const normalizedCelName = normalizeString(celName);

  // Vérifier si le nom de la CEL est présent dans le nom du fichier
  const isPresent = normalizedFileName.includes(normalizedCelName);

  // Calculer le niveau de confiance
  let confidence = 0;
  if (isPresent) {
    confidence = Math.min(
      100,
      (normalizedCelName.length / normalizedFileName.length) * 100
    );
  }

  return {
    isValid: isPresent,
    message: isPresent
      ? `✅ Nom fichier correspond à la CEL "${celName}"`
      : `❌ Nom fichier ne correspond pas à la CEL "${celName}"`,
    confidence: Math.round(confidence),
  };
};

// Formater la taille du fichier
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Obtenir l'icône du statut
export const getStatusIcon = (status: ImportStatus): string => {
  switch (status) {
    case ImportStatus.N:
      return "⏳";
    case ImportStatus.I:
      return "✅";
    case ImportStatus.P:
      return "📢";
    default:
      return "❓";
  }
};

// Obtenir la couleur du statut
export const getStatusColor = (status: ImportStatus): string => {
  switch (status) {
    case ImportStatus.N:
      return "text-yellow-600";
    case ImportStatus.I:
      return "text-green-600";
    case ImportStatus.P:
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

// Fonction pour récupérer les détails d'une CEL
export const getCelData = async (
  codeCellule: string
): Promise<CelDataResponse | null> => {
  try {
    const response = await apiClient.get(`/upload/cel/${codeCellule}/data`);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ [UploadAPI] Erreur lors de la récupération des données CEL:",
      error
    );
    console.log("🔍 [UploadAPI] Structure de l'erreur:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      message: error?.message,
      code: error?.code,
    });

    if (error?.response?.status === 404) {
      throw new Error("CEL non trouvée");
    } else if (error?.response?.status === 401) {
      throw new Error("Token invalide");
    } else if (error?.response?.status === 403) {
      throw new Error("Accès non autorisé");
    } else if (error?.response?.status === 500) {
      throw new Error("Erreur serveur");
    }

    throw error;
  }
};
