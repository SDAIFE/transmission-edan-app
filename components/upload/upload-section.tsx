'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

// Composants upload
import { CelSelector } from './cel-selector';
import { FileUploadZone } from './file-upload-zone';

// Hooks et types
import { useUpload } from '@/hooks/use-upload';
import type { 
  UploadFormData,
  ValidationResult
} from '@/types/upload';

interface UploadSectionProps {
  onUploadSuccess?: () => void;
}

export function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  // États pour l'upload
  const [selectedCel, setSelectedCel] = useState<{ codeCellule: string; libelleCellule: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [nomFichier, setNomFichier] = useState('');
  const [nombreBv, setNombreBv] = useState<number | undefined>();

  // Hook d'upload
  const { progress, uploadFile, validateFile, reset } = useUpload();

  // Gestion de la sélection de fichier
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (selectedCel) {
      const validationResult = validateFile(file, selectedCel.libelleCellule);
      setValidation(validationResult);
    }
  };

  // Gestion de la validation
  const handleValidation = (result: ValidationResult) => {
    setValidation(result);
  };

  // Gestion de l'upload
  const handleUpload = async () => {
    if (!selectedCel || !selectedFile || !validation?.isValid) {
      toast.error('Veuillez sélectionner une CEL et un fichier valide');
      return;
    }

    try {
      // ✅ SÉCURITÉ : Vérifier le token AVANT l'upload
      const { ensureValidToken } = await import('@/lib/utils/session-helper');
      const tokenCheck = await ensureValidToken();
      
      if (!tokenCheck.isValid) {
        toast.error(tokenCheck.message || 'Session expirée. Veuillez vous reconnecter.', {
          duration: 5000,
        });
        
        // Sauvegarder les données du formulaire avant redirection
        const { saveFormData } = await import('@/lib/utils/session-helper');
        saveFormData('upload-form', {
          codeCellule: selectedCel.codeCellule,
          fileName: selectedFile.name,
          nomFichier,
          nombreBv,
        });
        
        // Redirection vers login après 2 secondes
        setTimeout(() => {
          window.location.href = '/auth/login?redirect=/upload&reason=session_expired';
        }, 2000);
        
        return;
      }
      
      // ✅ Message de patience pour l'utilisateur
      const loadingToast = toast.loading('Upload et traitement en cours... Cela peut prendre jusqu\'à 3 minutes.');

      const uploadData: UploadFormData = {
        cel: selectedCel,
        file: selectedFile,
        nomFichier: nomFichier || undefined,
        nombreBv: nombreBv || undefined
      };

      const result = await uploadFile({
        file: uploadData.file,
        codeCellule: uploadData.cel.codeCellule,
        nomFichier: uploadData.nomFichier,
        nombreBv: uploadData.nombreBv
      });

      // ✅ Fermer le toast de chargement
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success('Fichiers uploadés et traités avec succès !');
        
        // Réinitialiser le formulaire
        setSelectedCel(null);
        setSelectedFile(null);
        setValidation(null);
        setNomFichier('');
        setNombreBv(undefined);
        reset();
        
        // Notifier le parent du succès
        onUploadSuccess?.();
      } else {
        // Gestion des erreurs du hook useUpload
        const errorMessage = result.error || 'Erreur lors de l\'upload';
        toast.error(errorMessage);
        console.error('❌ [UploadSection] Erreur d\'upload:', result.error);
      }
    } catch (error: unknown) {
      // ✅ Fermer le toast de chargement en cas d'erreur
      toast.dismiss();
      
      console.error('❌ [UploadSection] Erreur lors de l\'upload:', error);
      
      // Gestion détaillée des erreurs
      let errorMessage = 'Erreur lors de l\'upload du fichier';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Messages d'erreur spécifiques selon le type
        if (error.message.includes('Erreur serveur')) {
          errorMessage = `Erreur serveur: ${error.message}`;
        } else if (error.message.includes('Erreur de connexion')) {
          errorMessage = 'Problème de connexion. Vérifiez votre réseau.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Le fichier est trop volumineux ou la connexion est lente.';
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
          {/* Sélection de la CEL */}
          <CelSelector
            onCelSelect={setSelectedCel}
            selectedCel={selectedCel}
            disabled={progress.isUploading}
          />

          {/* Upload de fichier */}
          <FileUploadZone
            selectedCel={selectedCel}
            onFileSelect={handleFileSelect}
            onValidation={handleValidation}
            disabled={progress.isUploading}
          />

          {/* Champs optionnels */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomFichier">Nom personnalisé (optionnel)</Label>
              <Input
                id="nomFichier"
                placeholder="Nom du fichier..."
                value={nomFichier}
                onChange={(e) => setNomFichier(e.target.value)}
                disabled={progress.isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombreBv">Nombre de BV attendus (optionnel)</Label>
              <Input
                id="nombreBv"
                type="number"
                placeholder="Nombre de bureaux de vote..."
                value={nombreBv || ''}
                onChange={(e) => setNombreBv(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={progress.isUploading}
              />
            </div>
          </div> */}

          {/* Messages de validation et d'erreur */}
          <div className="space-y-2">
            {validation && (
              <div className={`flex items-center gap-1 text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.isValid ? '✅' : '❌'} {validation.message}
              </div>
            )}
            
            {progress.status === 'error' && progress.error && (
              <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                <span className="font-medium">❌ Erreur:</span> {progress.error}
              </div>
            )}
          </div>

          {/* Bouton d'upload */}
          <div className="flex items-center justify-end">
            <Button
              onClick={handleUpload}
              disabled={!selectedCel || !selectedFile || !validation?.isValid || progress.isUploading}
              className="flex items-center gap-2"
            >
              {progress.isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Upload en cours... ({progress.progress}%)
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Uploader le fichier
                </>
              )}
            </Button>
          </div>
    </div>
  );
}
