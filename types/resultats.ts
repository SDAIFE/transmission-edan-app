/**
 * Types pour les résultats
 */

import { Election } from './elections';
import { Circonscription } from './circonscriptions';
import { Candidature } from './candidatures';

export interface ResultatElection {
  id: string;
  electionId: string;
  election: Election;
  circonscription: Circonscription;
  candidatures: Candidature[];
  nombreInscrits: number;
  nombreVotants: number;
  nombreBulletinsNuls: number;
  nombreBulletinsBlancs: number;
  nombreBulletinsValides: number;
  tauxParticipation: number;
  candidatsElus: Candidature[];
  datePublication?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResultatDto {
  electionId: string;
  nombreVotants: number;
  nombreBulletinsNuls: number;
  nombreBulletinsBlancs: number;
  nombreBulletinsValides: number;
  candidatures: Array<{
    candidatureId: string;
    nombreVoix: number;
  }>;
}

export interface UpdateResultatDto {
  nombreVotants?: number;
  nombreBulletinsNuls?: number;
  nombreBulletinsBlancs?: number;
  nombreBulletinsValides?: number;
  candidatures?: Array<{
    candidatureId: string;
    nombreVoix: number;
  }>;
  isPublished?: boolean;
}

export interface ResultatFilters {
  electionId?: string;
  circonscriptionId?: string;
  isPublished?: boolean;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

