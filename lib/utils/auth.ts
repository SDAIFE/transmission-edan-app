/**
 * Utilitaires pour l'authentification côté client
 */

/**
 * Récupère la valeur d'un cookie par nom
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

/**
 * Récupère le rôle de l'utilisateur depuis les cookies
 */
export function getUserRole(): string | null {
  return getCookie('user_role');
}

/**
 * Récupère le statut de l'utilisateur depuis les cookies
 */
export function getUserStatus(): string | null {
  return getCookie('user_status');
}

/**
 * Récupère le nom de l'utilisateur depuis les cookies
 */
export function getUserName(): string | null {
  return getCookie('user_name');
}

/**
 * Vérifie si l'utilisateur est connecté (basé sur les cookies accessibles)
 */
export function isUserLoggedIn(): boolean {
  const role = getUserRole();
  return !!role;
}
