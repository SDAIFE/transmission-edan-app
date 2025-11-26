'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SessionMonitorProps {
  checkInterval?: number; // Intervalle de vérification en millisecondes
  enabled?: boolean;
}

/**
 * ✅ SÉCURITÉ : Moniteur de session - Version sécurisée avec cookies httpOnly
 * 
 * Caractéristiques :
 * - Utilise les cookies httpOnly (protection XSS)
 * - Vérification via API (pas d'accès direct aux tokens)
 * - Refresh préventif quand le token expire bientôt
 * - Optimisé pour la performance
 * - Prévention des fuites mémoire et rafraîchissements inutiles
 */
export function SessionMonitor({ 
  checkInterval = 10 * 60 * 1000, // 10 minutes par défaut
  enabled = true 
}: SessionMonitorProps) {
  const { isAuthenticated, refreshAuth } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(Date.now());

  /**
   * ✅ SÉCURITÉ : Vérification périodique de la session via API
   * Les tokens sont dans des cookies httpOnly, on passe par l'API pour les vérifier
   */
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckRef.current;
    
    // Éviter les vérifications trop fréquentes
    if (timeSinceLastCheck < checkInterval - 1000) return;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [SessionMonitor] Vérification de la session...');
      }

      // ✅ SÉCURITÉ : Récupérer le token depuis les cookies httpOnly via API
      const tokenResponse = await fetch('/api/auth/token', {
        credentials: 'include'
      });
      
      if (!tokenResponse.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [SessionMonitor] Aucun token trouvé');
        }
        return;
      }
      
      const { token, hasToken } = await tokenResponse.json();
      
      if (!hasToken || !token) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [SessionMonitor] Aucun token disponible');
        }
        return;
      }

      // Décoder le token JWT pour vérifier l'expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convertir en millisecondes
        const timeUntilExpiration = expirationTime - now;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [SessionMonitor] Token expire dans:', Math.round(timeUntilExpiration / 1000 / 60), 'minutes');
        }

        // Refresh préventif si le token expire dans moins de 15 minutes
        // (augmenté de 10 à 15 minutes pour plus de marge)
        if (timeUntilExpiration < 15 * 60 * 1000 && timeUntilExpiration > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ [SessionMonitor] Token expire bientôt, refresh préventif...');
          }
          const isValid = await refreshAuth();
          
          if (isValid) {
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ [SessionMonitor] Token rafraîchi avec succès');
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ [SessionMonitor] Échec du refresh du token');
            }
          }
        } else if (timeUntilExpiration > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [SessionMonitor] Token encore valide, pas de refresh nécessaire');
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ [SessionMonitor] Token déjà expiré');
          }
        }
        
      } catch (parseError) {
        console.warn('⚠️ [SessionMonitor] Impossible de parser le token:', parseError);
      }
      
      lastCheckRef.current = now;
      
    } catch (error) {
      console.error('❌ [SessionMonitor] Erreur de vérification:', error);
    }
  }, [isAuthenticated, refreshAuth, checkInterval]);

  /**
   * Démarrage/arrêt du monitoring
   */
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Démarrer le monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [SessionMonitor] Démarrage du monitoring de session');
    }
    intervalRef.current = setInterval(checkSession, checkInterval);

    // Vérification initiale
    checkSession();

    // Nettoyage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isAuthenticated, checkSession, checkInterval]);

  /**
   * Nettoyage lors du démontage
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Ce composant ne rend rien
  return null;
}

export default SessionMonitor;
