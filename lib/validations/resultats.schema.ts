import { z } from 'zod';

/**
 * Schémas de validation Zod pour les résultats
 */

export const resultatSchema = z.object({
  electionId: z.string().uuid('L\'ID de l\'élection doit être un UUID valide'),
  nombreVotants: z.number().int().nonnegative('Le nombre de votants doit être un entier positif ou nul'),
  nombreBulletinsNuls: z.number().int().nonnegative('Le nombre de bulletins nuls doit être un entier positif ou nul'),
  nombreBulletinsBlancs: z.number().int().nonnegative('Le nombre de bulletins blancs doit être un entier positif ou nul'),
  nombreBulletinsValides: z.number().int().nonnegative('Le nombre de bulletins valides doit être un entier positif ou nul'),
  candidatures: z.array(
    z.object({
      candidatureId: z.string().uuid('L\'ID de la candidature doit être un UUID valide'),
      nombreVoix: z.number().int().nonnegative('Le nombre de voix doit être un entier positif ou nul'),
    })
  ).min(1, 'Au moins une candidature est requise'),
});

export const createResultatSchema = resultatSchema;

export const updateResultatSchema = z.object({
  nombreVotants: z.number().int().nonnegative().optional(),
  nombreBulletinsNuls: z.number().int().nonnegative().optional(),
  nombreBulletinsBlancs: z.number().int().nonnegative().optional(),
  nombreBulletinsValides: z.number().int().nonnegative().optional(),
  candidatures: z.array(
    z.object({
      candidatureId: z.string().uuid(),
      nombreVoix: z.number().int().nonnegative(),
    })
  ).optional(),
  isPublished: z.boolean().optional(),
});

export const resultatFiltersSchema = z.object({
  electionId: z.string().uuid().optional(),
  circonscriptionId: z.string().uuid().optional(),
  isPublished: z.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Validation personnalisée pour vérifier la cohérence des résultats
export const resultatValidationSchema = resultatSchema.refine(
  (data) => {
    const totalVoix = data.candidatures.reduce((sum, c) => sum + c.nombreVoix, 0);
    return totalVoix <= data.nombreBulletinsValides;
  },
  {
    message: 'Le total des voix ne peut pas dépasser le nombre de bulletins valides',
    path: ['candidatures'],
  }
).refine(
  (data) => {
    return data.nombreBulletinsNuls + data.nombreBulletinsBlancs + data.nombreBulletinsValides <= data.nombreVotants;
  },
  {
    message: 'Le total des bulletins (nuls + blancs + valides) ne peut pas dépasser le nombre de votants',
    path: ['nombreVotants'],
  }
);

export type ResultatInput = z.infer<typeof resultatSchema>;
export type CreateResultatInput = z.infer<typeof createResultatSchema>;
export type UpdateResultatInput = z.infer<typeof updateResultatSchema>;
export type ResultatFiltersInput = z.infer<typeof resultatFiltersSchema>;

