/**
 * Service d'authentification
 * 
 * Ce service fait appel aux routes API Next.js qui gèrent ensuite
 * l'appel au backend et la gestion des cookies httpOnly
 */

import type {
  LoginDto,
  RegisterDto,
  UserResponseDto,
} from '@/types/auth';

/**
 * Connexion - Appelle la route API Next.js /api/auth/login
 */
export async function login(credentials: LoginDto): Promise<{ user: UserResponseDto }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important pour recevoir les cookies
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
    throw new Error(error.message || 'Erreur de connexion');
  }

  return response.json();
}

/**
 * Inscription - Appelle la route API Next.js /api/auth/register
 */
export async function register(userData: RegisterDto): Promise<{ user: UserResponseDto }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur d\'inscription' }));
    throw new Error(error.message || 'Erreur d\'inscription');
  }

  return response.json();
}

/**
 * Déconnexion - Appelle la route API Next.js /api/auth/logout
 */
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Récupère le profil utilisateur actuel
 */
export async function getCurrentUser(): Promise<UserResponseDto> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du profil');
  }

  return response.json();
}

/**
 * Rafraîchit le token d'accès
 */
export async function refreshToken(): Promise<void> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erreur lors du rafraîchissement du token');
  }
}

/**
 * Vérifie si le token est valide
 */
export async function verifyToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateProfile(updates: Partial<UserResponseDto>): Promise<UserResponseDto> {
  const response = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
    throw new Error(error.message || 'Erreur de mise à jour');
  }

  return response.json();
}
