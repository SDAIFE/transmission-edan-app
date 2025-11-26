'use client';

/**
 * ⚠️ DÉPRÉCIÉ : Ce composant est obsolète et ne doit plus être utilisé
 * 
 * Raison :
 * - Utilise localStorage (ancien système, vulnérable XSS)
 * - Doublon avec SessionMonitor qui utilise les cookies httpOnly sécurisés
 * - Crée des conflits et des vérifications redondantes
 * 
 * Utiliser à la place : SessionMonitor (dans app/layout.tsx)
 * 
 * Ce fichier est conservé temporairement pour référence mais ne doit pas être utilisé.
 * Il sera supprimé dans une prochaine version.
 */

/* ANCIEN CODE - NE PLUS UTILISER

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function SessionManager() {
  const { isAuthenticated, sessionExpired, handleSessionExpired } = useAuth();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTokenCheckRef = useRef<number>(Date.now());

  // Vérification périodique de la validité du token côté client
  const checkTokenValidity = useCallback(async () => {
    if (!isAuthenticated || sessionExpired) return;

    const now = Date.now();
    const timeSinceLastCheck = now - lastTokenCheckRef.current;
    
    // Vérifier le token toutes les 10 minutes pour éviter les conflits
    if (timeSinceLastCheck < 10 * 60 * 1000) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('🔍 [SessionManager] Aucun token trouvé, déconnexion');
        handleSessionExpired(new CustomEvent('session-expired', { 
          detail: { 
            reason: 'no_token_found'
          } 
        }));
        return;
      }

      // Vérifier l'expiration du token côté client (JWT decode basique)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convertir en millisecondes
        
        if (now >= expirationTime) {
          console.log('🔍 [SessionManager] Token expiré côté client');
          handleSessionExpired(new CustomEvent('session-expired', { 
            detail: { 
              reason: 'token_expired_client_side'
            } 
          }));
          return;
        }
        
        // Si le token expire dans moins de 5 minutes, déclencher un warning
        const timeUntilExpiration = expirationTime - now;
        if (timeUntilExpiration < 5 * 60 * 1000) {
          console.log('⚠️ [SessionManager] Token expire bientôt, tentative de refresh préventif');
          // Ici on pourrait déclencher un refresh préventif si nécessaire
        }
        
      } catch (parseError) {
        console.warn('⚠️ [SessionManager] Impossible de parser le token:', parseError);
        // Si on ne peut pas parser le token, considérer comme invalide
        handleSessionExpired(new CustomEvent('session-expired', { 
          detail: { 
            reason: 'token_parse_error'
          } 
        }));
        return;
      }

      lastTokenCheckRef.current = now;
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur lors de la vérification du token:', error);
    }
  }, [isAuthenticated, sessionExpired, handleSessionExpired]);

  // Gestionnaire des événements de stockage (détection de déconnexion depuis un autre onglet)
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === 'auth_token' && e.newValue === null && isAuthenticated) {
      console.log('🔍 [SessionManager] Token supprimé dans un autre onglet, synchronisation');
      handleSessionExpired(new CustomEvent('session-expired', { 
        detail: { 
          reason: 'token_removed_other_tab'
        } 
      }));
    }
  }, [isAuthenticated, handleSessionExpired]);

  // Gestionnaire de visibilité de page pour la vérification à la reprise
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && isAuthenticated && !sessionExpired) {
      console.log('👁️ [SessionManager] Page redevenue visible, vérification du token');
      checkTokenValidity();
    }
  }, [isAuthenticated, sessionExpired, checkTokenValidity]);

  // Configuration des gestionnaires d'événements
  useEffect(() => {
    if (!isAuthenticated) {
      // Nettoyer l'intervalle si pas authentifié
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
      return;
    }

    // Démarrer la vérification périodique
    sessionCheckIntervalRef.current = setInterval(checkTokenValidity, 10 * 60 * 1000); // Toutes les 10 minutes

    // Ajouter les écouteurs d'événements
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Vérification initiale
    checkTokenValidity();

    // Nettoyage
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, checkTokenValidity, handleStorageChange, handleVisibilityChange]);

  // Nettoyage lors de l'expiration de session
  useEffect(() => {
    if (sessionExpired && sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
  }, [sessionExpired]);

  // Ce composant ne rend rien, il sert juste à gérer la session
  return null;
}

FIN ANCIEN CODE */

/**
 * ⚠️ Version vide du SessionManager pour éviter les erreurs de compatibilité
 * Ce composant ne fait rien et doit être remplacé par SessionMonitor
 */
export function SessionManager() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ SessionManager est déprécié. Utilisez SessionMonitor à la place.');
  }
  return null;
}

export default SessionManager;
