import { z } from 'zod';

/**
 * Schémas de validation Zod pour les élections
 * 
 * TODO: Implémenter les schémas complets
 */

export const electionSchema = z.object({
  circonscriptionId: z.string().min(1, 'La circonscription est requise'),
  dateElection: z.date(),
  statut: z.enum(['PREPARATION', 'EN_COURS', 'CLOTUREE', 'PUBLIEE']),
  nombreInscrits: z.number().int().positive('Le nombre d\'inscrits doit être positif'),
});

