import { uploadClient, apiClient } from './client';
import type {
    LegislativesUploadResponse,
    LegislativesUploadParams,
    CelExcelDataResponse,
} from '@/types/legislatives';

/**
 * Service API pour les élections législatives
 * 
 * Endpoints :
 * - POST /api/v1/legislatives/upload/excel : Upload de fichier Excel
 * - GET /api/v1/cels/:codeCellule/data/excel-format : Récupération des données CEL
 */
export const legislativesApi = {
    /**
     * Upload d'un fichier Excel (.xlsm) pour les élections législatives
     * 
     * @param params Paramètres d'upload (fichier et code CEL)
     * @returns Réponse avec les détails de l'import
     */
    uploadExcel: async (
        params: LegislativesUploadParams
    ): Promise<LegislativesUploadResponse> => {
        try {
            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log('📤 [LegislativesAPI] Upload du fichier Excel législatives...');
                // eslint-disable-next-line no-console
                console.log('📋 [LegislativesAPI] Paramètres:', {
                    fileName: params.file.name,
                    codCel: params.codCel,
                    fileSize: `${(params.file.size / 1024 / 1024).toFixed(2)}MB`,
                });
            }

            // Validation du type de fichier
            const allowedTypes = [
                'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            ];

            if (!allowedTypes.includes(params.file.type) &&
                !params.file.name.endsWith('.xlsm') &&
                !params.file.name.endsWith('.xlsx')) {
                throw new Error('Type de fichier invalide. Seuls les fichiers .xlsm et .xlsx sont acceptés.');
            }

            // Validation de la taille (10MB max)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (params.file.size > maxSize) {
                throw new Error('Le fichier est trop volumineux. Taille maximale : 10MB');
            }

            // Préparer FormData
            const formData = new FormData();
            formData.append('excelFile', params.file);
            formData.append('codCel', params.codCel);

            // Utiliser uploadClient (timeout plus long pour les fichiers volumineux)
            const response = await uploadClient.post<LegislativesUploadResponse>(
                '/legislatives/upload/excel',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            if (process.env.NODE_ENV === 'development') {
                                // eslint-disable-next-line no-console
                                console.log(`📊 [LegislativesAPI] Progression: ${percentCompleted}%`);
                            }
                        }
                    },
                }
            );

            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log('✅ [LegislativesAPI] Upload réussi:', {
                    importId: response.data.importId,
                    nombreBureauxTraites: response.data.nombreBureauxTraites,
                    nombreCandidats: response.data.nombreCandidats,
                });
            }

            return response.data;
        } catch (error: unknown) {
            console.error('❌ [LegislativesAPI] Erreur lors de l\'upload:', error);

            // Gestion détaillée des erreurs
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response: {
                        data: { message?: string; error?: string; statusCode?: number };
                        status: number;
                    };
                };

                console.error('📥 [LegislativesAPI] Réponse d\'erreur du serveur:', {
                    status: axiosError.response.status,
                    data: axiosError.response.data,
                });

                // Créer une erreur plus informative
                const errorMessage =
                    axiosError.response.data.message ||
                    axiosError.response.data.error ||
                    `Erreur serveur (${axiosError.response.status})`;

                const uploadError = new Error(errorMessage);
                (uploadError as Error & { status?: number; details?: unknown }).status = axiosError.response.status;
                (uploadError as Error & { status?: number; details?: unknown }).details = axiosError.response.data;
                throw uploadError;
            }

            // Erreur réseau ou autre
            if (error instanceof Error) {
                throw new Error(`Erreur de connexion: ${error.message}`);
            }

            throw new Error('Erreur inconnue lors de l\'upload');
        }
    },

    /**
     * Récupérer les données d'une CEL au format Excel
     * 
     * @param codCel Code de la CEL (ex: "S003")
     * @returns Données de la CEL au format Excel
     */
    getCelExcelData: async (codCel: string): Promise<CelExcelDataResponse> => {
        try {
            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log('📥 [LegislativesAPI] Récupération des données CEL:', codCel);
            }

            const response = await apiClient.get<CelExcelDataResponse>(
                `/cels/${codCel}/data/excel-format`
            );

            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log('✅ [LegislativesAPI] Données CEL récupérées:', {
                    codCel: response.data.codCel,
                    nombreBureaux: response.data.data.length,
                    nombreCandidats: response.data.candidats.length,
                });
            }

            return response.data;
        } catch (error: unknown) {
            console.error('❌ [LegislativesAPI] Erreur lors de la récupération des données CEL:', error);

            // Gestion des erreurs spécifiques
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response: {
                        data: { message?: string; error?: string };
                        status: number;
                    };
                };

                if (axiosError.response.status === 404) {
                    throw new Error('CEL non trouvée');
                } else if (axiosError.response.status === 403) {
                    throw new Error('Vous n\'avez pas accès à cette cellule électorale');
                } else if (axiosError.response.status === 401) {
                    throw new Error('Session expirée, veuillez vous reconnecter');
                }

                const errorMessage =
                    axiosError.response.data.message ||
                    axiosError.response.data.error ||
                    `Erreur serveur (${axiosError.response.status})`;

                throw new Error(errorMessage);
            }

            if (error instanceof Error) {
                throw error;
            }

            throw new Error('Erreur inconnue lors de la récupération des données');
        }
    },
};

