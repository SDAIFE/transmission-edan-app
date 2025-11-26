import { useState, useCallback } from 'react';
import { uploadApi, validateFileType, validateFileSize, validateFileName } from '@/lib/api/upload';
import type { 
  UploadRequestParams, 
  UploadProgress, 
  ValidationResult,
  UploadResponse
} from '../types/upload';
import { DEFAULT_UPLOAD_CONFIG } from '../types/upload';

// Hook personnalisé pour gérer l'upload de fichiers
export function useUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    status: 'idle'
  });

  // ✅ Fonction pour valider un fichier (UNIQUEMENT .xlsm)
  const validateFile = useCallback((
    file: File, 
    celName: string,
    config = DEFAULT_UPLOAD_CONFIG
  ): ValidationResult => {
    // ✅ Validation stricte : UNIQUEMENT .xlsm
    if (!file.name.endsWith('.xlsm')) {
      return {
        isValid: false,
        message: `❌ Type de fichier non autorisé. Seuls les fichiers .xlsm sont acceptés`,
        confidence: 0
      };
    }

    // Valider le type de fichier
    if (!validateFileType(file, config.allowedTypes)) {
      return {
        isValid: false,
        message: `❌ Type de fichier non autorisé. Seuls les fichiers .xlsm sont acceptés`,
        confidence: 0
      };
    }

    // Valider la taille du fichier
    if (!validateFileSize(file, config.maxFileSize)) {
      return {
        isValid: false,
        message: `❌ Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Taille maximale: ${config.maxFileSize}MB`,
        confidence: 0
      };
    }

    // Valider le nom du fichier si activé
    if (config.validationRules.validateFileName) {
      return validateFileName(file.name, celName);
    }

    return {
      isValid: true,
      message: '✅ Fichier .xlsm valide',
      confidence: 100
    };
  }, []);

  // ✅ Fonction pour uploader un fichier (.xlsm + CSV)
  const uploadFile = useCallback(async (params: UploadRequestParams): Promise<UploadResponse> => {
    try {
      setProgress({
        isUploading: true,
        progress: 0,
        status: 'uploading',
        message: 'Préparation de l\'upload...'
      });

      // Progression : Conversion
      setProgress(prev => ({
        ...prev,
        progress: 20,
        message: 'Conversion Excel (.xlsm) vers CSV...'
      }));

      // Progression : Validation
      setProgress(prev => ({
        ...prev,
        progress: 40,
        message: 'Validation du code CEL...'
      }));

      const result = await uploadApi.uploadExcel(params);

      // Progression : Envoi
      setProgress(prev => ({
        ...prev,
        progress: 70,
        message: 'Envoi des fichiers au serveur...'
      }));

      setProgress({
        isUploading: false,
        progress: 100,
        status: 'success',
        message: 'Fichiers uploadés avec succès'
      });

      return {
        success: true,
        data: result,
        message: 'Fichiers uploadés avec succès'
      };

    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useUpload] Erreur lors de l\'upload:', error);
      }
      
      // Gestion détaillée des erreurs
      let errorMessage = 'Erreur lors de l\'upload';
      let userFriendlyMessage = 'Erreur lors de l\'upload du fichier';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Messages d'erreur spécifiques pour l'utilisateur
        if (error.message.includes('Erreur de conversion')) {
          userFriendlyMessage = 'Erreur lors de la conversion du fichier Excel. Vérifiez le format du fichier.';
        } else if (error.message.includes('expiré après 30 secondes') || error.message.includes('timeout')) {
          userFriendlyMessage = '⚠️ Le traitement prend plus de temps que prévu. Vérifiez dans la liste des imports si le fichier a bien été traité.';
        } else if (error.message.includes('Erreur serveur (500)')) {
          userFriendlyMessage = '⚠️ Timeout du serveur. Le traitement est peut-être en cours. Vérifiez la liste des imports dans quelques secondes.';
        } else if (error.message.includes('Erreur de connexion')) {
          userFriendlyMessage = 'Problème de connexion. Vérifiez votre réseau.';
        } else if (error.message.includes('413')) {
          userFriendlyMessage = 'Le fichier est trop volumineux.';
        } else if (error.message.includes('415')) {
          userFriendlyMessage = 'Type de fichier non supporté.';
        } else if (error.message.includes('400')) {
          userFriendlyMessage = 'Données invalides. Vérifiez votre sélection.';
        } else {
          userFriendlyMessage = error.message;
        }
      }
      
      setProgress({
        isUploading: false,
        progress: 0,
        status: 'error',
        error: errorMessage,
        message: 'Échec de l\'upload'
      });

      return {
        success: false,
        error: userFriendlyMessage,
        message: userFriendlyMessage
      };
    }
  }, []);

  // Fonction pour réinitialiser le progrès
  const reset = useCallback(() => {
    setProgress({
      isUploading: false,
      progress: 0,
      status: 'idle'
    });
  }, []);

  return {
    progress,
    uploadFile,
    validateFile,
    reset
  };
}
