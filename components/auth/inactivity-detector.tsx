'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface InactivityDetectorProps {
  timeout?: number; // Délai d'inactivité en millisecondes (défaut: 3 heures)
  warningTime?: number; // Temps d'avertissement avant expiration (défaut: 5 minutes)
  onWarning?: () => void; // Callback appelé avant l'expiration
  onExpire?: () => void; // Callback appelé lors de l'expiration
}

export function InactivityDetector({
  timeout = 3 * 60 * 60 * 1000, // ✅ 3 heures par défaut (plateforme professionnelle)
  warningTime = 5 * 60 * 1000, // 5 minutes d'avertissement
  onWarning,
  onExpire
}: InactivityDetectorProps) {
  const { isAuthenticated, handleSessionExpired, showInactivityWarning, sessionExpired, inactivityWarning } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isWarningShownRef = useRef<boolean>(false);
  const activityThrottleRef = useRef<NodeJS.Timeout | null>(null);

  // Calculer les timings optimisés
  const timings = useMemo(() => {
    const warningDelay = Math.max(timeout - warningTime, timeout * 0.1); // Au moins 10% du timeout
    const effectiveWarningTime = timeout - warningDelay;
    
    return {
      warningDelay,
      effectiveWarningTime,
      activityThrottle: 2000, // Throttle les événements à 2 secondes
    };
  }, [timeout, warningTime]);

  // Fonction pour nettoyer tous les timers
  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (activityThrottleRef.current) {
      clearTimeout(activityThrottleRef.current);
      activityThrottleRef.current = null;
    }
  }, []);

  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    // Ne pas démarrer si une session est déjà expirée ou en warning
    if (!isAuthenticated || sessionExpired || inactivityWarning) return;

    // ✅ CORRECTION : Vérifier si une connexion récente a eu lieu
    const lastReconnect = typeof window !== 'undefined' 
      ? sessionStorage.getItem('lastReconnect') 
      : null;
    
    if (lastReconnect) {
      const timeSinceReconnect = Date.now() - parseInt(lastReconnect, 10);
      if (timeSinceReconnect < 5000) { // 5 secondes
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [InactivityDetector] Connexion récente, réinitialisation du timer');
        }
        // Réinitialiser le timer mais ne pas déclencher d'expiration
      }
    }

    const now = Date.now();
    lastActivityRef.current = now;
    isWarningShownRef.current = false;

    // Nettoyer les timers existants
    clearAllTimers();

    console.log('🔄 [InactivityDetector] Réinitialisation des timers d\'inactivité');

    // Timer d'avertissement
    warningTimeoutRef.current = setTimeout(() => {
      // Double vérification avant d'afficher le warning
      if (isAuthenticated && !isWarningShownRef.current && !sessionExpired && !inactivityWarning) {
        console.log('⚠️ [InactivityDetector] Avertissement d\'inactivité imminent');
        isWarningShownRef.current = true;
        showInactivityWarning();
        onWarning?.();
      }
    }, timings.warningDelay);

    // Timer d'expiration
    timeoutRef.current = setTimeout(() => {
      // Triple vérification avant d'expirer la session
      if (isAuthenticated && !sessionExpired) {
        console.log('⏰ [InactivityDetector] Session expirée par inactivité');
        onExpire?.();
        handleSessionExpired(new CustomEvent('session-expired', { 
          detail: { 
            reason: 'user_inactivity',
            inactivityDuration: timeout 
          } 
        }));
      }
    }, timeout);
  }, [
    isAuthenticated, 
    sessionExpired, 
    inactivityWarning, 
    timings.warningDelay, 
    timeout, 
    clearAllTimers, 
    showInactivityWarning, 
    onWarning, 
    onExpire, 
    handleSessionExpired
  ]);

  // Fonction throttlée pour détecter l'activité utilisateur
  const handleActivity = useCallback(() => {
    if (!isAuthenticated || sessionExpired) return;
    
    // Throttle les événements d'activité pour éviter les appels excessifs
    if (activityThrottleRef.current) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Réinitialiser si l'activité est significative
    if (timeSinceLastActivity > timings.activityThrottle) {
      console.log('🔄 [InactivityDetector] Activité détectée, réinitialisation du timer');
      resetInactivityTimer();
      
      // Throttle les prochains événements
      activityThrottleRef.current = setTimeout(() => {
        activityThrottleRef.current = null;
      }, timings.activityThrottle);
    }
  }, [isAuthenticated, sessionExpired, timings.activityThrottle, resetInactivityTimer]);

  // Liste optimisée des événements à écouter
  const activityEvents = useMemo(() => [
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click',
    'focus',
    'visibilitychange' // Détecter le retour sur l'onglet
  ], []);

  // Gestionnaire pour la visibilité de la page
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && isAuthenticated && !sessionExpired) {
      console.log('👁️ [InactivityDetector] Page redevenue visible, vérification du timer');
      
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Si l'utilisateur revient après une longue absence, on considère ça comme de l'activité
      if (timeSinceLastActivity > timeout * 0.5) {
        resetInactivityTimer();
      }
    }
  }, [isAuthenticated, sessionExpired, timeout, resetInactivityTimer]);

  // Gestionnaire principal des événements
  useEffect(() => {
    if (!isAuthenticated || sessionExpired) {
      clearAllTimers();
      return;
    }

    // Ajouter les écouteurs d'événements avec options optimisées
    activityEvents.forEach(event => {
      if (event === 'visibilitychange') {
        document.addEventListener(event, handleVisibilityChange, { passive: true });
      } else {
        document.addEventListener(event, handleActivity, { passive: true, capture: true });
      }
    });

    // Initialiser le timer
    resetInactivityTimer();

    // Nettoyage
    return () => {
      activityEvents.forEach(event => {
        if (event === 'visibilitychange') {
          document.removeEventListener(event, handleVisibilityChange);
        } else {
          document.removeEventListener(event, handleActivity, true);
        }
      });
      clearAllTimers();
    };
  }, [
    isAuthenticated, 
    sessionExpired, 
    activityEvents, 
    handleActivity, 
    handleVisibilityChange, 
    resetInactivityTimer, 
    clearAllTimers
  ]);

  // Nettoyer les timers quand les états de session changent
  useEffect(() => {
    if (sessionExpired || inactivityWarning) {
      clearAllTimers();
    }
  }, [sessionExpired, inactivityWarning, clearAllTimers]);

  // Ce composant ne rend rien, il sert juste à détecter l'inactivité
  return null;
}

export default InactivityDetector;
