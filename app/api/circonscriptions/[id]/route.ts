import { NextRequest, NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import { updateCirconscriptionSchema } from '@/lib/validations/circonscriptions.schema';
import { ZodError } from 'zod';
import type { Circonscription } from '@/types/circonscriptions';

// Helper pour extraire un message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Erreur serveur';
}

// Type pour les paramètres de route dynamique Next.js 15
type RouteContext = { params: Promise<{ id: string }> };

/**
 * Route API pour récupérer une circonscription par ID
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/circonscriptions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Circonscription non trouvée' },
        { status: response.status }
      );
    }

    const data: Circonscription = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erreur GET circonscription:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * Route API pour mettre à jour une circonscription
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validation avec Zod
    const validatedData = updateCirconscriptionSchema.parse(body);

    const response = await fetch(`${API_URL}/circonscriptions/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
      return NextResponse.json(
        { error: errorData.message || 'Erreur de mise à jour' },
        { status: response.status }
      );
    }

    const data: Circonscription = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Erreur PATCH circonscription:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * Route API pour supprimer une circonscription
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const token = await getServerToken();
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/circonscriptions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur de suppression' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Erreur DELETE circonscription:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
