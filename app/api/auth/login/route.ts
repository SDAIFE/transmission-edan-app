import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/lib/api/auth';
import { createAuthCookie } from '@/actions/auth.action';
import { loginRateLimit, getClientIdentifier, getRateLimitHeaders } from '@/lib/auth/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // ✅ SÉCURITÉ : Vérifier le rate limit (protection force brute)
    const identifier = getClientIdentifier(request);
    const { success, limit, remaining, reset } = await loginRateLimit.limit(identifier);
    
    if (!success) {
      // console.warn(`🚫 [Security] Rate limit dépassé pour IP: ${identifier}`);
      return NextResponse.json(
        { 
          error: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
          retryAfter: new Date(reset).toISOString(),
          remainingAttempts: 0
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(limit, 0, reset)
        }
      );
    }
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Appeler l'API backend
    const response = await authApi.login({ email, password });

    if (response.accessToken && response.user) {
      // ✅ SÉCURITÉ : Créer les cookies httpOnly sécurisés
      await createAuthCookie(
        response.accessToken,
        response.refreshToken || '', // ✅ Ajouter le refresh token
        response.user.role.code,
        response.user.isActive ? 'active' : 'inactive',
        `${response.user.firstName} ${response.user.lastName}`
      );

      // ✅ SÉCURITÉ : Ajouter les headers de rate limit dans la réponse réussie
      const successResponse = NextResponse.json({
        success: true,
        user: response.user,
        remainingAttempts: remaining,
        // ✅ SÉCURITÉ : Ne plus retourner les tokens (ils sont dans les cookies httpOnly)
        // accessToken: response.accessToken,
      });
      
      // Ajouter les headers de rate limit
      Object.entries(getRateLimitHeaders(limit, remaining, reset)).forEach(([key, value]) => {
        successResponse.headers.set(key, value);
      });
      
      return successResponse;
    }

    return NextResponse.json(
      { error: 'Réponse de connexion invalide' },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error('❌ [API Login] Erreur:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
    const errorCode = (error as { code?: string })?.code;
    const errorStatus = (error as { status?: number })?.status || 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
      },
      { status: errorStatus }
    );
  }
}
