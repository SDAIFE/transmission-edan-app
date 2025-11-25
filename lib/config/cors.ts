/**
 * Configuration CORS - Origines autorisées
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_API_URL,
].filter(Boolean) as string[];

/**
 * Vérifie si une origine est autorisée
 */
export function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  
  // En développement, autoriser localhost
  if (process.env.NODE_ENV === 'development') {
    return origin.startsWith('http://localhost') || 
           origin.startsWith('http://127.0.0.1') ||
           ALLOWED_ORIGINS.includes(origin);
  }
  
  return ALLOWED_ORIGINS.includes(origin);
}

