'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAuthCookie } from '@/actions/auth.action';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

/**
 * Composant de protection de routes - Version professionnelle
 * 
 * Caractéristiques :
 * - Logique simple et prévisible
 * - Pas de boucles infinies
 * - Gestion d'état claire
 * - Redirections contrôlées
 */
export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/dashboard',
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // ✅ CORRECTION : Nettoyer les cookies expirés avant toute chose
  useEffect(() => {
    const cleanupExpiredSession = async () => {
      // Si on détecte une erreur de session et qu'on n'est pas en train de nettoyer
      if (error && !isCleaningUp && !isLoading) {
        setIsCleaningUp(true);
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('🧹 [ProtectedRoute] Nettoyage des cookies expirés...');
          }
          await deleteAuthCookie();
          clearError();
        } catch (cleanupError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ [ProtectedRoute] Erreur lors du nettoyage:', cleanupError);
          }
        } finally {
          setIsCleaningUp(false);
        }
      }
    };

    cleanupExpiredSession();
  }, [error, isLoading, isCleaningUp, clearError]);

  // Redirection automatique si non authentifié
  useEffect(() => {
    if (!requireAuth) return;
    
    // Attendre la fin du chargement et du nettoyage
    if (isLoading || isCleaningUp) return;
    
    // Si pas authentifié et pas déjà sur une page d'auth
    if (!isAuthenticated && !pathname.startsWith('/auth')) {
      router.replace('/auth/login');
      return;
    }
  }, [isAuthenticated, isLoading, isCleaningUp, requireAuth, pathname, router]);

  // Redirection pour permissions insuffisantes
  useEffect(() => {
    if (!requireAuth || isLoading || !isAuthenticated || !user || !requiredRole) return;
    
    const userRole = user.role?.code;
    const hasPermission = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;
      
    if (!hasPermission) {
      router.replace(fallbackPath);
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, fallbackPath, requireAuth, router]);

  // Affichage pendant le chargement ou le nettoyage
  if (isLoading || isCleaningUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle>
              {isCleaningUp ? 'Nettoyage' : 'Vérification'}
            </CardTitle>
            <CardDescription>
              {isCleaningUp 
                ? 'Nettoyage de la session expirée...' 
                : 'Vérification de votre authentification en cours...'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ✅ CORRECTION : En cas d'erreur, nettoyer et rediriger automatiquement
  if (error && !isCleaningUp) {
    // Nettoyer les cookies et rediriger
    const handleReconnect = async () => {
      setIsCleaningUp(true);
      try {
        await deleteAuthCookie();
        clearError();
        router.replace('/auth/login');
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [ProtectedRoute] Erreur lors de la redirection:', err);
        }
        router.replace('/auth/login');
      } finally {
        setIsCleaningUp(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle>Session expirée</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleReconnect}
              className="w-full"
              disabled={isCleaningUp}
            >
              {isCleaningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se reconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ CORRECTION : Si auth requise mais pas authentifié, nettoyer et rediriger
  if (requireAuth && !isAuthenticated) {
    const handleLogin = async () => {
      setIsCleaningUp(true);
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 [ProtectedRoute] Nettoyage avant redirection vers login...');
        }
        // Nettoyer les cookies expirés avant la redirection
        await deleteAuthCookie();
        clearError();
        // Redirection programmatique
        router.replace('/auth/login');
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [ProtectedRoute] Erreur lors du nettoyage:', err);
        }
        // Forcer la redirection même en cas d'erreur
        router.replace('/auth/login');
      } finally {
        setIsCleaningUp(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle>Authentification requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogin}
              className="w-full"
              disabled={isCleaningUp}
            >
              {isCleaningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérification des permissions
  if (requireAuth && isAuthenticated && requiredRole && user) {
    const userRole = user.role?.code;
    const hasPermission = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;
      
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle>Accès restreint</CardTitle>
              <CardDescription>
                Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={fallbackPath}>Retour</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Tout est OK, afficher le contenu
  return <>{children}</>;
}

export default ProtectedRoute;
