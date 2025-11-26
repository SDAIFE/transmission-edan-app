import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/lib/api/auth';
import { createAuthCookie } from '@/actions/auth.action';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requis' },
        { status: 400 }
      );
    }

    // Appeler l'API backend pour le refresh
    const response = await authApi.refresh(refreshToken);

    if (response.accessToken && response.user) {
      // Mettre à jour les cookies
      await createAuthCookie(
        response.accessToken,
        response.user.role.code,
        response.user.isActive ? 'active' : 'inactive',
        `${response.user.firstName} ${response.user.lastName}`
      );

      return NextResponse.json({
        success: true,
        access_token: response.accessToken,
        user: response.user,
      });
    }

    return NextResponse.json(
      { error: 'Réponse de refresh invalide' },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error('❌ [API Refresh] Erreur:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur de refresh du token';
    const errorCode = (error as { code?: string })?.code;
    const errorStatus = (error as { status?: number })?.status || 401;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
      },
      { status: errorStatus }
    );
  }
}
