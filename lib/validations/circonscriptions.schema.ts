import { z } from 'zod';

/**
 * Schémas de validation Zod pour les circonscriptions
 * 
 * TODO: Implémenter les schémas complets
 */

export const circonscriptionSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  libelle: z.string().min(1, 'Le libellé est requis'),
  region: z.string().min(1, 'La région est requise'),
  departement: z.string().min(1, 'Le département est requis'),
  nombreSieges: z.number().int().positive('Le nombre de sièges doit être positif'),
  nombreCandidatures: z.number().int().nonnegative('Le nombre de candidatures doit être positif ou nul'),
  isActive: z.boolean(),
});

