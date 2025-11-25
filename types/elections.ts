/**
 * Types pour les élections
 */

import { Circonscription } from './circonscriptions';

export type ElectionStatut = 'PREPARATION' | 'EN_COURS' | 'CLOTUREE' | 'PUBLIEE';

export interface Election {
  id: string;
  circonscriptionId: string;
  circonscription: Circonscription;
  dateElection: Date;
  statut: ElectionStatut;
  nombreInscrits: number;
  nombreVotants?: number;
  nombreBulletinsNuls?: number;
  nombreBulletinsBlancs?: number;
  nombreBulletinsValides?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateElectionDto {
  circonscriptionId: string;
  dateElection: Date | string;
  nombreInscrits: number;
  statut?: ElectionStatut;
}

export interface UpdateElectionDto {
  dateElection?: Date | string;
  statut?: ElectionStatut;
  nombreInscrits?: number;
  nombreVotants?: number;
  nombreBulletinsNuls?: number;
  nombreBulletinsBlancs?: number;
  nombreBulletinsValides?: number;
}

export interface ElectionFilters {
  circonscriptionId?: string;
  statut?: ElectionStatut;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

