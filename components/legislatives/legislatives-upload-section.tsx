"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Hooks et API
import { useUploadLegislativesExcel } from "@/hooks/use-legislatives";
import { useSimpleLists } from "@/hooks/useSimpleLists";
import type { LegislativesUploadResponse } from "@/types/legislatives";
import { LEGISLATIVES_UPLOAD_CONFIG } from "@/types/legislatives";

interface LegislativesUploadSectionProps {
  onUploadSuccess?: (result: LegislativesUploadResponse) => void;
  onUploadError?: (error: string) => void;
}

export function LegislativesUploadSection({
  onUploadSuccess,
  onUploadError,
}: LegislativesUploadSectionProps) {
  // États pour l'upload
  const [selectedCodCel, setSelectedCodCel] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Hooks
  const { uploadExcel, loading, error, progress, reset } =
    useUploadLegislativesExcel();
  const { cels, loading: celsLoading } = useSimpleLists();

  // Gestion de la sélection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }

    // Validation du type de fichier
    const allowedTypes = LEGISLATIVES_UPLOAD_CONFIG.allowedTypes;
    const isValidType =
      allowedTypes.includes(file.type as (typeof allowedTypes)[number]) ||
      file.name.endsWith(".xlsm") ||
      file.name.endsWith(".xlsx");

    if (!isValidType) {
      setFileError(
        "Type de fichier invalide. Seuls les fichiers .xlsm et .xlsx sont acceptés."
      );
      setSelectedFile(null);
      return;
    }

    // Validation de la taille (10MB max)
    const maxSize = LEGISLATIVES_UPLOAD_CONFIG.maxFileSize * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(
        `Le fichier est trop volumineux. Taille maximale : ${LEGISLATIVES_UPLOAD_CONFIG.maxFileSize}MB`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError(null);
  };

  // Gestion de l'upload
  const handleUpload = async () => {
    if (!selectedCodCel || !selectedFile) {
      toast.error("Veuillez sélectionner une CEL et un fichier");
      return;
    }

    try {
      const loadingToast = toast.loading(
        "Upload en cours... Cela peut prendre quelques instants."
      );

      const result = await uploadExcel({
        file: selectedFile,
        codCel: selectedCodCel,
      });

      toast.dismiss(loadingToast);

      if (result.success && result.data) {
        toast.success(
          `Upload réussi ! ${result.data.nombreBureauxTraites} bureaux traités, ${result.data.nombreCandidats} candidats détectés.`
        );

        // Réinitialiser le formulaire
        setSelectedCodCel("");
        setSelectedFile(null);
        setFileError(null);
        reset();

        // Notifier le parent du succès
        onUploadSuccess?.(result.data);
      } else {
        const errorMessage = result.error || "Erreur lors de l'upload";
        toast.error(errorMessage);
        onUploadError?.(errorMessage);
      }
    } catch (err: unknown) {
      toast.dismiss();
      console.error(
        "❌ [LegislativesUploadSection] Erreur lors de l'upload:",
        err
      );

      let errorMessage = "Erreur lors de l'upload du fichier";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    }
  };

  const isFormValid = selectedCodCel && selectedFile && !fileError;
  const selectedCel = cels.find((cel) => cel.codeCellule === selectedCodCel);

  return (
    <div className="space-y-6">
      {/* Sélection de la CEL */}
      <div className="space-y-2">
        <Label htmlFor="codCel">Code CEL *</Label>
        <Select
          value={selectedCodCel}
          onValueChange={setSelectedCodCel}
          disabled={loading || celsLoading}
        >
          <SelectTrigger id="codCel">
            <SelectValue placeholder="Sélectionner une CEL" />
          </SelectTrigger>
          <SelectContent>
            {cels.map((cel) => (
              <SelectItem key={cel.codeCellule} value={cel.codeCellule}>
                {cel.codeCellule} - {cel.libelleCellule}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCel && (
          <p className="text-sm text-muted-foreground">
            CEL sélectionnée : {selectedCel.libelleCellule}
          </p>
        )}
      </div>

      {/* Upload de fichier */}
      <div className="space-y-2">
        <Label htmlFor="excelFile">Fichier Excel (.xlsm ou .xlsx) *</Label>
        <Input
          id="excelFile"
          type="file"
          accept=".xlsm,.xlsx"
          onChange={handleFileChange}
          disabled={loading}
        />
        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            <p>Fichier sélectionné : {selectedFile.name}</p>
            <p>Taille : {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
        {fileError && <p className="text-sm text-red-600">{fileError}</p>}
      </div>

      {/* Barre de progression */}
      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Upload en cours...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Messages d'erreur */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            <span className="font-medium">Erreur :</span> {error}
          </p>
        </div>
      )}

      {/* Bouton d'upload */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handleUpload}
          disabled={!isFormValid || loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Upload en cours...
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
