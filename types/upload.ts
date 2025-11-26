// Types pour l'API Upload de fichiers Excel

// Enum pour les statuts d'import (selon les spécifications backend)
export enum ImportStatus {
  N = 'N',  // En attente
  I = 'I',  // Importé
  P = 'P'   // Publié
}

// Interface pour les détails d'un import
export interface ImportDetails {
  headers: string[];
  colonnesMappees: Record<string, string>;
  lignesTraitees: number;
  lignesReussies: number;
  lignesEchouees: number;
}

// Interface pour les données d'un import (selon les spécifications backend)
export interface ImportData {
  id: string;
  codeCellule: string;
  nomFichier: string; // libelleCellule dans la réponse backend
  statutImport: ImportStatus; // 'I' ou 'P' → COMPLETED dans la réponse
  messageErreur?: string;
  dateImport: string;
  nombreLignesImportees: number; // Nombre de lieux de vote
  nombreLignesEnErreur: number;
  nombreBureauxVote: number; // Nombre de bureaux de vote
  details: ImportDetails;
  // ✨ NOUVEAU : Informations géographiques
  departement?: {
    codeDepartement: string;
    libelleDepartement: string;
  };
  region?: {
    codeRegion: string;
    libelleRegion: string;
  };
  // ✨ NOUVEAU : Informations de l'utilisateur qui a importé
  importePar?: {
    id: string;
    numeroUtilisateur: string;
    nom: string;
    prenom: string;
    email: string;
    nomComplet: string;
    role?: {
      code: string;
      libelle: string;
    };
  };
}

// Interface pour la réponse de liste d'imports
export interface ImportListResponse {
  imports: ImportData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour les statistiques d'imports (selon les spécifications backend)
export interface ImportStats {
  totalImports: number;        // Total des CELs
  importsReussis: number;      // CELs avec statut I ou P
  importsEnErreur: number;      // Pas d'erreurs au niveau CEL
  importsEnCours: number;       // CELs en attente (statut N)
  totalLignesImportees: number; // = importsReussis
  totalLignesEnErreur: number;
  tauxReussite: number;        // Pourcentage d'import
  importsParCel: Record<string, number>; // Non utilisé
  importsParStatut: {
    N: number;  // En attente
    I: number;  // Importé
    P: number;  // Publié
  };
}

// Interface suggérée par le backend pour les items d'import CEL
export interface CelImportItem {
  id: string;
  codeCellule: string;
  libelleCellule: string;
  statut: 'I' | 'P'; // Importé | Publié
  dateImport: Date;
  nombreLieuxVote: number;
  utilisateur?: {
    firstName: string;
    lastName: string;
  };
}

// Interface suggérée par le backend pour le dashboard
export interface CelStats {
  totalCels: number;
  celsImportees: number;    // I + P
  celsEnAttente: number;    // N
  tauxImport: number;       // Pourcentage
  repartitionParStatut: {
    N: number;  // Attente
    I: number;  // Importé
    P: number;  // Publié
  };
}

// Interface pour les filtres d'imports
export interface ImportFilters {
  page?: number;
  limit?: number;
  codeCellule?: string;
  statut?: ImportStatus;
  // ✨ NOUVEAU : Filtres géographiques
  codeRegion?: string;
  codeDepartement?: string;
}

// Interface pour les options d'upload
export interface UploadOptions {
  nomFichier?: string;
  nombreBv?: number;
}

// Interface pour les données du formulaire d'upload
export interface UploadFormData {
  cel: {
    codeCellule: string;
    libelleCellule: string;
  };
  file: File;
  nomFichier?: string;
  nombreBv?: number;
}

// Interface pour le résultat de validation
export interface ValidationResult {
  isValid: boolean;
  message: string;
  extractedCelName?: string;
  confidence?: number; // Niveau de confiance de la correspondance (0-100)
}

// Interface pour le progrès d'upload
export interface UploadProgress {
  isUploading: boolean;
  progress: number; // 0-100
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  error?: string;
}

// Interface pour les paramètres de requête d'upload
export interface UploadRequestParams {
  file: File;
  codeCellule: string;
  nomFichier?: string;
  nombreBv?: number;
}

// Interface pour la réponse d'upload
export interface UploadResponse {
  success: boolean;
  data?: ImportData;
  error?: string;
  message?: string;
}

// Types pour les composants React

// Props pour le sélecteur de CEL
export interface CelSelectorProps {
  onCelSelect: (cel: { codeCellule: string; libelleCellule: string } | null) => void;
  selectedCel: { codeCellule: string; libelleCellule: string } | null;
  placeholder?: string;
  disabled?: boolean;
}

// Props pour la zone d'upload de fichier
export interface FileUploadZoneProps {
  selectedCel: { codeCellule: string; libelleCellule: string } | null;
  onFileSelect: (file: File) => void;
  onValidation: (result: ValidationResult) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number; // en MB
}

// Props pour l'indicateur de validation
export interface ValidationIndicatorProps {
  validation: ValidationResult;
  fileName?: string;
  celName?: string;
}

// Props pour les cartes de statistiques
export interface StatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Props pour le tableau des imports
export interface ImportsTableProps {
  imports: ImportData[];
  loading?: boolean;
  onRefresh?: () => void;
  onViewDetails?: (importData: ImportData) => void;
  onDownload?: (importData: ImportData) => void;
  onDelete?: (importData: ImportData) => void;
}

// Props pour les filtres d'imports
export interface ImportFiltersProps {
  filters: ImportFilters;
  onFiltersChange: (filters: ImportFilters) => void;
  availableCels: { codeCellule: string; libelleCellule: string }[];
  loading?: boolean;
}

// Types utilitaires

// Type pour les erreurs d'upload
export interface UploadError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Type pour les métadonnées du fichier
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
}

// Type pour la configuration d'upload
export interface UploadConfig {
  maxFileSize: number; // en MB
  allowedTypes: string[];
  allowedExtensions: string[];
  validationRules: {
    requireCelSelection: boolean;
    validateFileName: boolean;
    minFileNameLength: number;
  };
}

// ✅ Constantes par défaut - UNIQUEMENT fichiers .xlsm
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10, // 10MB
  allowedTypes: [
    'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm UNIQUEMENT
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Fallback pour .xlsm
  ],
  allowedExtensions: ['.xlsm'], // ✅ UNIQUEMENT .xlsm
  validationRules: {
    requireCelSelection: true,
    validateFileName: true,
    minFileNameLength: 3
  }
};

// Types pour les hooks personnalisés

// Type pour le hook useUpload
export interface UseUploadReturn {
  uploadFile: (params: UploadRequestParams) => Promise<UploadResponse>;
  progress: UploadProgress;
  reset: () => void;
}

// Type pour le hook useImportStats
export interface UseImportStatsReturn {
  stats: ImportStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Type pour le hook useImports
export interface UseImportsReturn {
  imports: ImportData[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  filters: ImportFilters;
  setFilters: (filters: ImportFilters) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// Types pour les composants
export interface ImportFiltersProps {
  filters: ImportFilters;
  onFiltersChange: (filters: ImportFilters) => void;
  availableCels: { codeCellule: string; libelleCellule: string }[];
  loading?: boolean;
}

export interface ImportsTableProps {
  imports: ImportData[];
  loading?: boolean;
  onRefresh?: () => void;
  onViewDetails?: (importData: ImportData) => void;
  onDownload?: (importData: ImportData) => void;
  onDelete?: (importData: ImportData) => void;
}

export interface UploadFormData {
  cel: { codeCellule: string; libelleCellule: string };
  file: File;
  nomFichier?: string;
  nombreBv?: number;
}

// Types pour les détails de CEL
export interface CelData {
  id: string;
  codeCellule: string;
  ordre: string;
  referenceLieuVote: string;
  libelleLieuVote: string;
  numeroBureauVote: string;
  populationHommes: string;
  populationFemmes: string;
  populationTotale: string;
  personnesAstreintes: string;
  votantsHommes: string;
  votantsFemmes: string;
  totalVotants: string;
  tauxParticipation: string;
  bulletinsNuls: string;
  suffrageExprime: string;
  bulletinsBlancs: string;
  score1: string;
  score2: string;
  score3: string;
  score4: string;
  score5: string;
}

export interface CelMetrics {
  inscrits: {
    total: number;
    hommes: number;
    femmes: number;
  };
  votants: {
    total: number;
    hommes: number;
    femmes: number;
  };
  tauxParticipation: number;
  suffrageExprime: number;
}

export interface CelDataResponse {
  codeCellule: string;
  libelleCellule: string;
  totalBureaux: number;
  data: CelData[];
  metrics: CelMetrics;
}