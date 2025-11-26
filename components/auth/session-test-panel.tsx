'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export function SessionTestPanel() {
  const { 
    isAuthenticated, 
    sessionExpired, 
    inactivityWarning, 
    showInactivityWarning
  } = useAuth();
  
  const [isOnline, setIsOnline] = useState(true);

  // Détecter l'état de la connexion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Initialiser l'état
    setIsOnline(navigator.onLine);

    // Ajouter les écouteurs
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Nettoyage
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Test de Session
        </CardTitle>
        <CardDescription>
          Panneau de test pour la gestion des sessions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* État de la connexion */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm">
            Connexion: {isOnline ? 'Active' : 'Perdue'}
          </span>
        </div>

        {/* État de la session */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={sessionExpired ? 'destructive' : 'secondary'}>
              Session: {sessionExpired ? 'Expirée' : 'Active'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={inactivityWarning ? 'destructive' : 'secondary'}>
              Avertissement: {inactivityWarning ? 'Affiché' : 'Masqué'}
            </Badge>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="space-y-2">
          <Button
            onClick={showInactivityWarning}
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={inactivityWarning}
          >
            <AlertTriangle className="h-4 w-4" />
            Tester l&apos;avertissement d&apos;inactivité
          </Button>
          
          <Button
            onClick={() => {
              // Fonctionnalité à implémenter si nécessaire
              console.log('Clear inactivity warning');
            }}
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={!inactivityWarning}
          >
            <RefreshCw className="h-4 w-4" />
            Masquer l&apos;avertissement
          </Button>
          
          <Button
            onClick={() => {
              // Simuler l'expiration de session
              const event = new CustomEvent('session-expired', { detail: { reason: 'manual-test' } });
              window.dispatchEvent(event);
            }}
            variant="destructive"
            className="w-full flex items-center gap-2"
            disabled={sessionExpired}
          >
            <AlertTriangle className="h-4 w-4" />
            Simuler l&apos;expiration de session
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• L&apos;avertissement d&apos;inactivité apparaît 5 minutes avant l&apos;expiration</p>
          <p>• La session expire après 30 minutes d&apos;inactivité</p>
          <p>• Les erreurs réseau sont gérées séparément des erreurs d&apos;authentification</p>
        </div>
      </CardContent>
    </Card>
  );
}
