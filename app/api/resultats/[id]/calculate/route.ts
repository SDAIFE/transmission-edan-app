import { NextRequest, NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import type { ResultatElection } from '@/types/resultats';

// Helper pour extraire un message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Erreur serveur';
}

// Type pour les paramètres de route dynamique Next.js 15
type RouteContext = { params: Promise<{ id: string }> };

/**
 * Route API pour calculer automatiquement les pourcentages et les élus
 */
export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/resultats/${id}/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur' }));
      return NextResponse.json(
        { error: errorData.message || 'Erreur lors du calcul' },
        { status: response.status }
      );
    }

    const data: ResultatElection = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erreur POST calculate résultat:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
