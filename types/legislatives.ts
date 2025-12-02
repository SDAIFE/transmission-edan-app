// Types pour l'API Élections Législatives - Upload et Visualisation

// ============================================
// TYPES POUR L'UPLOAD DE FICHIER EXCEL
// ============================================

/**
 * Réponse de l'upload de fichier Excel législatives
 */
export interface LegislativesUploadResponse {
    importId: number;
    codCel: string;
    codCe: string;
    nombreBureauxTraites: number;
    nombreCandidats: number;
    statut: 'SUCCESS' | 'PARTIAL' | 'ERROR';
    message: string;
    dateImport: string;
}

/**
 * Paramètres pour l'upload de fichier Excel législatives
 */
export interface LegislativesUploadParams {
    file: File;
    codCel: string;
}

/**
 * Progression de l'upload
 */
export interface LegislativesUploadProgress {
    isUploading: boolean;
    progress: number; // 0-100
    status: 'idle' | 'uploading' | 'success' | 'error';
    message?: string;
    error?: string;
}

/**
 * Réponse de l'upload avec gestion d'erreur
 */
export interface LegislativesUploadResult {
    success: boolean;
    data?: LegislativesUploadResponse;
    error?: string;
    message?: string;
}

// ============================================
// TYPES POUR L'AFFICHAGE DES DONNÉES CEL
// ============================================

/**
 * Candidat dans les données CEL
 */
export interface CelCandidat {
    numDos: string;
    nom: string;
}

/**
 * Ligne de données d'un bureau de vote
 */
export interface CelDataRow {
    COD_CE: string;
    COD_CEL: string;
    ORD: number;
    REF_LV: string;
    LIB_LV: string;
    NUMERO_BV: string;
    POP_HOM: number;
    POP_FEM: number;
    POP_TOTAL: number;
    VOT_HOM: number;
    VOT_FEM: number;
    TOTAL_VOT: number;
    TAUX_PART: number;
    BUL_NUL: number;
    SUF_EXP: number;
    BUL_BLANC: number;
    // Colonnes dynamiques : une par candidat avec NUM_DOS comme clé
    [key: string]: string | number; // Ex: "U-02108": 10
}

/**
 * Réponse complète des données CEL au format Excel
 */
export interface CelExcelDataResponse {
    codCel: string;
    libCel: string;
    codCe: string;
    libCe: string | null;
    candidats: CelCandidat[];
    data: CelDataRow[];
}

// ============================================
// TYPES POUR LES HOOKS
// ============================================

/**
 * Retour du hook useUploadLegislativesExcel
 */
export interface UseUploadLegislativesExcelReturn {
    uploadExcel: (params: LegislativesUploadParams) => Promise<LegislativesUploadResult>;
    loading: boolean;
    error: string | null;
    progress: number;
    reset: () => void;
}

/**
 * Retour du hook useCelExcelData
 */
export interface UseCelExcelDataReturn {
    data: CelExcelDataResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// ============================================
// TYPES POUR LES COMPOSANTS
// ============================================

/**
 * Props pour le composant d'upload législatives
 */
export interface LegislativesUploadFormProps {
    onUploadSuccess?: (result: LegislativesUploadResponse) => void;
    onUploadError?: (error: string) => void;
}

/**
 * Props pour le composant d'affichage des données CEL
 */
export interface CelExcelDataTableProps {
    codCel: string;
    onExport?: () => void;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Configuration par défaut pour l'upload
 */
export const LEGISLATIVES_UPLOAD_CONFIG = {
    maxFileSize: 10, // 10MB
    allowedTypes: [
        'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx (fallback)
    ],
    allowedExtensions: ['.xlsm', '.xlsx'],
} as const;

/**
 * Colonnes fixes dans les données CEL
 */
export const CEL_FIXED_COLUMNS = [
    'COD_CE',
    'COD_CEL',
    'ORD',
    'REF_LV',
    'LIB_LV',
    'NUMERO_BV',
    'POP_HOM',
    'POP_FEM',
    'POP_TOTAL',
    'VOT_HOM',
    'VOT_FEM',
    'TOTAL_VOT',
    'TAUX_PART',
    'BUL_NUL',
    'SUF_EXP',
    'BUL_BLANC',
] as const;

