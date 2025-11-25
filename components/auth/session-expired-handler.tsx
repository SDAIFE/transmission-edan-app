"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Composant pour gérer l'expiration de session
 */
export function SessionExpiredHandler() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      router.push('/auth/login?error=session_expired');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [logout, router]);

  return null;
}

