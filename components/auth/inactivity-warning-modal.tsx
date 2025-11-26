'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Activity, RefreshCw } from 'lucide-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStayActive: () => void;
  timeRemaining: number; // Temps restant en secondes
}

export function InactivityWarningModal({ 
  isOpen, 
  onClose, 
  onStayActive, 
  timeRemaining 
}: InactivityWarningModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(timeRemaining);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeRemaining]);

  const handleStayActive = () => {
    onStayActive();
    onClose();
    // Réinitialiser aussi le countdown local
    setCountdown(timeRemaining);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Session bientôt expirée
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Votre session va expirer en raison de l&apos;inactivité
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Compte à rebours */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Activity className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-blue-800">
                Expiration dans {formatTime(countdown)}
              </p>
              <p className="text-sm text-blue-700">
                Effectuez une action pour maintenir votre session active
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              data-progress={Math.max(0, (countdown / timeRemaining) * 100)}
              style={{ 
                width: `${Math.max(0, (countdown / timeRemaining) * 100)}%` 
              }}
            />
          </div>

          {/* Explication */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Pour des raisons de sécurité, votre session expire automatiquement après une période d&apos;inactivité.
            </p>
            <p>
              Cliquez sur &quot;Rester connecté&quot; pour prolonger votre session ou effectuez une action sur la page.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          
          <Button
            onClick={handleStayActive}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Rester connecté
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
