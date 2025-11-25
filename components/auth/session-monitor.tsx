"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Composant pour surveiller la session et gérer l'expiration
 * 
 * Ce composant doit être inclus dans le layout principal
 */
export function SessionMonitor() {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Écouter les événements de synchronisation entre onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth:logout') {
        logout();
      }
    };

    // Écouter les événements d'erreur d'authentification
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [isAuthenticated, logout]);

  return null;
}

