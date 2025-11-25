import { z } from 'zod';

/**
 * Schémas de validation Zod pour les circonscriptions
 */

export const circonscriptionSchema = z.object({
  code: z.string().min(1, 'Le code est requis').max(20, 'Le code ne peut pas dépasser 20 caractères'),
  libelle: z.string().min(1, 'Le libellé est requis').max(200, 'Le libellé ne peut pas dépasser 200 caractères'),
  region: z.string().min(1, 'La région est requise').max(100, 'La région ne peut pas dépasser 100 caractères'),
  departement: z.string().min(1, 'Le département est requis').max(100, 'Le département ne peut pas dépasser 100 caractères'),
  nombreSieges: z.number().int().positive('Le nombre de sièges doit être un entier positif'),
  nombreCandidatures: z.number().int().nonnegative('Le nombre de candidatures doit être un entier positif ou nul'),
  isActive: z.boolean().optional().default(true),
});

export const createCirconscriptionSchema = circonscriptionSchema;

export const updateCirconscriptionSchema = circonscriptionSchema.partial();

export const circonscriptionFiltersSchema = z.object({
  region: z.string().optional(),
  departement: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export type CirconscriptionInput = z.infer<typeof circonscriptionSchema>;
export type CreateCirconscriptionInput = z.infer<typeof createCirconscriptionSchema>;
export type UpdateCirconscriptionInput = z.infer<typeof updateCirconscriptionSchema>;
export type CirconscriptionFiltersInput = z.infer<typeof circonscriptionFiltersSchema>;
