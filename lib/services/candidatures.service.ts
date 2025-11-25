/**
 * Service pour les candidatures
 */

import type {
  Candidature,
  CreateCandidatureDto,
  UpdateCandidatureDto,
  CandidatureFilters,
} from '@/types/candidatures';

/**
 * Récupère toutes les candidatures
 */
export async function getCandidatures(filters?: CandidatureFilters): Promise<Candidature[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const response = await fetch(
    `/api/candidatures${params.toString() ? `?${params.toString()}` : ''}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur lors de la récupération' }));
    throw new Error(error.message || 'Erreur lors de la récupération des candidatures');
  }

  return response.json();
}

/**
 * Récupère une candidature par ID
 */
export async function getCandidatureById(id: string): Promise<Candidature> {
  const response = await fetch(`/api/candidatures/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Candidature non trouvée' }));
    throw new Error(error.message || 'Candidature non trouvée');
  }

  return response.json();
}

/**
 * Récupère les candidatures d'une élection
 */
export async function getCandidaturesByElection(electionId: string): Promise<Candidature[]> {
  const response = await fetch(`/api/candidatures?electionId=${electionId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors de la récupération des candidatures');
  }

  return response.json();
}

/**
 * Crée une nouvelle candidature
 */
export async function createCandidature(data: CreateCandidatureDto): Promise<Candidature> {
  const response = await fetch('/api/candidatures', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de création' }));
    throw new Error(error.message || 'Erreur lors de la création de la candidature');
  }

  return response.json();
}

/**
 * Met à jour une candidature
 */
export async function updateCandidature(
  id: string,
  data: UpdateCandidatureDto
): Promise<Candidature> {
  const response = await fetch(`/api/candidatures/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
    throw new Error(error.message || 'Erreur lors de la mise à jour de la candidature');
  }

  return response.json();
}

/**
 * Supprime une candidature
 */
export async function deleteCandidature(id: string): Promise<void> {
  const response = await fetch(`/api/candidatures/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de suppression' }));
    throw new Error(error.message || 'Erreur lors de la suppression de la candidature');
  }
}

/**
 * Met à jour le nombre de voix d'une candidature
 */
export async function updateCandidatureVoix(
  id: string,
  nombreVoix: number
): Promise<Candidature> {
  const response = await fetch(`/api/candidatures/${id}/voix`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ nombreVoix }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors de la mise à jour des voix');
  }

  return response.json();
}

/**
 * Réordonne les candidatures d'une élection
 */
export async function reorderCandidatures(
  electionId: string,
  candidatureIds: string[]
): Promise<Candidature[]> {
  const response = await fetch('/api/candidatures/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ electionId, candidatureIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors du réordonnancement');
  }

  return response.json();
}

