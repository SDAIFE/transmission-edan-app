import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api/auth';

export async function GET() {
  try {
    // Récupérer les données utilisateur depuis l'API backend
    const user = await authApi.getProfile();

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    console.error('❌ [API Me] Erreur:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur de récupération du profil';
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
