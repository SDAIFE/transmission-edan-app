'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconnect: () => void;
}

export function SessionExpiredModal({ isOpen, onClose, onReconnect }: SessionExpiredModalProps) {
  const [countdown, setCountdown] = useState(15); // Augmenté à 15 secondes
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  const handleAutoRedirect = useCallback(() => {
    console.log('🔄 [SessionModal] Redirection automatique vers la page de connexion');
    router.push('/auth/login');
  }, [router]);

  // Détecter l'état de la connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(15);
      setIsReconnecting(false);
      setReconnectAttempts(0);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, handleAutoRedirect]);

  const handleReconnect = async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    setReconnectAttempts(prev => prev + 1);
    
    try {
      console.log(`🔄 [SessionModal] Tentative de reconnexion #${reconnectAttempts + 1}`);
      await onReconnect();
      onClose();
    } catch (error) {
      console.error('❌ [SessionModal] Échec de la reconnexion:', error);
      // La modal reste ouverte pour permettre une nouvelle tentative
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleManualRedirect = () => {
    console.log('🔄 [SessionModal] Redirection manuelle vers la page de connexion');
    router.push('/auth/login');
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Session expirée
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Votre session a expiré en raison d&apos;une période d&apos;inactivité
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Indicateur de connexion */}
          <div className={`flex items-center gap-2 p-2 rounded-lg ${
            isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Connexion active' : 'Connexion perdue'}
            </span>
          </div>

          {/* Compte à rebours */}
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-800">
                Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-orange-700">
                Vous serez redirigé vers la page de connexion
              </p>
            </div>
          </div>

          {/* Informations sur les tentatives de reconnexion */}
          {reconnectAttempts > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Tentative de reconnexion #{reconnectAttempts}
                {isReconnecting && ' en cours...'}
              </p>
            </div>
          )}

          {/* Explication */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Pour des raisons de sécurité, votre session expire automatiquement après une période d&apos;inactivité.
            </p>
            <p>
              Vous pouvez tenter de vous reconnecter automatiquement ou attendre la redirection.
            </p>
            {!isOnline && (
              <p className="text-red-600 font-medium">
                ⚠️ Vérifiez votre connexion internet avant de réessayer.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleManualRedirect}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Aller à la page de connexion
          </Button>
          
          <Button
            onClick={handleReconnect}
            disabled={isReconnecting || !isOnline}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
            {isReconnecting ? 'Reconnexion...' : 'Réessayer la connexion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
