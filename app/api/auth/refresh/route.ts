import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerRefreshToken, createAuthCookie } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import { generalRateLimit, getClientIdentifier } from '@/lib/config/ratelimit';

/**
 * Route API pour rafraîchir le token
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = await generalRateLimit.limit(identifier);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }

    const refreshToken = await getServerRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token non trouvé' },
        { status: 401 }
      );
    }

    // Appeler le backend pour rafraîchir le token
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors du rafraîchissement du token' }));
      return NextResponse.json(
        { error: error.message || 'Erreur lors du rafraîchissement du token' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Récupérer les informations utilisateur depuis les cookies
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || '';
    const userStatus = cookieStore.get('user_status')?.value || 'active';
    const userName = cookieStore.get('user_name')?.value || '';

    // Mettre à jour le cookie access_token
    if (data.accessToken) {
      await createAuthCookie(
        data.accessToken,
        refreshToken, // Garder le même refresh token
        userRole,
        userStatus,
        userName
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors du rafraîchissement du token';
    console.error('Erreur lors du rafraîchissement du token:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
