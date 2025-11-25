/**
 * Service pour les résultats
 */

import type {
  ResultatElection,
  CreateResultatDto,
  UpdateResultatDto,
  ResultatFilters,
} from '@/types/resultats';

/**
 * Récupère tous les résultats
 */
export async function getResultats(filters?: ResultatFilters): Promise<ResultatElection[]> {
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
    `/api/resultats${params.toString() ? `?${params.toString()}` : ''}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur lors de la récupération' }));
    throw new Error(error.message || 'Erreur lors de la récupération des résultats');
  }

  return response.json();
}

/**
 * Récupère un résultat par ID
 */
export async function getResultatById(id: string): Promise<ResultatElection> {
  const response = await fetch(`/api/resultats/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Résultat non trouvé' }));
    throw new Error(error.message || 'Résultat non trouvé');
  }

  return response.json();
}

/**
 * Récupère le résultat d'une élection
 */
export async function getResultatByElection(
  electionId: string
): Promise<ResultatElection | null> {
  try {
    const response = await fetch(`/api/resultats?electionId=${electionId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * Crée un nouveau résultat
 */
export async function createResultat(data: CreateResultatDto): Promise<ResultatElection> {
  const response = await fetch('/api/resultats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de création' }));
    throw new Error(error.message || 'Erreur lors de la création du résultat');
  }

  return response.json();
}

/**
 * Met à jour un résultat
 */
export async function updateResultat(
  id: string,
  data: UpdateResultatDto
): Promise<ResultatElection> {
  const response = await fetch(`/api/resultats/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
    throw new Error(error.message || 'Erreur lors de la mise à jour du résultat');
  }

  return response.json();
}

/**
 * Supprime un résultat
 */
export async function deleteResultat(id: string): Promise<void> {
  const response = await fetch(`/api/resultats/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur de suppression' }));
    throw new Error(error.message || 'Erreur lors de la suppression du résultat');
  }
}

/**
 * Publie un résultat
 */
export async function publishResultat(id: string): Promise<ResultatElection> {
  const response = await fetch(`/api/resultats/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors de la publication');
  }

  return response.json();
}

/**
 * Dépublie un résultat
 */
export async function unpublishResultat(id: string): Promise<ResultatElection> {
  const response = await fetch(`/api/resultats/${id}/unpublish`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors de la dépublication');
  }

  return response.json();
}

/**
 * Calcule automatiquement les pourcentages et les élus
 */
export async function calculateResultat(id: string): Promise<ResultatElection> {
  const response = await fetch(`/api/resultats/${id}/calculate`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur' }));
    throw new Error(error.message || 'Erreur lors du calcul');
  }

  return response.json();
}

