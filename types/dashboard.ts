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
export interface RealtimeMetricsDto {
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
  timestamp: string;
  activiteRecente: {
    importsAujourdhui: number;
    publicationsAujourdhui: number;
    connexionsAujourdhui: number;
  };
  importsEnCours: {
    nombre: number;
    liste: ImportEnCoursDto[];
  };
  alertesCritiques: {
    celsEnErreurCritique: number;
    importsBloques: number;
    utilisateursInactifs: number;
    departementsNonPublies: number;
  };
  // Métriques des départements
  departements: {
    totalDepartements: number;
    departementsPubliés: number;
    departementsEnAttente: number;
    tauxPublication: number;
  };
}

// Types de support pour les métriques temps réel
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

// Types pour les réponses de rafraîchissement
export interface RefreshMetricsResponseDto {
  success: boolean;
  message: string;
  timestamp: string;
}