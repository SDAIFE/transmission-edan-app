import { NextRequest, NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import { createCirconscriptionSchema } from '@/lib/validations/circonscriptions.schema';
import { ZodError } from 'zod';
import type { Circonscription } from '@/types/circonscriptions';

// Helper pour extraire un message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Erreur serveur';
}

/**
 * Route API pour récupérer toutes les circonscriptions
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

    const response = await fetch(`${API_URL}/circonscriptions?${params.toString()}`, {
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

    const data: Circonscription[] = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erreur GET circonscriptions:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * Route API pour créer une circonscription
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validation avec Zod
    const validatedData = createCirconscriptionSchema.parse(body);

    const response = await fetch(`${API_URL}/circonscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de création' }));
      return NextResponse.json(
        { error: errorData.message || 'Erreur de création' },
        { status: response.status }
      );
    }

    const data: Circonscription = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Erreur POST circonscription:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
