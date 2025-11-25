import { NextRequest, NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import type { ResultatElection } from '@/types/resultats';

/**
 * Route API pour publier un résultat
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/resultats/${params.id}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur' }));
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la publication' },
        { status: response.status }
      );
    }

    const data: ResultatElection = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

