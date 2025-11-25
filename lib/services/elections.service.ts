/**
 * Service pour les élections
 */

import type {
  Election,
  CreateElectionDto,
  UpdateElectionDto,
  ElectionFilters,
} from '@/types/elections';

/**
 * Récupère toutes les élections
 */
export async function getElections(filters?: ElectionFilters): Promise<Election[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, String(value));
        }
      }
    });
  }

  const response = await fetch(
    `/api/elections${params.toString() ? `?${params.toString()}` : ''}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur lors de la récupération' }));
    throw new Error(error.message || 'Erreur lors de la récupération des élections');
  }

  return response.json();
}

/**
 * Récupère une élection par ID
 */
export async function getElectionById(id: string): Promise<Election> {
  const response = await fetch(`/api/elections/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Élection non trouvée' }));
    throw new Error(error.message || 'Élection non trouvée');
  }

  return response.json();
}

/**
 * Récupère les élections d'une circonscription
 */
export async function getElectionsByCirconscription(
  circonscriptionId: string
): Promise<Election[]> {
  const response = await fetch(`/api/elections?circonscriptionId=${circonscriptionId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors de la récupération des élections');
  }

  return response.json();
}

/**
 * Crée une nouvelle élection
 */
export async function createElection(data: CreateElectionDto): Promise<Election> {
  const response = await fetch('/api/elections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de création' }));
    throw new Error(error.message || 'Erreur lors de la création de l\'élection');
  }

  return response.json();
}

/**
 * Met à jour une élection
 */
export async function updateElection(
  id: string,
  data: UpdateElectionDto
): Promise<Election> {
  const response = await fetch(`/api/elections/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
    throw new Error(error.message || 'Erreur lors de la mise à jour de l\'élection');
  }

  return response.json();
}

/**
 * Supprime une élection
 */
export async function deleteElection(id: string): Promise<void> {
  const response = await fetch(`/api/elections/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de suppression' }));
    throw new Error(error.message || 'Erreur lors de la suppression de l\'élection');
  }
}

/**
 * Change le statut d'une élection
 */
export async function updateElectionStatut(
  id: string,
  statut: Election['statut']
): Promise<Election> {
  const response = await fetch(`/api/elections/${id}/statut`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ statut }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors de la mise à jour du statut');
  }

  return response.json();
}

