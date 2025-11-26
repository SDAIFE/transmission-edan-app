// Types pour la page Publications

// Enum pour les types d'entités publiables
export enum EntityType {
  DEPARTMENT = 'DEPARTMENT',  // Département
  COMMUNE = 'COMMUNE'         // Commune d'Abidjan
}

// Enum pour les statuts de publication
export enum PublicationStatus {
  PUBLISHED = 'PUBLISHED',    // Publiée
  CANCELLED = 'CANCELLED',    // Annulée
  PENDING = 'PENDING'         // En attente
}

// Interface pour les statistiques des départements
export interface DepartmentStats {
  totalDepartments: number;        // Nombre total de départements
  publishedDepartments: number;    // Départements publiés
  pendingDepartments: number;      // Départements en attente
  totalCels: number;              // Total des CELs
  importedCels: number;           // CELs importées (I + P)
  pendingCels: number;            // CELs en attente (N)
  publicationRate: number;        // Taux de publication (%)
}

// Interface pour les données d'un département (ancienne version - conservée pour compatibilité)
export interface DepartmentData {
  id: string;
  codeDepartement: string;
  libelleDepartement: string;
  totalCels: number;              // Nombre total de CELs dans le département
  importedCels: number;           // Nombre de CELs importées (I + P)
  pendingCels: number;            // Nombre de CELs en attente (N)
  publicationStatus: PublicationStatus;
  lastUpdate: string;             // Date de dernière mise à jour
  cels: {                        // Détails des CELs du département
    codeCellule: string;
    libelleCellule: string;
    statut: 'N' | 'I' | 'P';
    dateImport?: string;
  }[];
}

// Interface pour les données d'une CEL
export interface CelData {
  codeCellule: string;
  libelleCellule: string;
  statut: 'N' | 'I' | 'P';
  dateImport?: string;
  nombreLignesImportees?: number;
}

// Interface pour une entité publiable (département ou commune)
export interface PublishableEntity {
  id: string;                                  // ID unique de l'entité
  code: string;                                // "001" pour département, "022-001-004" pour commune (format 3 parties RECOMMANDÉ)
  libelle: string;                             // "AGBOVILLE" ou "ABIDJAN - COCODY"
  type: EntityType;                            // Type d'entité (DEPARTMENT ou COMMUNE)
  totalCels: number;                           // Nombre total de CELs
  importedCels: number;                        // CELs déjà importées
  pendingCels: number;                         // CELs en attente
  publicationStatus: PublicationStatus;        // Statut de publication
  lastUpdate: string;                          // ISO date de dernière mise à jour
  cels: CelData[];                            // Liste des CELs
  
  // Champs optionnels (uniquement pour les communes)
  codeDepartement?: string;                    // "022" pour les communes d'Abidjan
  codeSousPrefecture?: string;                 // Ex: "001" pour la sous-préfecture principale
  codeCommune?: string;                        // Ex: "004" pour COCODY
}

// Interface pour la réponse de liste des départements (ancienne version - conservée pour compatibilité)
export interface DepartmentListResponse {
  departments: DepartmentData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour la réponse de liste des entités publiables (nouvelle version)
export interface EntityListResponse {
  entities: PublishableEntity[];  // Mix de départements et communes
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour les filtres des départements (ancienne version)
export interface DepartmentFilters {
  page?: number;
  limit?: number;
  codeDepartement?: string;
  publicationStatus?: PublicationStatus;
  search?: string;
}

// Interface pour les filtres des entités (nouvelle version)
export interface EntityFilters {
  page?: number;
  limit?: number;
  codeDepartement?: string;         // Filtre par département (ex: "022" pour communes d'Abidjan)
  publicationStatus?: PublicationStatus;
  search?: string;
  type?: EntityType;                // Filtre par type (DEPARTMENT ou COMMUNE)
}

// Props pour les composants

// Props pour le header de la page publications
export interface PublicationsPageHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
  isUser?: boolean;
}

// Props pour le contenu de la page publications
export interface PublicationsPageContentProps {
  onPublicationSuccess?: () => void;
  isUser?: boolean;
}

// Props pour la section statistiques
export interface PublicationsStatsSectionProps {
  stats: DepartmentStats | null;
  loading: boolean;
}

// Props pour les cartes de statistiques
export interface PublicationsStatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Props pour le tableau des départements
export interface DepartmentsTableProps {
  departments: DepartmentData[];
  loading?: boolean;
  onRefresh?: () => void;
  onPublish?: (department: DepartmentData) => Promise<void>;
  onCancel?: (department: DepartmentData) => Promise<void>;
  onViewDetails?: (department: DepartmentData) => void;
  // Pagination
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  // Filtres
  filters?: DepartmentFilters;
  onFiltersChange?: (filters: DepartmentFilters) => void;
  // Adaptation des termes selon le rôle
  isUser?: boolean;
}

// Props pour les filtres des départements
export interface DepartmentFiltersProps {
  filters: DepartmentFilters;
  onFiltersChange: (filters: DepartmentFilters) => void;
  loading?: boolean;
}

// Props pour le tableau des entités publiables (nouvelle version)
export interface EntitiesTableProps {
  entities: PublishableEntity[];
  loading?: boolean;
  onRefresh?: () => void;
  onPublish?: (entity: PublishableEntity) => Promise<void>;
  onCancel?: (entity: PublishableEntity) => Promise<void>;
  onViewDetails?: (entity: PublishableEntity) => void;
  // Pagination
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  // Filtres
  filters?: EntityFilters;
  onFiltersChange?: (filters: EntityFilters) => void;
  // Adaptation des termes selon le rôle
  isUser?: boolean;
}

// Props pour les filtres des entités (nouvelle version)
export interface EntityFiltersProps {
  filters: EntityFilters;
  onFiltersChange: (filters: EntityFilters) => void;
  loading?: boolean;
}

// Types pour les actions de publication
export interface PublicationAction {
  type: 'PUBLISH' | 'CANCEL';
  departmentId: string;
  departmentName: string;
}

// Interface pour le résultat d'une action de publication
export interface PublicationActionResult {
  success: boolean;
  message: string;
  department?: DepartmentData;
  error?: string;
}

// Types pour les hooks personnalisés

// Type pour le hook useDepartmentStats
export interface UseDepartmentStatsReturn {
  stats: DepartmentStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Type pour le hook useDepartments
export interface UseDepartmentsReturn {
  departments: DepartmentData[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  filters: DepartmentFilters;
  setFilters: (filters: DepartmentFilters) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// Type pour le hook usePublications (ancienne version)
export interface UsePublicationsReturn {
  publishDepartment: (departmentId: string) => Promise<PublicationActionResult>;
  cancelPublication: (departmentId: string) => Promise<PublicationActionResult>;
  loading: boolean;
  error: string | null;
}

// Interface pour les actions sur les entités
export interface EntityAction {
  type: 'PUBLISH' | 'CANCEL';
  entityId: string;
  entityType: EntityType;
  entityName: string;
}

// Interface pour le résultat d'une action sur une entité
export interface EntityActionResult {
  success: boolean;
  message: string;
  entity?: PublishableEntity;
  error?: string;
}

// Type pour le hook useEntities (nouvelle version)
export interface UseEntitiesReturn {
  entities: PublishableEntity[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  filters: EntityFilters;
  setFilters: (filters: EntityFilters) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  publishEntity: (entity: PublishableEntity) => Promise<EntityActionResult>;
  cancelEntity: (entity: PublishableEntity) => Promise<EntityActionResult>;
}

// Types pour les détails de département (API /api/publications/departments/:codeDepartement/data)

// Interface pour les données agrégées d'une CEL dans un département
export interface CelAggregatedData {
  codeCellule: string;
  libelleCellule: string;
  populationHommes: number;
  populationFemmes: number;
  populationTotale: number;
  personnesAstreintes: number;
  votantsHommes: number;
  votantsFemmes: number;
  totalVotants: number;
  tauxParticipation: number;
  bulletinsNuls: number;
  suffrageExprime: number;
  bulletinsBlancs: number;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
  nombreBureaux: number;
}

// Interface pour les données agrégées d'un département
export interface DepartmentAggregatedData {
  codeDepartement: string;
  libelleDepartement: string;
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  cels: CelAggregatedData[];
}

// Interface pour la réponse de l'API des détails de département
export interface DepartmentDataResponse {
  departments?: DepartmentAggregatedData[]; // Pour les départements
  entities?: DepartmentAggregatedData[]; // Pour les communes d'Abidjan
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Props pour la modal de détails de département (ancienne version)
export interface DepartmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentData: DepartmentData | null;
  onPublish?: (department: DepartmentData) => Promise<void>;
  onCancel?: (department: DepartmentData) => Promise<void>;
  isUser?: boolean;
}

// Props pour la modal de détails d'une entité (nouvelle version)
export interface EntityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: PublishableEntity | null;
  onPublish?: (entity: PublishableEntity) => Promise<void>;
  onCancel?: (entity: PublishableEntity) => Promise<void>;
  isUser?: boolean;
}

// Interface pour les détails d'une commune
export interface CommuneDetails {
  commune: {
    id: string;
    codeCommune: string;
    libelleCommune: string;
    codeDepartement: string;
    totalCels: number;
    importedCels: number;
    pendingCels: number;
    publicationStatus: PublicationStatus;
    lastUpdate: string;
  };
  cels: CelData[];
  history: PublicationHistoryEntry[];
}

// Interface pour les détails d'un département
export interface DepartmentDetails {
  department: {
    id: string;
    codeDepartement: string;
    libelleDepartement: string;
    totalCels: number;
    importedCels: number;
    pendingCels: number;
    publicationStatus: PublicationStatus;
    lastUpdate: string;
  };
  cels: CelData[];
  history: PublicationHistoryEntry[];
}

// Interface pour l'historique de publication
export interface PublicationHistoryEntry {
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}