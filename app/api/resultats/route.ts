import { NextRequest, NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import { createResultatSchema } from '@/lib/validations/resultats.schema';
import type { ResultatElection } from '@/types/resultats';

/**
 * Route API pour récupérer tous les résultats
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const response = await fetch(`${API_URL}/resultats?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: response.status }
      );
    }

    const data: ResultatElection[] = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route API pour créer un résultat
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createResultatSchema.parse(body);

    const response = await fetch(`${API_URL}/resultats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur de création' }));
      return NextResponse.json(
        { error: error.message || 'Erreur de création' },
        { status: response.status }
      );
    }

    const data: ResultatElection = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

