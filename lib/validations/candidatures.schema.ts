import { z } from 'zod';

/**
 * Schémas de validation Zod pour les candidatures
 */

const candidatureStatutSchema = z.enum(['VALIDE', 'INVALIDE', 'RETIREE']);

export const candidatureSchema = z.object({
  electionId: z.string().uuid('L\'ID de l\'élection doit être un UUID valide'),
  numeroOrdre: z.number().int().positive('Le numéro d\'ordre doit être un entier positif'),
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  prenom: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  partiPolitique: z.string().max(200, 'Le parti politique ne peut pas dépasser 200 caractères').optional(),
  liste: z.string().max(200, 'La liste ne peut pas dépasser 200 caractères').optional(),
  photo: z.string().url('La photo doit être une URL valide').optional().or(z.literal('')),
  biographie: z.string().max(5000, 'La biographie ne peut pas dépasser 5000 caractères').optional(),
  programme: z.string().max(10000, 'Le programme ne peut pas dépasser 10000 caractères').optional(),
  statut: candidatureStatutSchema.optional().default('VALIDE'),
  nombreVoix: z.number().int().nonnegative('Le nombre de voix doit être un entier positif ou nul').optional(),
  pourcentageVoix: z.number().min(0).max(100, 'Le pourcentage de voix ne peut pas dépasser 100%').optional(),
  estElu: z.boolean().optional(),
});

export const createCandidatureSchema = z.object({
  electionId: z.string().uuid('L\'ID de l\'élection doit être un UUID valide'),
  numeroOrdre: z.number().int().positive('Le numéro d\'ordre doit être un entier positif'),
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  prenom: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  partiPolitique: z.string().max(200).optional(),
  liste: z.string().max(200).optional(),
  photo: z.string().url().optional().or(z.literal('')),
  biographie: z.string().max(5000).optional(),
  programme: z.string().max(10000).optional(),
  statut: candidatureStatutSchema.optional().default('VALIDE'),
});

export const updateCandidatureSchema = z.object({
  numeroOrdre: z.number().int().positive().optional(),
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().min(1).max(100).optional(),
  partiPolitique: z.string().max(200).optional(),
  liste: z.string().max(200).optional(),
  photo: z.string().url().optional().or(z.literal('')),
  biographie: z.string().max(5000).optional(),
  programme: z.string().max(10000).optional(),
  statut: candidatureStatutSchema.optional(),
  nombreVoix: z.number().int().nonnegative().optional(),
  pourcentageVoix: z.number().min(0).max(100).optional(),
  estElu: z.boolean().optional(),
});

export const candidatureFiltersSchema = z.object({
  electionId: z.string().uuid().optional(),
  statut: candidatureStatutSchema.optional(),
  partiPolitique: z.string().optional(),
  estElu: z.boolean().optional(),
});

export type CandidatureInput = z.infer<typeof candidatureSchema>;
export type CreateCandidatureInput = z.infer<typeof createCandidatureSchema>;
export type UpdateCandidatureInput = z.infer<typeof updateCandidatureSchema>;
export type CandidatureFiltersInput = z.infer<typeof candidatureFiltersSchema>;

