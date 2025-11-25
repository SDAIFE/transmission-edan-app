import { NextResponse } from 'next/server';
import { deleteAuthCookie, getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';

/**
 * Route API pour la déconnexion
 */
export async function POST() {
  try {
    const token = await getServerToken();

    // Appeler le backend pour invalider le token
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Continuer même si le backend ne répond pas
        console.error('Erreur lors de l\'appel au backend:', error);
      }
    }

    // Supprimer les cookies
    await deleteAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Erreur lors de la déconnexion:', error);
    // Supprimer les cookies même en cas d'erreur
    await deleteAuthCookie();
    const message = error instanceof Error ? error.message : 'Erreur lors de la déconnexion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
