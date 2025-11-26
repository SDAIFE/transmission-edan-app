'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  Play,
  Pause,
  RotateCcw,
  Zap
} from 'lucide-react';

/**
 * Panneau de contrôle pour tester les fonctionnalités de session
 * À utiliser uniquement en développement
 */
export function SessionTestControls() {
  const { 
    isAuthenticated, 
    sessionExpired, 
    inactivityWarning, 
    handleSessionExpired, 
    showInactivityWarning
  } = useAuth();
  
  const [isTestMode, setIsTestMode] = useState(false);

  // Ne pas afficher en production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isTestMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTestMode(true)}
          className="bg-blue-50 hover:bg-blue-100 border-blue-200"
        >
          <Play className="h-4 w-4 mr-2" />
          Tests Session
        </Button>
      </div>
    );
  }

  const simulateInactivityWarning = () => {
    console.log('🧪 [Test] Simulation d\'un avertissement d\'inactivité');
    showInactivityWarning();
  };

  const simulateSessionExpired = () => {
    console.log('🧪 [Test] Simulation d\'une session expirée');
    handleSessionExpired(new CustomEvent('session-expired', { 
      detail: { 
        reason: 'test_simulation'
      } 
    }));
  };

  const simulateTokenRefreshError = () => {
    console.log('🧪 [Test] Simulation d\'une erreur de refresh de token');
    handleSessionExpired(new CustomEvent('session-expired', { 
      detail: { 
        reason: 'token_refresh_failed'
      } 
    }));
  };

  const triggerActivityEvent = () => {
    console.log('🧪 [Test] Déclenchement d\'un événement d\'activité');
    const activityEvent = new Event('mousedown');
    document.dispatchEvent(activityEvent);
  };

  const clearAuthToken = () => {
    console.log('🧪 [Test] Suppression manuelle du token d\'authentification');
    localStorage.removeItem('auth_token');
    // Déclencher l'événement de changement de stockage
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'auth_token',
      newValue: null,
      oldValue: 'test_token'
    }));
  };

  const simulateDashboardAccess = () => {
    console.log('🧪 [Test] Simulation d\'accès au dashboard après déconnexion');
    // Simuler une déconnexion puis un accès au dashboard
    localStorage.removeItem('auth_token');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const testRedirect = () => {
    console.log('🧪 [Test] Test de redirection vers /auth/login');
    window.location.href = '/auth/login';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white/95 backdrop-blur-sm border-blue-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-blue-900">
                Tests de Session
              </CardTitle>
              <CardDescription className="text-xs">
                Outils de test pour le développement
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTestMode(false)}
              className="h-6 w-6 p-0"
            >
              <Pause className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* État actuel */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">État actuel :</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant={isAuthenticated ? "default" : "secondary"} className="text-xs">
                {isAuthenticated ? "Connecté" : "Déconnecté"}
              </Badge>
              {sessionExpired && (
                <Badge variant="destructive" className="text-xs">
                  Session expirée
                </Badge>
              )}
              {inactivityWarning && (
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                  Warning inactivité
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Tests de simulation */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">Simulations :</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={simulateInactivityWarning}
                disabled={!isAuthenticated || inactivityWarning}
                className="text-xs h-8 justify-start"
              >
                <Clock className="h-3 w-3 mr-2" />
                Warning inactivité
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={simulateSessionExpired}
                disabled={!isAuthenticated || sessionExpired}
                className="text-xs h-8 justify-start"
              >
                <AlertTriangle className="h-3 w-3 mr-2" />
                Session expirée
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={simulateTokenRefreshError}
                disabled={!isAuthenticated}
                className="text-xs h-8 justify-start"
              >
                <Zap className="h-3 w-3 mr-2" />
                Erreur refresh token
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions de contrôle */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">Actions :</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerActivityEvent}
                disabled={!isAuthenticated}
                className="text-xs h-8 justify-start"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Simuler activité
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearAuthToken}
                disabled={!isAuthenticated}
                className="text-xs h-8 justify-start"
              >
                <LogOut className="h-3 w-3 mr-2" />
                Supprimer token
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={simulateDashboardAccess}
                disabled={!isAuthenticated}
                className="text-xs h-8 justify-start"
              >
                <Play className="h-3 w-3 mr-2" />
                Test Dashboard
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={testRedirect}
                className="text-xs h-8 justify-start"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Test Redirect
              </Button>

              {(sessionExpired || inactivityWarning) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reset des états - fonctionnalité à implémenter si nécessaire
                    console.log('Reset des états de session');
                  }}
                  className="text-xs h-8 justify-start"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Reset états
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionTestControls;
