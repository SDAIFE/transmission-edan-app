/**
 * Types pour les candidatures
 */

import { Election } from './elections';

export type CandidatureStatut = 'VALIDE' | 'INVALIDE' | 'RETIREE';

export interface Candidature {
  id: string;
  electionId: string;
  election: Election;
  numeroOrdre: number; // Ordre d'affichage sur le bulletin
  nom: string;
  prenom: string;
  partiPolitique?: string;
  liste?: string;
  photo?: string;
  biographie?: string;
  programme?: string;
  statut: CandidatureStatut;
  nombreVoix?: number;
  pourcentageVoix?: number;
  estElu?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

