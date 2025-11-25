/**
 * Service pour les circonscriptions
 * 
 * Ce service fait appel aux routes API Next.js qui gèrent ensuite
 * l'appel au backend et la gestion des cookies httpOnly
 */

import type {
  Circonscription,
  CreateCirconscriptionDto,
  UpdateCirconscriptionDto,
  CirconscriptionFilters,
} from '@/types/circonscriptions';

/**
 * Récupère toutes les circonscriptions
 */
export async function getCirconscriptions(
  filters?: CirconscriptionFilters
): Promise<Circonscription[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const response = await fetch(
    `/api/circonscriptions${params.toString() ? `?${params.toString()}` : ''}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur lors de la récupération' }));
    throw new Error(error.message || 'Erreur lors de la récupération des circonscriptions');
  }

  return response.json();
}

/**
 * Récupère une circonscription par ID
 */
export async function getCirconscriptionById(id: string): Promise<Circonscription> {
  const response = await fetch(`/api/circonscriptions/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Circonscription non trouvée' }));
    throw new Error(error.message || 'Circonscription non trouvée');
  }

  return response.json();
}

/**
 * Crée une nouvelle circonscription
 */
export async function createCirconscription(
  data: CreateCirconscriptionDto
): Promise<Circonscription> {
  const response = await fetch('/api/circonscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de création' }));
    throw new Error(error.message || 'Erreur lors de la création de la circonscription');
  }

  return response.json();
}

/**
 * Met à jour une circonscription
 */
export async function updateCirconscription(
  id: string,
  data: UpdateCirconscriptionDto
): Promise<Circonscription> {
  const response = await fetch(`/api/circonscriptions/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
    throw new Error(error.message || 'Erreur lors de la mise à jour de la circonscription');
  }

  return response.json();
}

/**
 * Supprime une circonscription
 */
export async function deleteCirconscription(id: string): Promise<void> {
  const response = await fetch(`/api/circonscriptions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de suppression' }));
    throw new Error(error.message || 'Erreur lors de la suppression de la circonscription');
  }
}

/**
 * Récupère les statistiques d'une circonscription
 */
export async function getCirconscriptionStats(id: string): Promise<{
  nombreElections: number;
  nombreCandidatures: number;
  nombreResultats: number;
}> {
  const response = await fetch(`/api/circonscriptions/${id}/stats`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors de la récupération des statistiques');
  }

  return response.json();
}

