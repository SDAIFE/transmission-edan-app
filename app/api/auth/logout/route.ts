import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api/auth';
import { deleteAuthCookie } from '@/actions/auth.action';

export async function POST() {
  try {
    // Appeler l'API backend pour la déconnexion
    await authApi.logout();

    // Supprimer les cookies d'authentification
    await deleteAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error: unknown) {
    console.error('❌ [API Logout] Erreur:', error);
    
    // Même en cas d'erreur, supprimer les cookies
    await deleteAuthCookie();
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur de déconnexion';
    
    return NextResponse.json(
      { 
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
