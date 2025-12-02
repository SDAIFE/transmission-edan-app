/**
 * Types pour les résultats électoraux
 */

// Types de base pour les résultats de vote
export interface VoteResult {
  candidateId: string;
  votes: number;
  percentage: number;
}

// Types pour les totaux
export interface ElectionTotals {
  inscrits: number;
  inscritsHommes: number;
  inscritsFemmes: number;
  votants: number;
  votantsHommes: number;
  votantsFemmes: number;
  exprimes: number;
  blancs: number;
  nuls: number;
  tauxParticipation: number;
  results: VoteResult[];
}

// Types pour les partis politiques
export interface Party {
  id: string;
  name: string;
  sigle: string;
  logo: string;
  color: string;
}

// Types pour les statistiques des candidats
export interface CandidateStatistics {
  totalExprimes: number;
  voteShare: number;
  trend: 'up' | 'down' | 'stable';
}

// Types pour les résultats des candidats
export interface CandidateResults {
  votes: number;
  percentage: number;
  rank: number;
  isWinner: boolean;
  isTied: boolean;
}

// Types pour les candidats
export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  numero: number;
  photo: string;
  party: Party;
  results: CandidateResults;
  statistics: CandidateStatistics;
}

// Types pour les statistiques globales
export interface ElectionStatistics {
  bureauTraites: number;
  bureauTotal: number;
  pourcentageTraite: number;
  tendances: Array<{
    candidateId: string;
    trend: 'up' | 'down' | 'stable';
    variation: number;
  }>;
}

// Types pour les bureaux de vote
export interface BureauVote {
  id: string;
  numero: string;
  nom: string;
  lieuVoteId: string;
  inscrits: number;
  inscritsHommes: number;
  inscritsFemmes: number;
  votants: number;
  votantsHommes: number;
  votantsFemmes: number;
  exprimes: number;
  blancs: number;
  nuls: number;
  tauxParticipation: number;
  results: VoteResult[];
}

// Types pour les lieux de vote
export interface LieuVote {
  id: string;
  nom: string;
  adresse: string;
  departementId: string;
  totals: ElectionTotals;
  bureaux: BureauVote[];
}

// Types pour les départements
export interface Departement {
  id: string;
  code: string;
  nom: string;
  regionId: string;
  totals: ElectionTotals;
  lieuxVote: LieuVote[];
}

// Types pour les régions
export interface Region {
  id: string;
  nom: string;
  departements: Departement[];
  totals: ElectionTotals;
}

// Types pour les résultats complets d'élection
export interface ElectionResults {
  id: string;
  nom: string;
  date: string;
  type: string;
  tour: number;
  status: string;
  lastUpdate: string;
  candidates: Candidate[];
  totals: ElectionTotals;
  statistics: ElectionStatistics;
  regions: Region[];
  departementsPublies: string[];
}

// Types pour les filtres de résultats
export interface ResultsFilters {
  level?: 'national' | 'regional' | 'departemental' | 'bureau';
  regionId?: string;
  departementId?: string;
  lieuVoteId?: string;
  search?: string;
  sortBy?: 'nom' | 'participation' | 'votes';
  sortOrder?: 'asc' | 'desc';
  view?: 'card' | 'table' | 'chart';
}

// Types pour les props des composants
export interface CandidateCardProps {
  candidate: Candidate;
  candidateColor?: string;
  showDetails?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export interface ResultsTableProps {
  regions: Region[];
  candidates: Candidate[];
  filters: ResultsFilters;
  onFiltersChange: (filters: ResultsFilters) => void;
  expandedLevel?: 'region' | 'departement' | 'lieu' | 'bureau';
}

export interface ResultsChartProps {
  results: VoteResult[];
  candidates: Candidate[];
  type?: 'bar' | 'pie' | 'donut';
  animated?: boolean;
  showPercentages?: boolean;
  height?: number;
}

// Réexportation de PublishedZonesData depuis le service
export type { PublishedZonesData } from '@/lib/services/publishedZonesService';

// Types pour les réponses détaillées des candidats
export interface CandidatesDetailedResponse {
  success: boolean;
  data: {
    candidates: Candidate[];
    colors: Record<string, string>;
    electionInfo: {
      id: string;
      nom: string;
      date: string;
      type: string;
      tour: number;
      status: string;
    };
  };
  message: string;
}

