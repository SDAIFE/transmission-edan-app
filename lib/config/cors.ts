// Configuration CORS - Origines autorisées
// ✅ Correction Sécurité : Remplacer Access-Control-Allow-Origin: "*"

export const ALLOWED_ORIGINS = [
  // Origines de production (à personnaliser selon votre domaine)
  'https://transmission-epr-app.vercel.app',
  'https://www.transmission-epr-app.vercel.app',
  'https://apiaccreditation.cei.ci',
  'https://www.apiaccreditation.cei.ci',
  
  // Origines de développement (uniquement en mode dev)
  ...(process.env.NODE_ENV === 'development' 
    ? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ] 
    : []
  )
];

/**
 * Vérifie si une origine est autorisée
 * @param origin - L'origine à vérifier
 * @returns true si l'origine est autorisée, false sinon
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Récupère l'origine autorisée depuis les variables d'environnement
 * Permet de configurer dynamiquement les origines sans modifier le code
 */
export function getAllowedOriginsFromEnv(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (!envOrigins) return ALLOWED_ORIGINS;
  
  // Parse les origines depuis .env.local (format: "origin1,origin2,origin3")
  const customOrigins = envOrigins.split(',').map(o => o.trim()).filter(Boolean);
  
  // Ajouter les origines de dev si en mode développement
  if (process.env.NODE_ENV === 'development') {
    return [
      ...customOrigins,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
  }
  
  return customOrigins;
}

