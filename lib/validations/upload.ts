import { z } from 'zod';

// Schémas de validation pour l'upload de fichiers

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      'Le fichier ne peut pas dépasser 10MB'
    )
    .refine(
      (file) => {
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];
        return allowedTypes.includes(file.type);
      },
      'Seuls les fichiers Excel (.xlsx, .xls) sont autorisés'
    ),
  codeCellule: z
    .string()
    .min(1, 'Le code de la cellule est requis')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Le code de la cellule ne peut contenir que des lettres majuscules, chiffres, tirets et underscores'
    ),
  nomFichier: z
    .string()
    .optional(),
  nombreBv: z
    .number()
    .int('Le nombre de bureaux de vote doit être un entier')
    .min(1, 'Le nombre de bureaux de vote doit être au moins 1')
    .optional(),
});

export const excelDataRowSchema = z.object({
  ordre: z.string().optional(),
  referenceLieuVote: z.string().optional(),
  libelleLieuVote: z.string().optional(),
  numeroBureauVote: z.string().optional(),
  populationHommes: z.string().optional(),
  populationFemmes: z.string().optional(),
  populationTotale: z.string().optional(),
  personnesAstreintes: z.string().optional(),
  votantsHommes: z.string().optional(),
  votantsFemmes: z.string().optional(),
  totalVotants: z.string().optional(),
  tauxParticipation: z.string().optional(),
  bulletinsNuls: z.string().optional(),
  bulletinsBlancs: z.string().optional(),
  suffrageExprime: z.string().optional(),
  score1: z.string().optional(),
  score2: z.string().optional(),
  score3: z.string().optional(),
  score4: z.string().optional(),
  score5: z.string().optional(),
  colonneZero: z.string().optional(),
});

export const excelParsedDataSchema = z.object({
  codeCellule: z.string().min(1, 'Le code de la cellule est requis'),
  nomFichier: z.string().min(1, 'Le nom du fichier est requis'),
  headers: z.array(z.string()).min(1, 'Les en-têtes sont requis'),
  dataRows: z.array(excelDataRowSchema),
  mapping: z.record(z.string(), z.object({
    field: z.string(),
    index: z.number(),
    type: z.string(),
  })),
  nombreBv: z.number().int().min(1),
  nombreLignes: z.number().int().min(0),
  validation: z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
});

// Validation pour les filtres d'import
export const importFilterSchema = z.object({
  statut: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'ERROR']).optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  codeCellule: z.string().optional(),
  search: z.string().optional(),
});

// Types TypeScript inférés
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type ExcelDataRowFormData = z.infer<typeof excelDataRowSchema>;
export type ExcelParsedDataFormData = z.infer<typeof excelParsedDataSchema>;
export type ImportFilterFormData = z.infer<typeof importFilterSchema>;
