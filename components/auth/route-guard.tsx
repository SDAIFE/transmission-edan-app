'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import AuthRedirect from './auth-redirect';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallbackPath?: string;
}

/**
 * Composant de protection de route qui synchronise avec le middleware
 * et gère les états de transition après déconnexion
 */
export function RouteGuard({ 
  children, 
  requiredRole, 
  fallbackPath = '/dashboard' 
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading, sessionExpired } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Vérification de l'authentification
  useEffect(() => {
    // Ne pas vérifier si on est déjà en train de rediriger
    if (isRedirecting) return;
    
    // Attendre la fin du chargement
    if (isLoading) return;
    
    // Si la session est expirée, rediriger
    if (sessionExpired) {
      console.log('🛡️ [RouteGuard] Session expirée détectée, redirection');
      setIsRedirecting(true);
      return;
    }
    
    // Si pas authentifié, rediriger
    if (!isAuthenticated) {
      console.log('🛡️ [RouteGuard] Non authentifié, redirection');
      setIsRedirecting(true);
      return;
    }
    
    // Si authentifié, vérifier les permissions
    if (isAuthenticated && user && requiredRole) {
      const userRole = user.role?.code;
      const hasPermission = Array.isArray(requiredRole) 
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;
        
      if (!hasPermission) {
        console.log('🛡️ [RouteGuard] Permissions insuffisantes, redirection vers:', fallbackPath);
        setIsRedirecting(true);
        return;
      }
    }
    
  }, [isAuthenticated, isLoading, sessionExpired, user, requiredRole, fallbackPath, isRedirecting]);

  // Reset de l'état de redirection quand l'authentification change
  useEffect(() => {
    setIsRedirecting(false);
  }, [isAuthenticated, sessionExpired]);

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle>Vérification de l&apos;authentification</CardTitle>
            <CardDescription>
              Veuillez patienter pendant la vérification de votre session...
            </CardDescription>
          </CardHeader>
        </Card>
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

export default RouteGuard;
