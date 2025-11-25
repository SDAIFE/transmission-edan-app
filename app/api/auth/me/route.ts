import { NextResponse } from 'next/server';
import { getServerToken } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import type { UserResponseDto } from '@/types/auth';

/**
 * Route API pour récupérer le profil utilisateur
 */
export async function GET() {
  try {
    const token = await getServerToken();

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Appeler le backend
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: response.status }
      );
    }

    const user: UserResponseDto = await response.json();
    return NextResponse.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération du profil';
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
