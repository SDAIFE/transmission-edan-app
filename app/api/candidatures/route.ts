import { NextRequest, NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import { createCandidatureSchema } from '@/lib/validations/candidatures.schema';
import type { Candidature } from '@/types/candidatures';

/**
 * Route API pour récupérer toutes les candidatures
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

    const response = await fetch(`${API_URL}/candidatures?${params.toString()}`, {
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

    const data: Candidature[] = await response.json();
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
 * Route API pour créer une candidature
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCandidatureSchema.parse(body);

    const response = await fetch(`${API_URL}/candidatures`, {
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

    const data: Candidature = await response.json();
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

