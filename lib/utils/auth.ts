// Utilitaires d'authentification - Gestion des tokens et sécurité

/**
 * ✅ SÉCURITÉ : Récupère le token d'authentification depuis les cookies httpOnly
 * Les tokens sont maintenant dans des cookies sécurisés (non accessibles en JavaScript)
 * Cette fonction appelle l'API pour vérifier la présence du token
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch('/api/auth/token', {
      credentials: 'include'
    });
    
    if (!response.ok) return null;
    
    const { token } = await response.json();
    return token || null;
  } catch {
    return null;
  }
}

/**
 * ✅ SÉCURITÉ : Vérifie la présence d'un token
 * Les tokens sont maintenant dans des cookies httpOnly (gérés côté serveur)
 * Cette fonction vérifie juste la présence du token sans le récupérer
 */
export async function hasAuthToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/auth/token', {
      credentials: 'include'
    });
    
    if (!response.ok) return false;
    
    const { hasToken } = await response.json();
    return hasToken === true;
  } catch {
    return false;
  }
}

/**
 * ⚠️ DÉPRÉCIÉ : saveAuthToken n'est plus utilisé
 * Les tokens sont maintenant gérés par des cookies httpOnly sécurisés
 * Utilisez createAuthCookie() depuis @/actions/auth.action à la place
 */
export function saveAuthToken(_token: string): void {
  console.warn('⚠️ saveAuthToken est déprécié. Utilisez createAuthCookie() depuis @/actions/auth.action');
}

/**
 * ⚠️ DÉPRÉCIÉ : removeAuthToken n'est plus utilisé
 * Les tokens sont maintenant gérés par des cookies httpOnly sécurisés
 * Utilisez deleteAuthCookie() depuis @/actions/auth.action à la place
 */
export function removeAuthToken(): void {
  console.warn('⚠️ removeAuthToken est déprécié. Utilisez deleteAuthCookie() depuis @/actions/auth.action');
}

/**
 * ✅ SÉCURITÉ : Crée les headers d'authentification pour les requêtes API
 * Note : Les intercepteurs Axios ajoutent automatiquement le Bearer token depuis les cookies
 * Cette fonction est conservée pour compatibilité mais n'est plus nécessaire avec les intercepteurs
 */
export function createAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    // Le token est automatiquement ajouté par l'intercepteur Axios depuis les cookies httpOnly
  };
}

/**
 * Sanitise les entrées utilisateur pour prévenir les attaques XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprime les balises HTML
    .replace(/javascript:/gi, '') // Supprime les protocoles javascript
    .replace(/on\w+=/gi, ''); // Supprime les événements JavaScript
}

/**
 * Valide le format d'email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitise l'email (supprime les espaces et convertit en minuscules)
 */
export function sanitizeEmail(email: string): string {
  return sanitizeInput(email).toLowerCase().replace(/\s+/g, '');
}

/**
 * ✅ SÉCURITÉ : Vérifie si le token (depuis les cookies) est expiré
 * Utilise l'API pour récupérer le token depuis les cookies httpOnly
 */
export async function isTokenExpired(): Promise<boolean> {
  try {
    const token = await getAuthToken();
    if (!token) return true;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Vérifie si un token fourni est expiré (version synchrone pour tokens en mémoire)
 */
export function isTokenExpiredSync(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Décode le payload d'un JWT
 */
export function decodeJWT(token: string): unknown {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/**
 * ✅ SÉCURITÉ : Obtient le rôle de l'utilisateur depuis les cookies publics
 * Le rôle est stocké dans un cookie non-httpOnly accessible côté client
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Lire depuis les cookies côté client
  const cookies = document.cookie.split(';');
  const roleCookie = cookies.find(c => c.trim().startsWith('user_role='));
  if (roleCookie) {
    return roleCookie.split('=')[1];
  }
  
  return null;
}

/**
 * Obtient le rôle de l'utilisateur depuis un token fourni (version synchrone)
 */
export function getUserRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token) as { role?: string };
  return payload?.role || null;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  return userRole === requiredRole;
}

/**
 * Vérifie si l'utilisateur a l'un des rôles requis
 */
export function hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Obtient le chemin de redirection basé sur le rôle
 */
// 🔄 ÉTAPE 10 : DÉTERMINATION DU CHEMIN DE REDIRECTION
// Réception du rôle utilisateur depuis AuthContext.login()
// Retour du chemin de destination basé sur les permissions du rôle
export function getRedirectPath(role: string): string {
  // Logique de redirection selon le rôle utilisateur
  // Tous les rôles redirigent vers /dashboard dans cette implémentation
  switch (role) {
    case 'SADMIN':
      return '/dashboard';
    case 'ADMIN':
      return '/dashboard';
    case 'USER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Configuration des cookies
 */
export const COOKIE_OPTIONS = {
  expires: 7, // 7 jours
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  httpOnly: false, // Pour l'accès côté client
};
