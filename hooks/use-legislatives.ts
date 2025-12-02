import { useState, useCallback, useEffect } from 'react';
import { legislativesApi } from '@/lib/api/legislatives';
import type {
    LegislativesUploadParams,
    LegislativesUploadResult,
    UseUploadLegislativesExcelReturn,
    UseCelExcelDataReturn,
    CelExcelDataResponse,
} from '@/types/legislatives';

/**
 * Hook personnalisé pour l'upload de fichiers Excel législatives
 * 
 * Caractéristiques :
 * - Gestion d'état complète (loading, error, progress)
 * - Validation automatique du fichier
 * - Suivi de la progression de l'upload
 * - Gestion automatique des erreurs
 * 
 * @returns État et fonctions pour gérer l'upload
 */
export function useUploadLegislativesExcel(): UseUploadLegislativesExcelReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const uploadExcel = useCallback(
        async (params: LegislativesUploadParams): Promise<LegislativesUploadResult> => {
            try {
                setLoading(true);
                setError(null);
                setProgress(0);

                // Validation du fichier
                if (!params.file) {
                    throw new Error('Aucun fichier fourni');
                }

                // Validation du code CEL
                if (!params.codCel || params.codCel.trim() === '') {
                    throw new Error('Le code CEL est requis');
                }

                // Progression : Préparation
                setProgress(10);

                // Progression : Upload
                setProgress(30);

                const result = await legislativesApi.uploadExcel(params);

                // Progression : Traitement
                setProgress(80);

                // Progression : Terminé
                setProgress(100);

                return {
                    success: true,
                    data: result,
                    message: result.message || 'Upload réussi',
                };
            } catch (err: unknown) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('❌ [useUploadLegislativesExcel] Erreur lors de l\'upload:', err);
                }

                // Gestion détaillée des erreurs
                let errorMessage = 'Erreur lors de l\'upload';
                let userFriendlyMessage = 'Erreur lors de l\'upload du fichier';

                if (err instanceof Error) {
                    errorMessage = err.message;

                    // Messages d'erreur spécifiques pour l'utilisateur
                    if (err.message.includes('Type de fichier invalide')) {
                        userFriendlyMessage = 'Type de fichier invalide. Seuls les fichiers .xlsm et .xlsx sont acceptés.';
                    } else if (err.message.includes('trop volumineux')) {
                        userFriendlyMessage = 'Le fichier est trop volumineux. Taille maximale : 10MB';
                    } else if (err.message.includes('CEL non trouvée')) {
                        userFriendlyMessage = 'La CEL sélectionnée n\'existe pas';
                    } else if (err.message.includes('ne correspond pas')) {
                        userFriendlyMessage = 'Le code CEL du fichier ne correspond pas à la CEL sélectionnée';
                    } else if (err.message.includes('timeout') || err.message.includes('expiré')) {
                        userFriendlyMessage = 'Le traitement prend plus de temps que prévu. Vérifiez dans la liste des imports si le fichier a bien été traité.';
                    } else if (err.message.includes('Erreur de connexion')) {
                        userFriendlyMessage = 'Problème de connexion. Vérifiez votre réseau.';
                    } else if (err.message.includes('Session expirée')) {
                        userFriendlyMessage = 'Session expirée, veuillez vous reconnecter';
                    } else {
                        userFriendlyMessage = err.message;
                    }
                }

                setError(userFriendlyMessage);
                setProgress(0);

                return {
                    success: false,
                    error: userFriendlyMessage,
                    message: userFriendlyMessage,
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setProgress(0);
    }, []);

    return {
        uploadExcel,
        loading,
        error,
        progress,
        reset,
    };
}

/**
 * Hook personnalisé pour récupérer les données CEL au format Excel
 * 
 * Caractéristiques :
 * - Gestion d'état complète (loading, error, data)
 * - Chargement automatique au montage si codCel fourni
 * - Fonction de refetch manuelle
 * - Gestion automatique des erreurs
 * 
 * @param codCel Code de la CEL (null pour désactiver le chargement automatique)
 * @returns État et fonctions pour gérer les données CEL
 */
export function useCelExcelData(codCel: string | null): UseCelExcelDataReturn {
    const [data, setData] = useState<CelExcelDataResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!codCel) {
            setData(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await legislativesApi.getCelExcelData(codCel);
            setData(result);
        } catch (err: unknown) {
            if (process.env.NODE_ENV === 'development') {
                console.error('❌ [useCelExcelData] Erreur lors de la récupération:', err);
            }

            let errorMessage = 'Erreur lors de la récupération des données';

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [codCel]);

    // Charger les données au montage si codCel est fourni
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}

