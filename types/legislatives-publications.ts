// Types pour les publications des résultats législatives

// ============================================================================
// STATISTIQUES
// ============================================================================

export interface LegislativePublicationStats {
  totalCirconscriptions: number;
  publishedCirconscriptions: number;
  pendingCirconscriptions: number;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  publicationRate: number; // Pourcentage
}

// ============================================================================
// CIRCONSCRIPTION
// ============================================================================

export type PublicationStatus = "0" | "1" | "C"; // '0' = Non publié, '1' = Publié, 'C' = Annulé

export interface CirconscriptionCel {
  codeCel: string;
  libelleCel: string | null;
  etatResultat: string | null; // 'I', 'PUBLISHED', 'CANCELLED', etc.
}

export interface Circonscription {
  id: number;
  codeCirconscription: string; // COD_CE (ex: "004")
  libelleCirconscription: string | null;
  nombreSieges: number | null;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  publicationStatus: PublicationStatus;
  lastUpdate: Date | string;
  cels: CirconscriptionCel[];
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface CirconscriptionQuery {
  page?: number;
  limit?: number;
  statPub?: PublicationStatus; // '0' | '1' | 'C'
  search?: string; // Recherche par code ou libellé
  readyToPublish?: boolean; // Filtre pour les circonscriptions prêtes à être publiées
}

// ============================================================================
// RESPONSES
// ============================================================================

export interface CirconscriptionListResponse {
  circonscriptions: Circonscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicationActionResult {
  success: boolean;
  message: string;
  circonscription?: {
    codeCirconscription: string;
    libelleCirconscription: string | null;
    publicationStatus: PublicationStatus;
  };
  error?: string;
}

// ============================================================================
// DÉTAILS D'UNE CIRCONSCRIPTION
// ============================================================================

export interface PublicationHistoryEntry {
  id: number;
  action: string; // 'PUBLISH' ou 'CANCEL'
  userId: string;
  details: string | null;
  timestamp: Date | string;
}

export interface CirconscriptionDetails {
  id: string;
  codeCirconscription: string;
  libelleCirconscription: string | null;
  nombreSieges: number | null;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  publicationStatus: PublicationStatus;
  lastUpdate: Date | string;
  cels: CirconscriptionCel[];
  history: PublicationHistoryEntry[];
}

// ============================================================================
// DONNÉES AGRÉGÉES (⚠️ IMPORTANT pour USER)
// ============================================================================

export interface CandidateScore {
  numeroDossier: string; // NUM_DOS (ex: 'U-02108')
  nom: string;
  parti: string;
  score: number;
  pourcentage: number; // Pourcentage de voix
}

export interface CelAggregatedData {
  codeCel: string;
  libelleCel: string | null;
  inscrits: number;
  votants: number;
  participation: number; // Pourcentage
  nombreBureaux: number;
  candidats: CandidateScore[]; // Scores des candidats pour cette CEL
}

export interface CirconscriptionDataResponse {
  codeCirconscription: string;
  libelleCirconscription: string | null;
  inscrits: number;
  votants: number;
  participation: number; // Pourcentage
  nombreBureaux: number;
  candidats: CandidateScore[]; // Scores au niveau circonscription
  cels: CelAggregatedData[]; // ⚠️ Données agrégées par CEL (CRUCIAL pour USER)
}

// ============================================================================
// DONNÉES NATIONALES (ADMIN/SADMIN uniquement)
// ============================================================================

export interface NationalCirconscriptionData {
  codeCirconscription: string;
  libelleCirconscription: string | null;
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  publicationStatus: PublicationStatus | null;
}

export interface NationalCandidateData {
  numeroDossier: string;
  nom: string;
  parti: string;
  score: number; // Score total national
  pourcentage: number; // Pourcentage national
  scoresParCirconscription: Record<string, number>; // Scores par circonscription
}

export interface NationalDataResponse {
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  nombreCirconscriptions: number;
  circonscriptionsPubliees: number;
  circonscriptionsEnAttente: number;
  candidats: NationalCandidateData[];
  circonscriptions: NationalCirconscriptionData[];
}

// ============================================================================
// PROPS POUR COMPOSANTS
// ============================================================================

export interface LegislativesPublicationsPageContentProps {
  isUser?: boolean; // true pour USER, false pour ADMIN/SADMIN
  onPublicationSuccess?: () => void;
}

export interface CirconscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeCirconscription: string;
  isUser?: boolean; // true pour USER, false pour ADMIN/SADMIN
  publicationStatus?: PublicationStatus; // Statut de publication de la circonscription
  onPublish?: (codeCirconscription: string) => Promise<void>;
  onCancel?: (codeCirconscription: string) => Promise<void>;
}

export interface CirconscriptionFiltersProps {
  filters: CirconscriptionQuery;
  onFiltersChange: (filters: CirconscriptionQuery) => void;
  loading?: boolean;
}

export interface CirconscriptionsTableProps {
  circonscriptions: Circonscription[];
  loading?: boolean;
  isUser?: boolean; // true pour USER, false pour ADMIN/SADMIN
  onViewDetails?: (codeCirconscription: string) => void;
  onPublish?: (codeCirconscription: string) => Promise<void>;
  onCancel?: (codeCirconscription: string) => Promise<void>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
  };
}

export interface LegislativeStatsSectionProps {
  stats: LegislativePublicationStats | null;
  loading?: boolean;
}
