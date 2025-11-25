"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InactivityWarningModal } from './inactivity-warning-modal';
import { useState } from 'react';

const INACTIVITY_TIMEOUT = 25 * 60 * 1000; // 25 minutes (avant le timeout final de 30 min)
const WARNING_DURATION = 5 * 60 * 1000; // 5 minutes pour répondre

interface InactivityDetectorProps {
  onLogout?: () => void;
}

/**
 * Composant pour détecter l'inactivité de l'utilisateur
 */
export function InactivityDetector({ onLogout }: InactivityDetectorProps) {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    
    // Réinitialiser les timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Redémarrer le timer d'avertissement
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      
      // Timer de déconnexion automatique
      logoutTimerRef.current = setTimeout(() => {
        if (onLogout) {
          onLogout();
        } else {
          logout();
        }
      }, WARNING_DURATION);
    }, INACTIVITY_TIMEOUT);
  }, [logout, onLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Événements à écouter pour détecter l'activité
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, true);
    });

    // Démarrer le premier timer
    handleActivity();

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [isAuthenticated, handleActivity]);

  const handleContinue = useCallback(() => {
    handleActivity();
  }, [handleActivity]);

  const handleLogoutNow = useCallback(() => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  }, [logout, onLogout]);

  if (!isAuthenticated) return null;

  return (
    <InactivityWarningModal
      open={showWarning}
      onContinue={handleContinue}
      onLogout={handleLogoutNow}
      timeRemaining={WARNING_DURATION}
    />
  );
}

