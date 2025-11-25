import { NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';

/**
 * Route API pour vérifier la présence du token
 */
export async function GET() {
  try {
    const token = await getServerToken();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Vérifier avec le backend si le token est valide
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return NextResponse.json({ valid: response.ok });
  } catch (error: unknown) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
