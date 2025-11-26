'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthRedirectProps {
  to: string;
  reason?: string;
  delay?: number;
}

/**
 * Composant de redirection robuste qui évite les conflits avec le middleware
 */
export function AuthRedirect({ to, reason, delay = 100 }: AuthRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    const performRedirect = () => {
      if (redirectAttempted) return;
      
      console.log(`🔄 [AuthRedirect] Redirection vers ${to}${reason ? ` (${reason})` : ''}`);
      
      // Vérifier si on est déjà sur la page de destination
      if (pathname === to || pathname.includes('/auth/login')) {
        console.log('🔄 [AuthRedirect] Déjà sur la page de destination, pas de redirection');
        return;
      }
      
      setRedirectAttempted(true);
      
      // Essayer d'abord avec router.push
      try {
        router.push(to);
        
        // Si après 1 seconde on est toujours sur la même page, forcer la redirection
        setTimeout(() => {
          if (pathname !== to && !pathname.includes('/auth/login')) {
            console.log('🔄 [AuthRedirect] Redirection forcée avec window.location');
            window.location.href = to;
          }
        }, 1000);
        
      } catch (error) {
        console.error('❌ [AuthRedirect] Erreur de redirection:', error);
        // En cas d'erreur, utiliser window.location
        window.location.href = to;
      }
    };

    const timer = setTimeout(performRedirect, delay);
    return () => clearTimeout(timer);
  }, [to, reason, delay, router, pathname, redirectAttempted]);

  // Afficher un message pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">
          Redirection en cours...
        </p>
        {reason && (
          <p className="text-xs text-muted-foreground mt-2">
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthRedirect;
