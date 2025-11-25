import { NextRequest, NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import { z, ZodError } from 'zod';

// Helper pour extraire un message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Erreur serveur';
}

// Type pour les paramètres de route dynamique Next.js 15
type RouteContext = { params: Promise<{ id: string }> };

const updateStatutSchema = z.object({
  statut: z.enum(['PREPARATION', 'EN_COURS', 'CLOTUREE', 'PUBLIEE']),
});

/**
 * Route API pour mettre à jour le statut d'une élection
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
    const validatedData = updateStatutSchema.parse(body);

    const response = await fetch(`${API_URL}/elections/${id}/statut`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur' }));
      return NextResponse.json(
        { error: errorData.message || 'Erreur lors de la mise à jour du statut' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Erreur PATCH statut élection:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
