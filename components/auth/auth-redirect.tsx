"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
  authenticatedRedirect?: string;
  unauthenticatedRedirect?: string;
}

/**
 * Composant pour gérer les redirections selon l'état d'authentification
 */
export function AuthRedirect({
  authenticatedRedirect = '/dashboard',
  unauthenticatedRedirect = '/auth/login',
}: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith('/auth');

    if (isAuthenticated && isAuthRoute) {
      // Rediriger vers le dashboard si connecté et sur une route auth
      router.push(authenticatedRedirect);
    } else if (!isAuthenticated && !isAuthRoute) {
      // Rediriger vers login si non connecté et sur une route protégée
      router.push(`${unauthenticatedRedirect}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router, authenticatedRedirect, unauthenticatedRedirect]);

  return null;
}

