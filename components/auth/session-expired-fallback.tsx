'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ✅ CORRECTION : Composant de fallback pour les sessions expirées
 * 
 * Ce composant s'affiche quand :
 * - L'utilisateur est dans un état d'erreur d'authentification
 * - La modal de session expirée ne s'affiche pas correctement
 * - L'utilisateur reste bloqué sur "Vérification..."
 */
export function SessionExpiredFallback() {
  const { error, sessionExpired, logout, refreshAuth } = useAuth();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const router = useRouter();

  // Afficher ce composant seulement si on a une erreur de session
  if (!error || !sessionExpired) {
    return null;
  }

  const handleReconnect = async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    
    try {
      console.log('🔄 [SessionFallback] Tentative de reconnexion...');
      const success = await refreshAuth();
      
      if (success) {
        console.log('✅ [SessionFallback] Reconnexion réussie');
        // Recharger la page pour remettre l'état à jour
        window.location.reload();
      } else {
        console.log('❌ [SessionFallback] Reconnexion échouée, déconnexion...');
        await logout();
      }
    } catch (error) {
      console.error('❌ [SessionFallback] Erreur lors de la reconnexion:', error);
      await logout();
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleLogout = async () => {
    console.log('🔒 [SessionFallback] Déconnexion manuelle...');
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle>Session expirée</CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>
              Votre session a expiré en raison d'une période d'inactivité.
            </p>
            <p className="mt-2">
              Vous pouvez tenter de vous reconnecter automatiquement ou vous déconnecter.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
              {isReconnecting ? 'Reconnexion...' : 'Réessayer la connexion'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isReconnecting}
            >
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionExpiredFallback;
