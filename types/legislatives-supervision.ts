/**
 * Types pour la section Supervision des résultats législatifs
 * 
 * Base URL: /api/v1/legislatives/resultats/supervision
 */

// ============================================
// 1. Tableau de bord de supervision
// ============================================

export interface VueEnsemble {
  totalCirconscriptions: number;
  circonscriptionsPubliees: number;
  circonscriptionsEnAttente: number;
  tauxPublication: number; // Pourcentage
}

export interface RegionSupervision {
  codeRegion: string;
  libelleRegion: string;
  nombreCirconscriptions: number;
  tauxPublication: number; // Pourcentage
  celsEnAttente: number;
}

export type TypeAlerte = "ANOMALIE" | "RETARD" | "ERREUR";
export type PrioriteAlerte = "HAUTE" | "MOYENNE" | "BASSE";

export interface Alerte {
  type: TypeAlerte;
  message: string;
  codeCirconscription?: string;
  codeCel?: string;
  priorite: PrioriteAlerte;
}

export interface MetriquesPerformance {
  tempsMoyenPublication: number; // Minutes
  tauxErreur: number; // Pourcentage
  nombreImportsReussis: number;
  nombreImportsEchoues: number;
}

export interface HistoriqueEntry {
  date: string; // ISO 8601
  action: string;
  utilisateur: string;
  codeCirconscription?: string;
}

export interface SupervisionDashboardResponse {
  vueEnsemble: VueEnsemble;
  regions: RegionSupervision[];
  alertes: Alerte[];
  metriquesPerformance: MetriquesPerformance;
  historique: HistoriqueEntry[];
}

// ============================================
// 2. Détails d'une circonscription pour la supervision
// ============================================

export interface CirconscriptionSupervision {
  codeCirconscription: string;
  libelleCirconscription: string;
  statutPublication: string; // "0", "1", ou "C"
  nombreSieges: number;
}

export interface CandidatSupervision {
  numeroDossier: string;
  nom: string;
  parti: string;
  score: number;
  pourcentage: number;
  classement: number;
}

export interface ListeSupervision {
  intitule: string;
  score: number;
  pourcentage: number;
  nombreElus: number;
  classement: number;
}

export interface MetriquesCirconscription {
  inscrits: number;
  votants: number;
  participation: number;
  suffrageExprime: number;
  bulletinsNuls: number;
  bulletinsBlancs: number;
}

export interface CelSupervision {
  codeCel: string;
  libelleCel: string;
  statut: string; // "I", null, "PUBLISHED", "CANCELLED"
  nombreBureaux: number;
  tauxSaisie: number;
}

export interface HistoriquePublication {
  id: number;
  action: string; // Ex: "PUBLISH", "CANCEL"
  userId: string;
  details: string | null;
  timestamp: string; // ISO 8601
}

export interface SupervisionCirconscriptionResponse {
  circonscription: CirconscriptionSupervision;
  candidats?: CandidatSupervision[];
  listes?: ListeSupervision[];
  metriques: MetriquesCirconscription;
  cels: CelSupervision[];
  historique: HistoriquePublication[];
  logsActivite: any[]; // Actuellement vide (TODO)
}

// ============================================
// 3. Statistiques avancées pour la supervision
// ============================================

export interface StatistiquesSupervision {
  totalCirconscriptions: number;
  circonscriptionsPubliees: number;
  circonscriptionsEnAttente: number;
  tauxPublication: number; // Pourcentage
  totalCels: number;
  celsImportees: number;
  celsEnAttente: number;
}

export interface AnalysesSupervision {
  tauxParticipationMoyen: number; // Pourcentage
  tauxParticipationMin: number; // Pourcentage
  tauxParticipationMax: number; // Pourcentage
  circonscriptionsParRegion: Record<string, number>; // Ex: { "01": 10, "02": 8 }
}

export interface EvolutionPoint {
  date: string; // ISO 8601
  nombrePubliees?: number;
  nombreImports?: number;
}

export interface TendancesSupervision {
  evolutionPublication: EvolutionPoint[];
  evolutionImports: EvolutionPoint[];
}

export interface RapportsPerformance {
  tempsMoyenImport: number; // Minutes
  tempsMoyenPublication: number; // Minutes
  tauxReussiteImport: number; // Pourcentage
  tauxReussitePublication: number; // Pourcentage
}

export interface SupervisionStatsResponse {
  statistiques: StatistiquesSupervision;
  analyses: AnalysesSupervision;
  tendances: TendancesSupervision;
  rapports: RapportsPerformance;
}

// ============================================
// 4. Props pour les composants
// ============================================

export interface SupervisionDashboardProps {
  data: SupervisionDashboardResponse;
  onCirconscriptionClick?: (codeCirconscription: string) => void;
  onAlerteClick?: (alerte: Alerte) => void;
}

export interface SupervisionCirconscriptionDetailsProps {
  codeCirconscription: string;
  isOpen: boolean;
  onClose: () => void;
  isUser?: boolean;
}

export interface SupervisionStatsProps {
  data: SupervisionStatsResponse;
}

