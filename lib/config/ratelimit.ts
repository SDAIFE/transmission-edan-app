import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Configuration du rate limiting avec Upstash
 * 
 * Variables d'environnement requises:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

let ratelimit: Ratelimit | null = null;

/**
 * Initialise le rate limiter
 */
function getRateLimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    console.warn('Upstash Redis non configuré. Le rate limiting est désactivé.');
    return null;
  }

  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requêtes par 10 secondes par défaut
    analytics: true,
    prefix: '@upstash/ratelimit',
  });

  return ratelimit;
}

/**
 * Rate limiter pour les endpoints d'authentification (stricte)
 */
export const authRateLimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined as any,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 tentatives par minute
  analytics: true,
  prefix: '@upstash/ratelimit/auth',
});

/**
 * Rate limiter pour les endpoints généraux
 */
export const generalRateLimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined as any,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requêtes par minute
  analytics: true,
  prefix: '@upstash/ratelimit/general',
});

/**
 * Vérifie le rate limit pour une clé donnée
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = authRateLimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const limit = await limiter.limit(identifier);
    return limit;
  } catch (error) {
    console.error('Erreur lors de la vérification du rate limit:', error);
    // En cas d'erreur, autoriser la requête (fail open)
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * Obtient l'identifiant du client depuis la requête
 */
export function getClientIdentifier(request: Request): string {
  // Essayer de récupérer l'IP depuis les headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

