'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthRedirect from './auth-redirect';

interface SimpleRouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallbackPath?: string;
}

/**
 * Version simplifiée du RouteGuard qui évite les boucles infinies
 */
export function SimpleRouteGuard({ 
  children, 
  requiredRole, 
  fallbackPath = '/dashboard' 
}: SimpleRouteGuardProps) {
  const { user, isAuthenticated, sessionExpired } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  // Vérification unique au montage
  useEffect(() => {
    if (hasChecked) return;
    
    setHasChecked(true);
  }, [hasChecked]);

  // Si encore en cours de chargement
  if (!hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Vérification de l&apos;authentification...
          </p>
        </div>
      </div>
    );
  }

  // Si session expirée, rediriger automatiquement
  if (sessionExpired) {
    return <AuthRedirect to="/auth/login" reason="Session expirée" />;
  }

  // Si pas authentifié, rediriger automatiquement
  if (!isAuthenticated) {
    return <AuthRedirect to="/auth/login" reason="Non authentifié" />;
  }

  // Si permissions insuffisantes
  if (requiredRole && user) {
    const userRole = user.role?.code;
    const hasPermission = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;
      
    if (!hasPermission) {
      return <AuthRedirect to={fallbackPath} reason="Permissions insuffisantes" />;
    }
  }

  // Tout est OK, afficher le contenu
  return <>{children}</>;
}

export default SimpleRouteGuard;
