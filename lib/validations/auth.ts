import { z } from 'zod';

// ✅ SÉCURITÉ : Liste des mots de passe communs interdits
const COMMON_PASSWORDS = [
  'Password123!',
  'Admin123!',
  'Qwerty123!',
  'Welcome123!',
  'Azerty123!',
  'User123456!',
  'Test123456!',
  '123456789!',
  'Abcd1234!',
  'Password1!',
];

/**
 * ✅ SÉCURITÉ : Fonction de validation de mot de passe renforcée
 * Exigences :
 * - Minimum 12 caractères (au lieu de 8)
 * - Maximum 128 caractères
 * - Au moins une minuscule
 * - Au moins une majuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial (@$!%*?&)
 * - Pas de mots de passe communs
 * - Pas de caractères répétés consécutivement
 */
const passwordValidation = z
  .string()
  .min(1, 'Le mot de passe est requis')
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères') // ✅ Augmenté de 8 à 12
  .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères') // ✅ Limite max
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&)'
  )
  .refine(
    (password) => {
      // ✅ Interdire les mots de passe communs
      return !COMMON_PASSWORDS.includes(password);
    },
    { message: 'Ce mot de passe est trop commun et facile à deviner. Veuillez en choisir un autre.' }
  )
  .refine(
    (password) => {
      // ✅ Vérifier qu'il n'y a pas 3+ caractères identiques consécutifs
      return !/(.)\1{2,}/.test(password);
    },
    { message: 'Le mot de passe ne doit pas contenir de caractères répétés consécutivement (ex: aaa, 111)' }
  );

// Schémas de validation pour l'authentification

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    // Note: Pour login, on accepte les anciens mots de passe
    // mais on encourage le changement via changePasswordSchema
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  password: passwordValidation, // ✅ Utilise la validation renforcée (12 chars, spéciaux, etc.)
  confirmPassword: z
    .string()
    .min(1, 'La confirmation du mot de passe est requise'),
  roleId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est requis'),
  newPassword: passwordValidation, // ✅ Utilise la validation renforcée (12 chars, spéciaux, etc.)
  confirmNewPassword: z
    .string()
    .min(1, 'La confirmation du nouveau mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Les nouveaux mots de passe ne correspondent pas',
  path: ['confirmNewPassword'],
});

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
});

/**
 * ✅ SÉCURITÉ : Fonction pour évaluer la force d'un mot de passe
 * Retourne un score de 0 à 100 et des feedbacks d'amélioration
 * 
 * @param password - Le mot de passe à évaluer
 * @returns Un objet avec le score (0-100) et les feedbacks
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  strength: 'très faible' | 'faible' | 'moyen' | 'fort' | 'très fort';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  // Longueur (max 30 points)
  if (password.length >= 16) score += 30;
  else if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else if (password.length >= 6) score += 5;
  else feedback.push('Le mot de passe est trop court (minimum 12 caractères recommandé)');
  
  // Complexité - Minuscules (15 points)
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Ajoutez au moins une lettre minuscule');
  }
  
  // Complexité - Majuscules (15 points)
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Ajoutez au moins une lettre majuscule');
  }
  
  // Complexité - Chiffres (15 points)
  if (/\d/.test(password)) {
    score += 15;
  } else {
    feedback.push('Ajoutez au moins un chiffre');
  }
  
  // Complexité - Caractères spéciaux (15 points)
  if (/[@$!%*?&]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Ajoutez au moins un caractère spécial (@$!%*?&)');
  }
  
  // Diversité des caractères (10 points)
  const uniqueChars = new Set(password).size;
  if (uniqueChars / password.length > 0.7) {
    score += 10;
  } else {
    feedback.push('Utilisez des caractères plus variés');
  }
  
  // Pénalités
  
  // Mot de passe commun (-50 points)
  if (COMMON_PASSWORDS.includes(password)) {
    score -= 50;
    feedback.push('Ce mot de passe est trop commun');
  }
  
  // Caractères répétés (-10 points)
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Évitez les caractères répétés consécutivement');
  }
  
  // Séquences faciles (-10 points)
  if (/(?:abc|bcd|cde|123|234|345|456|567|678|789)/i.test(password)) {
    score -= 10;
    feedback.push('Évitez les séquences faciles (abc, 123, etc.)');
  }
  
  // S'assurer que le score est entre 0 et 100
  score = Math.max(0, Math.min(100, score));
  
  // Déterminer le niveau de force
  let strength: 'très faible' | 'faible' | 'moyen' | 'fort' | 'très fort';
  if (score >= 80) strength = 'très fort';
  else if (score >= 60) strength = 'fort';
  else if (score >= 40) strength = 'moyen';
  else if (score >= 20) strength = 'faible';
  else strength = 'très faible';
  
  return { score, strength, feedback };
}

// Types TypeScript inférés
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
