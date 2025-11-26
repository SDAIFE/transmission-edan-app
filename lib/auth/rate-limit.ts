/**
 * ✅ SÉCURITÉ : Configuration du Rate Limiting avec Upstash Redis
 * 
 * Objectifs :
 * - Protéger contre les attaques par force brute sur login
 * - Limiter les uploads pour éviter l'abus
 * - Limiter les requêtes API générales
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuration Redis (Upstash)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

/**
 * ✅ SÉCURITÉ : Rate limiting STRICT pour les tentatives de connexion
 * - 5 tentatives par 15 minutes par IP
 * - Protection contre force brute
 */
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:login',
});

/**
 * ✅ SÉCURITÉ : Rate limiting pour les uploads de fichiers
 * - 10 uploads par 10 minutes par IP
 * - Évite l'abus du système de stockage
 */
export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 m'),
  analytics: true,
  prefix: 'ratelimit:upload',
});

/**
 * ✅ SÉCURITÉ : Rate limiting pour les API générales
 * - 100 requêtes par minute par IP
 * - Protection DDoS basique
 */
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
});

/**
 * ✅ SÉCURITÉ : Rate limiting pour la création d'utilisateurs
 * - 3 créations par heure par IP
 * - Évite la création massive de comptes
 */
export const registerRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:register',
});

/**
 * Récupère l'identifiant du client (IP ou autre)
 * @param request - La requête Next.js
 * @returns L'identifiant unique du client
 */
export function getClientIdentifier(request: Request): string {
  // Essayer d'obtenir l'IP réelle (derrière proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // Prendre la première IP de la liste
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback : utiliser l'IP de la requête ou 'anonymous'
  return 'anonymous';
}

/**
 * Formatte les headers de rate limiting pour la réponse
 * @param limit - Limite maximale
 * @param remaining - Requêtes restantes
 * @param reset - Timestamp de reset
 * @returns Headers formatés
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
    'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
  };
}

