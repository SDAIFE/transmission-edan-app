/**
 * Types pour les circonscriptions
 */

export interface Circonscription {
  id: string;
  code: string;
  libelle: string;
  region: string;
  departement: string;
  nombreSieges: number; // Nombre de sièges à pourvoir
  nombreCandidatures: number; // Nombre de candidatures attendues
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCirconscriptionDto {
  code: string;
  libelle: string;
  region: string;
  departement: string;
  nombreSieges: number;
  nombreCandidatures: number;
  isActive?: boolean;
}

export interface UpdateCirconscriptionDto {
  code?: string;
  libelle?: string;
  region?: string;
  departement?: string;
  nombreSieges?: number;
  nombreCandidatures?: number;
  isActive?: boolean;
}

export interface CirconscriptionFilters {
  region?: string;
  departement?: string;
  isActive?: boolean;
  search?: string;
}

