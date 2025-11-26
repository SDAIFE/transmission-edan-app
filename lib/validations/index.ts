// Export de tous les schémas de validation

export * from './auth';
export * from './upload';

// Schémas de validation communs
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z
    .number()
    .int('Le numéro de page doit être un entier')
    .min(1, 'Le numéro de page doit être au moins 1')
    .optional()
    .default(1),
  limit: z
    .number()
    .int('La limite doit être un entier')
    .min(1, 'La limite doit être au moins 1')
    .max(100, 'La limite ne peut pas dépasser 100')
    .optional()
    .default(10),
});

export const searchSchema = z.object({
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const dateRangeSchema = z.object({
  dateDebut: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Format de date invalide pour la date de début'
    ),
  dateFin: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Format de date invalide pour la date de fin'
    ),
}).refine(
  (data) => {
    if (data.dateDebut && data.dateFin) {
      return new Date(data.dateDebut) <= new Date(data.dateFin);
    }
    return true;
  },
  {
    message: 'La date de début doit être antérieure ou égale à la date de fin',
    path: ['dateFin'],
  }
);

// Schéma de validation pour les filtres de CELs
export const celFilterSchema = z.object({
  statutImport: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'ERROR']).optional(),
  typeCellule: z.string().optional(),
  departement: z.string().optional(),
  region: z.string().optional(),
  utilisateur: z.string().optional(),
  hasUser: z.boolean().optional(),
}).merge(searchSchema).merge(dateRangeSchema);

// Schéma de validation pour les filtres de départements
export const departementFilterSchema = z.object({
  region: z.string().optional(),
  hasUser: z.boolean().optional(),
  statutPublication: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
}).merge(searchSchema);

// Schéma de validation pour les filtres d'utilisateurs
export const userFilterSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'SADMIN']).optional(),
  isActive: z.boolean().optional(),
  departement: z.string().optional(),
}).merge(searchSchema);

// Types TypeScript inférés
export type PaginationFormData = z.infer<typeof paginationSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type DateRangeFormData = z.infer<typeof dateRangeSchema>;
export type CelFilterFormData = z.infer<typeof celFilterSchema>;
export type DepartementFilterFormData = z.infer<typeof departementFilterSchema>;
export type UserFilterFormData = z.infer<typeof userFilterSchema>;
