import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createAuthCookie } from '@/actions/auth.action';
import { API_URL } from '@/lib/config/api';
import type { AuthResponseDto } from '@/types/auth';
import { authRateLimit, getClientIdentifier } from '@/lib/config/ratelimit';
import { registerSchema } from '@/lib/validations/auth.schema';

/**
 * Route API pour l'inscription
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = await authRateLimit.limit(identifier);

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.',
          retryAfter: Math.round((rateLimit.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.round((rateLimit.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validatedBody = registerSchema.parse(body);

    // Appeler le backend
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur d\'inscription' }));
      return NextResponse.json(
        { error: error.message || 'Erreur d\'inscription' },
        { status: response.status }
      );
    }

    const data: AuthResponseDto = await response.json();

    // Créer les cookies sécurisés
    await createAuthCookie(
      data.accessToken,
      data.refreshToken,
      data.user.role,
      data.user.status,
      data.user.name
    );

    // Retourner les données utilisateur (sans les tokens)
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        status: data.user.status,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

