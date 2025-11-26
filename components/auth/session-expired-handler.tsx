'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SessionExpiredModal } from './session-expired-modal';

/**
 * ✅ Gestionnaire global d'expiration de session
 * 
 * Ce composant :
 * - Écoute l'événement global 'session-expired' 
 * - Affiche une modal informative
 * - Déconnecte automatiquement l'utilisateur
 * - Redirige vers la page de connexion
 * 
 * L'événement 'session-expired' est déclenché par :
 * - L'intercepteur Axios (erreur 401 après échec du refresh)
 * - InactivityDetector (inactivité prolongée)
 * - SessionManager (token invalide détecté)
 */
export function SessionExpiredHandler() {
  const { isAuthenticated, logout, refreshAuth, sessionExpired } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const lastEventTimeRef = useRef<number>(0);

  useEffect(() => {
    // Ne gérer l'événement que si l'utilisateur est authentifié
    if (!isAuthenticated) {
      // ✅ CORRECTION : Fermer la modal si l'utilisateur n'est plus authentifié
      setIsModalOpen(false);
      setIsProcessing(false);
      return;
    }

    const handleSessionExpired = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const reason = customEvent.detail?.reason || 'unknown';
      const now = Date.now();
      
      // ✅ CORRECTION : Éviter les déclenchements multiples (débounce de 2 secondes)
      if (now - lastEventTimeRef.current < 2000) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 [SessionExpiredHandler] Événement ignoré (trop récent)');
        }
        return;
      }
      lastEventTimeRef.current = now;
      
      // ✅ CORRECTION : Vérifier si une connexion récente a eu lieu
      const lastReconnect = typeof window !== 'undefined' 
        ? sessionStorage.getItem('lastReconnect') 
        : null;
      
      if (lastReconnect) {
        const timeSinceReconnect = Date.now() - parseInt(lastReconnect, 10);
        if (timeSinceReconnect < 5000) { // 5 secondes
          if (process.env.NODE_ENV === 'development') {
            console.log('🔒 [SessionExpiredHandler] Connexion récente détectée, ignorer l\'expiration');
          }
          return; // Ne pas afficher la modal
        }
      }
      
      // ✅ CORRECTION : Ne pas traiter si on est déjà en train de traiter une expiration
      if (isProcessing || isModalOpen) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 [SessionExpiredHandler] Déjà en cours de traitement, ignorer');
        }
        return;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 [SessionExpiredHandler] Session expirée détectée:', reason);
      }

      setIsProcessing(true);
      setIsModalOpen(true);
    };

    // Ajouter le listener pour l'événement personnalisé
    window.addEventListener('session-expired', handleSessionExpired);
    window.addEventListener('auth-session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, [isAuthenticated, isProcessing, isModalOpen, sessionExpired]);

  /**
   * Tentative de reconnexion avec le refresh token
   */
  const handleReconnect = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [SessionExpiredHandler] Tentative de reconnexion...');
      }
      
      const success = await refreshAuth();
      
      if (success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [SessionExpiredHandler] Reconnexion réussie');
        }
        setIsModalOpen(false);
        setIsProcessing(false);
        // ✅ CORRECTION : Marquer la reconnexion pour éviter les expirations intempestives
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastReconnect', Date.now().toString());
        }
        // Recharger la page pour remettre l'état à jour
        window.location.reload();
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ [SessionExpiredHandler] Reconnexion échouée, déconnexion...');
        }
        setIsProcessing(false);
        // Si la reconnexion échoue, déconnecter
        await logout();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [SessionExpiredHandler] Erreur lors de la reconnexion:', error);
      }
      setIsProcessing(false);
      // En cas d'erreur, déconnecter
      await logout();
    }
  };

  /**
   * Fermeture de la modal (déconnexion)
   */
  const handleClose = async () => {
    if (isProcessing) return;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 [SessionExpiredHandler] Fermeture de la modal, déconnexion...');
    }
    
    setIsModalOpen(false);
    setIsProcessing(false);
    await logout();
  };
  
  // ✅ CORRECTION : Fermer la modal si l'utilisateur n'est plus authentifié ou si sessionExpired est false
  useEffect(() => {
    if (!isAuthenticated || !sessionExpired) {
      setIsModalOpen(false);
      setIsProcessing(false);
    }
  }, [isAuthenticated, sessionExpired]);

  return (
    <SessionExpiredModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onReconnect={handleReconnect}
    />
  );
}

export default SessionExpiredHandler;

