'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function SessionNotifications() {
  const { isAuthenticated, sessionExpired, inactivityWarning } = useAuth();

  // Notification pour l'avertissement d'inactivité
  useEffect(() => {
    if (inactivityWarning && isAuthenticated) {
      toast.warning('Session bientôt expirée', {
        description: 'Votre session va expirer dans 5 minutes en raison de l\'inactivité. Effectuez une action pour la prolonger.',
        duration: 10000,
        action: {
          label: 'Compris',
          onClick: () => {
            // L'utilisateur peut cliquer pour fermer la notification
          }
        }
      });
    }
  }, [inactivityWarning, isAuthenticated]);

  // Notification pour la session expirée
  useEffect(() => {
    if (sessionExpired) {
      toast.error('Session expirée', {
        description: 'Votre session a expiré. Vous allez être redirigé vers la page de connexion.',
        duration: 5000,
      });
    }
  }, [sessionExpired]);

  // Notification de reconnexion réussie
  useEffect(() => {
    if (isAuthenticated && !sessionExpired && !inactivityWarning) {
      // Détecter si l'utilisateur vient de se reconnecter
      const lastReconnect = sessionStorage.getItem('lastReconnect');
      const now = Date.now();
      
      if (lastReconnect && (now - parseInt(lastReconnect)) < 5000) {
        toast.success('Reconnexion réussie', {
          description: 'Votre session a été restaurée avec succès.',
          duration: 3000,
        });
        sessionStorage.removeItem('lastReconnect');
      }
    }
  }, [isAuthenticated, sessionExpired, inactivityWarning]);

  return null;
}
