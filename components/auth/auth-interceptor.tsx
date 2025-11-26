'use client';

import { useEffect } from 'react';
import { setupAuthInterceptor } from '@/lib/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';

export function AuthInterceptor() {
  const { handleSessionExpired } = useAuth();

  useEffect(() => {
    // Initialiser l'intercepteur d'authentification au montage du composant
    setupAuthInterceptor();

    // Écouter l'événement de session expirée
    const handleSessionExpiredEvent = (event: Event) => {
      console.log('🔄 [AuthInterceptor] Événement de session expirée reçu');
      handleSessionExpired(event as CustomEvent);
    };

    window.addEventListener('session-expired', handleSessionExpiredEvent);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpiredEvent);
    };
  }, [handleSessionExpired]);

  // Ce composant ne rend rien, il sert juste à initialiser l'intercepteur
  return null;
}
