'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/api/upload';
import type { FileUploadZoneProps } from '@/types/upload';

export function FileUploadZone({ 
  selectedCel, 
  onFileSelect, 
  onValidation,
  disabled = false,
  acceptedTypes = ['.xlsx', '.xls', '.xlsm'],
  maxSize = 10 // MB
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion du drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 [FileUploadZone] Drag over détecté');
      }
    }
  }, [disabled]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
      console.log('🚀 [FileUploadZone] Drag enter détecté');
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Ne pas désactiver si on est encore dans la zone de drop
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
    if (process.env.NODE_ENV === 'development') {
      console.log('👋 [FileUploadZone] Drag leave détecté');
    }
  }, []);

  // Gestion de la sélection de fichier
  const handleFileSelect = useCallback((file: File) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 [FileUploadZone] Fichier sélectionné:', file.name, file.size, 'bytes');
    }
    
    if (!selectedCel) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [FileUploadZone] Aucune CEL sélectionnée');
      }
      setValidation({
        isValid: false,
        message: '❌ Veuillez d\'abord sélectionner une CEL'
      });
      return;
    }

    // Validation basique du fichier
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setValidation({
        isValid: false,
        message: `❌ Type de fichier non autorisé. Types acceptés: ${acceptedTypes.join(', ')}`
      });
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setValidation({
        isValid: false,
        message: `❌ Fichier trop volumineux. Taille maximale: ${maxSize}MB`
      });
      return;
    }

    setSelectedFile(file);
    
    // Validation du nom de fichier
    const normalizedFileName = file.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedCelName = selectedCel.libelleCellule.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const isValid = normalizedFileName.includes(normalizedCelName);
    const validationResult = {
      isValid,
      message: isValid 
        ? `✅ Nom fichier correspond à la CEL "${selectedCel.libelleCellule}"`
        : `❌ Nom fichier ne correspond pas à la CEL "${selectedCel.libelleCellule}"`
    };

    setValidation(validationResult);
    onFileSelect(file);
    onValidation(validationResult);
  }, [selectedCel, acceptedTypes, maxSize, onFileSelect, onValidation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 [FileUploadZone] Drop désactivé');
      }
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (process.env.NODE_ENV === 'development') {
      console.log('📁 [FileUploadZone] Fichiers déposés:', files.length, files.map(f => f.name));
    }
    
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <Label>Fichier Excel *</Label>
      
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          selectedFile && validation?.isValid && "border-green-500 bg-green-50",
          selectedFile && !validation?.isValid && "border-red-500 bg-red-50"
        )}
      >
        <CardContent className="p-6">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="text-center space-y-4"
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {validation?.isValid ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  )}
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                {validation && (
                  <div className={cn(
                    "text-sm p-2 rounded",
                    validation.isValid ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                  )}>
                    {validation.message}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={disabled}
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className={cn(
                  "h-12 w-12 mx-auto transition-colors",
                  isDragOver ? "text-primary" : "text-muted-foreground"
                )} />
                
                <div className="space-y-1">
                  <p className={cn(
                    "text-lg font-medium transition-colors",
                    isDragOver && "text-primary"
                  )}>
                    {isDragOver ? "Déposez le fichier ici" : "Glissez-déposez votre fichier ici"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou cliquez pour sélectionner
                  </p>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Types acceptés : {acceptedTypes.join(', ')}</p>
                  <p>Taille maximale : {maxSize}MB</p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleClickUpload}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner un fichier
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Sélectionner un fichier Excel"
      />
    </div>
  );
}
