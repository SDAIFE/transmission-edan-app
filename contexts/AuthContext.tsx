"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { UserResponseDto, LoginDto, RegisterDto, UserRole } from '@/types/auth';
import * as authService from '@/lib/services/auth.service';
import { isUserLoggedIn } from '@/lib/utils/auth';

/**
 * États de l'authentification
 */
type AuthState = 'IDLE' | 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'ERROR';

interface AuthContextType {
  // État
  state: AuthState;
  user: UserResponseDto | null;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Utilitaires
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CHECK_TOKEN_INTERVAL = 5 * 60 * 1000; // 5 minutes

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>('IDLE');
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const checkTokenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const activityCleanupRef = useRef<(() => void) | null>(null);

  /**
   * Réinitialise les timers
   */
  const resetTimers = useCallback(() => {
    // Nettoyer les anciens timers
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (checkTokenTimerRef.current) clearInterval(checkTokenTimerRef.current);
    if (activityCleanupRef.current) {
      activityCleanupRef.current();
      activityCleanupRef.current = null;
    }
  }, []);

  /**
   * Gère la déconnexion
   */
  const handleLogout = useCallback(async () => {
    resetTimers();
    setState('UNAUTHENTICATED');
    setUser(null);
    setError(null);
    
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      router.push('/auth/login');
    }
  }, [router, resetTimers]);

  /**
   * Démarre les timers de session
   */
  const startSessionTimers = useCallback(() => {
    resetTimers();
    lastActivityRef.current = Date.now();

    // Timer de refresh automatique
    refreshTimerRef.current = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (err) {
        console.error('Erreur lors du refresh automatique:', err);
      }
    }, REFRESH_INTERVAL);

    // Timer de vérification du token
    checkTokenTimerRef.current = setInterval(async () => {
      try {
        const isValid = await authService.verifyToken();
        if (!isValid) {
          handleLogout();
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du token:', err);
        handleLogout();
      }
    }, CHECK_TOKEN_INTERVAL);

    // Timer d'inactivité
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    resetInactivityTimer();

    // Écouter les événements d'activité
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    activityCleanupRef.current = () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimers, handleLogout]);

  /**
   * Vérifie l'état d'authentification au chargement
   */
  useEffect(() => {
    const checkAuth = async () => {
      setState('LOADING');
      
      try {
        // Vérifier si on a des cookies indiquant une session
        if (isUserLoggedIn()) {
          // Essayer de récupérer l'utilisateur
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setState('AUTHENTICATED');
            startSessionTimers();
          } catch {
            // Token invalide ou expiré
            setState('UNAUTHENTICATED');
          }
        } else {
          setState('UNAUTHENTICATED');
        }
      } catch {
        setState('ERROR');
        setError('Erreur lors de la vérification de l\'authentification');
      }
    };

    checkAuth();

    // Écouter les événements de synchronisation entre onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth:logout') {
        handleLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:unauthorized', handleLogout);

    return () => {
      resetTimers();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:unauthorized', handleLogout);
    };
  }, [handleLogout, startSessionTimers, resetTimers]);

  /**
   * Connexion
   */
  const login = useCallback(async (credentials: LoginDto) => {
    setState('LOADING');
    setError(null);

    try {
      const { user: userData } = await authService.login(credentials);
      setUser(userData);
      setState('AUTHENTICATED');
      startSessionTimers();
      router.push('/dashboard');
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Erreur lors de la connexion');
        setState('ERROR');
        setError(message);
        throw new Error(message);
    }
  }, [router, startSessionTimers]);

  /**
   * Inscription
   */
  const register = useCallback(async (userData: RegisterDto) => {
    setState('LOADING');
    setError(null);

    try {
      await authService.register(userData);
      // Après inscription, connecter l'utilisateur
      await login({ email: userData.email, password: userData.password });
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Erreur lors de l\'inscription');
      setState('ERROR');
      setError(message);
      throw new Error(message);
    }
  }, [login]);

  /**
   * Déconnexion
   */
  const logout = useCallback(async () => {
    // Notifier les autres onglets
    localStorage.setItem('auth:logout', Date.now().toString());
    await handleLogout();
  }, [handleLogout]);

  /**
   * Rafraîchit les données utilisateur
   */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
      await handleLogout();
    }
  }, [handleLogout]);

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }, [user]);

  // Valeurs calculées
  const isAuthenticated = useMemo(() => state === 'AUTHENTICATED' && user !== null, [state, user]);
  const isLoading = useMemo(() => state === 'LOADING' || state === 'IDLE', [state]);

  const value = useMemo<AuthContextType>(() => ({
    state,
    user,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
    hasRole,
    isLoading,
  }), [state, user, error, login, register, logout, refreshUser, isAuthenticated, hasRole, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook pour vérifier les permissions
 */
export function usePermissions() {
  const { user, hasRole } = useAuth();

  const isAdmin = useMemo(() => hasRole(['ADMIN', 'SADMIN']), [hasRole]);
  const isSuperAdmin = useMemo(() => hasRole('SADMIN'), [hasRole]);
  const isUser = useMemo(() => hasRole('USER'), [hasRole]);

  return {
    isAdmin,
    isSuperAdmin,
    isUser,
    hasRole,
    user,
  };
}
