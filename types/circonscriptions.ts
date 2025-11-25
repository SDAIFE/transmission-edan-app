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

