import { NextRequest, NextResponse } from 'next/server';
import { getServerToken, getServerRefreshToken } from '@/actions/auth.action';

/**
 * ✅ SÉCURITÉ : Route API pour récupérer les tokens côté serveur
 * 
 * Nécessaire car avec httpOnly=true, JavaScript côté client ne peut pas
 * accéder directement aux cookies contenant les tokens.
 * 
 * Cette route permet au client de récupérer le token de manière sécurisée
 * pour l'utiliser dans les requêtes API (header Authorization).
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getServerToken();
    const refreshToken = await getServerRefreshToken();
    
    // Retourner les tokens (la communication est sécurisée via HTTPS)
    return NextResponse.json({
      token,
      refreshToken,
      hasToken: !!token,
      hasRefreshToken: !!refreshToken
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ [API Token] Erreur:', error);
    return NextResponse.json(
      { 
        token: null,
        refreshToken: null,
        hasToken: false,
        hasRefreshToken: false,
        error: 'Erreur lors de la récupération du token'
      },
      { status: 500 }
    );
  }
}

