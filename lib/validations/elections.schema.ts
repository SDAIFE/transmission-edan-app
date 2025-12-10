import { z } from 'zod';

/**
 * Schémas de validation Zod pour les élections
 */

const electionStatutSchema = z.enum(['PREPARATION', 'EN_COURS', 'CLOTUREE', 'PUBLIEE']);

export const electionSchema = z.object({
  circonscriptionId: z
    .string()
    .uuid("L'ID de la circonscription doit être un UUID valide"),
  dateElection: z.coerce
    .date({
      message: "La date de l'élection doit être une date valide",
    })
    .refine((date) => !isNaN(date.getTime()), {
      message: "La date de l'élection est requise",
    }),
  statut: electionStatutSchema.optional().default("PREPARATION"),
  nombreInscrits: z
    .number()
    .int()
    .positive("Le nombre d'inscrits doit être un entier positif"),
  nombreVotants: z
    .number()
    .int()
    .nonnegative(
      "Le nombre de votants doit être un entier positif ou nul"
    )
    .optional(),
  nombreBulletinsNuls: z
    .number()
    .int()
    .nonnegative(
      "Le nombre de bulletins nuls doit être un entier positif ou nul"
    )
    .optional(),
  nombreBulletinsBlancs: z
    .number()
    .int()
    .nonnegative(
      "Le nombre de bulletins blancs doit être un entier positif ou nul"
    )
    .optional(),
  nombreBulletinsValides: z
    .number()
    .int()
    .nonnegative(
      "Le nombre de bulletins valides doit être un entier positif ou nul"
    )
    .optional(),
});

export const createElectionSchema = z.object({
  circonscriptionId: z
    .string()
    .uuid("L'ID de la circonscription doit être un UUID valide"),
  dateElection: z.coerce
    .date({
      message: "La date de l'élection doit être une date valide",
    })
    .refine((date) => !isNaN(date.getTime()), {
      message: "La date de l'élection est requise",
    }),
  nombreInscrits: z
    .number()
    .int()
    .positive("Le nombre d'inscrits doit être un entier positif"),
  statut: electionStatutSchema.optional().default("PREPARATION"),
});

export const updateElectionSchema = z.object({
  dateElection: z.coerce.date().optional(),
  statut: electionStatutSchema.optional(),
  nombreInscrits: z.number().int().positive().optional(),
  nombreVotants: z.number().int().nonnegative().optional(),
  nombreBulletinsNuls: z.number().int().nonnegative().optional(),
  nombreBulletinsBlancs: z.number().int().nonnegative().optional(),
  nombreBulletinsValides: z.number().int().nonnegative().optional(),
});

export const electionFiltersSchema = z.object({
  circonscriptionId: z.string().uuid().optional(),
  statut: electionStatutSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type ElectionInput = z.infer<typeof electionSchema>;
export type CreateElectionInput = z.infer<typeof createElectionSchema>;
export type UpdateElectionInput = z.infer<typeof updateElectionSchema>;
export type ElectionFiltersInput = z.infer<typeof electionFiltersSchema>;
