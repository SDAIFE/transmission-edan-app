// Types pour les métriques du dashboard - Conformes au backend

export interface DashboardStatsDto {
  totalCels: number;
  celsAvecImport: number;
  celsSansImport: number;
  tauxProgression: number;
  celsParStatut: {
    pending: number;
    imported: number;
    error: number;
    processing: number;
  };
  nombreErreurs: number;
  alertes: {
    celsSansImport: number;
    celsEnErreur: number;
    celsEnAttente: number;
  };
}

export interface UserDashboardStatsDto extends DashboardStatsDto {
  // Métriques spécifiques aux utilisateurs USER
  celsAssignees: number;
  celsAvecImportAssignees: number;
  celsSansImportAssignees: number;
  tauxProgressionPersonnel: number;
}

export interface AdminDashboardStatsDto extends DashboardStatsDto {
  // Métriques spécifiques aux administrateurs ADMIN/SADMIN
  // Structure identique à UserDashboardStatsDto pour l'instant
  // Peut être étendue selon les besoins spécifiques ADMIN/SADMIN
}

export interface SadminDashboardStatsDto extends DashboardStatsDto {
  // Métriques spécifiques aux super administrateurs SADMIN
  totalRegions: number;
  totalDepartements: number;
  totalUtilisateurs: number;
  utilisateursParRole: UtilisateurParRoleDto[];
  importsParJour: ImportParJourDto[];
}

// Types de support pour les métriques SADMIN
export interface UtilisateurParRoleDto {
  role: string;
  count: number;
}

export interface ImportParJourDto {
  date: string;
  nombreImports: number;
  nombrePublications: number;
}

export interface DashboardResponseDto {
  success: boolean;
  data: UserDashboardStatsDto | AdminDashboardStatsDto | SadminDashboardStatsDto;
  message?: string;
}

// Types pour les filtres de requête
export interface DashboardFiltersDto {
  userId?: string; // Pour filtrer par utilisateur spécifique
  dateFrom?: Date;
  dateTo?: Date;
  includeInactive?: boolean;
}

// Types pour les métriques en temps réel - Conformes au backend
// ✅ ADAPTATION : Structure selon la réponse réelle du backend
export interface RealtimeMetricsDto {
  // Métriques de base (communes à tous les rôles)
  totalCels: number;
  celsAvecImport: number;
  celsSansImport: number;
  tauxProgression?: number; // Pour ADMIN/SADMIN
  tauxProgressionPersonnel?: number; // Pour USER
  celsParStatut: {
    pending: number;
    imported: number;
    error: number;
    processing: number;
  };
  nombreErreurs: number;
  alertes: {
    celsSansImport: number;
    celsEnErreur: number;
    celsEnAttente: number;
  };
  timestamp: string;

  // ✅ ADAPTATION : Structure selon la réponse réelle
  activiteRecente: {
    imports24h: number; // Pour USER
    importsAujourdhui?: number; // Pour ADMIN/SADMIN (compatibilité)
    publicationsAujourdhui?: number; // Pour ADMIN/SADMIN
    connexionsAujourdhui?: number; // Pour ADMIN/SADMIN
    timestamp: string;
  };

  // ✅ ADAPTATION : Structure selon la réponse réelle
  importsEnCours: {
    count: number; // Nombre d'imports en cours
    imports: ImportEnCoursRealtimeDto[]; // Liste des imports
    nombre?: number; // Ancien format (compatibilité)
    liste?: ImportEnCoursDto[]; // Ancien format (compatibilité)
  };

  // ✅ ADAPTATION : Structure selon la réponse réelle
  alertesCritiques: {
    importsErreur: number; // Pour USER
    timestamp: string;
    // Pour ADMIN/SADMIN (optionnel)
    celsEnErreurCritique?: number;
    importsBloques?: number;
    utilisateursInactifs?: number;
    departementsNonPublies?: number;
  };

  // ✅ ADAPTATION : Métriques spécifiques USER
  celsAssignees?: number; // USER uniquement
  celsAvecImportAssignees?: number; // USER uniquement
  celsSansImportAssignees?: number; // USER uniquement
  dernierImport?: string; // USER uniquement (ISO string)

  // ✅ ADAPTATION : Métriques spécifiques ADMIN/SADMIN
  totalRegions?: number; // ADMIN/SADMIN uniquement
  totalCirconscriptions?: number; // ADMIN/SADMIN uniquement
  totalUtilisateurs?: number; // ADMIN/SADMIN uniquement
  utilisateursParRole?: UtilisateurParRoleDto[]; // ADMIN/SADMIN uniquement
  importsParJour?: ImportParJourRealtimeDto[]; // ADMIN/SADMIN uniquement
  circonscriptionsAssignees?: number; // ADMIN/SADMIN uniquement
  utilisateursActifs?: number; // ADMIN/SADMIN uniquement
  celsParCirconscription?: CelsParCirconscriptionDto[]; // ADMIN/SADMIN uniquement

  // ✅ ADAPTATION : Métriques départements (optionnel selon le rôle)
  departements?: {
    totalDepartements: number;
    departementsPubliés: number;
    departementsEnAttente: number;
    tauxPublication: number;
  };
}

// Types de support pour les métriques temps réel
// ✅ ADAPTATION : Structure selon la réponse réelle du backend
export interface ImportEnCoursRealtimeDto {
  id: number;
  COD_CE: string; // Code circonscription
  NOM_FICHIER: string;
  STATUT_IMPORT: string; // PROCESSING, PENDING, etc.
  DATE_IMPORT: string; // ISO string
}

// ✅ ADAPTATION : Ancien format pour compatibilité
export interface ImportEnCoursDto {
  codeCellule: string;
  nomFichier: string;
  dateImport: string;
  utilisateur: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// ✅ ADAPTATION : Nouveau type pour imports par jour (temps réel)
export interface ImportParJourRealtimeDto {
  date: string; // Format YYYY-MM-DD
  nombreImports: number;
  nombreReussis: number;
  nombreEchoues: number;
  nombrePublications?: number; // Ancien format (compatibilité)
}

// ✅ ADAPTATION : Type pour les CELs par circonscription
export interface CelsParCirconscriptionDto {
  COD_CE: string;
  LIB_CE: string;
  totalCels: number;
  celsAvecImport: number;
  tauxProgression: number;
}

// Types pour les réponses de rafraîchissement
export interface RefreshMetricsResponseDto {
  success: boolean;
  message: string;
  timestamp: string;
}