"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Composant pour intercepter les erreurs d'authentification
 * et gérer les redirections automatiques
 */
export function AuthInterceptor() {
  const { logout } = useAuth();

  useEffect(() => {
    // Écouter les erreurs d'authentification globales
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  return null;
}

