"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
// ✅ SÉCURITÉ : Plus besoin de getAuthToken, removeAuthToken (localStorage supprimé)
import { getRedirectPath } from "@/lib/utils/auth";
import { deleteAuthCookie } from "@/actions/auth.action";
import type { UserResponseDto, LoginDto, RegisterDto } from "@/types/auth";

// Types pour le contexte
interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpired: boolean;
  inactivityWarning: boolean;
}

interface AuthActions {
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;
  updateUser: (userData: Partial<UserResponseDto>) => void;
  handleSessionExpired: (event: CustomEvent) => void;
  showInactivityWarning: () => void;
  hideInactivityWarning: () => void;
}

interface AuthContextType extends AuthState, AuthActions {}

// Interface des props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// States d'authentification
const AUTH_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  ERROR: "error",
} as const;

type AuthStateType = (typeof AUTH_STATES)[keyof typeof AUTH_STATES];

/**
 * Provider d'authentification professionnel
 *
 * Caractéristiques :
 * - Gestion d'état centralisée avec machine d'état
 * - Prévention des boucles infinies
 * - Gestion robuste des erreurs
 * - Optimisations de performance
 * - Synchronisation entre onglets
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Log pour détecter les re-renders du contexte
  // if (process.env.NODE_ENV === "development") {
  //   console.log("🔄 [AuthProvider] RENDER");
  // }

  // États principaux
  const [authState, setAuthState] = useState<AuthStateType>(
    AUTH_STATES.LOADING
  );
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [inactivityWarning, setInactivityWarning] = useState<boolean>(false);

  // Références pour éviter les re-renders inutiles
  const initializationRef = useRef<boolean>(false);
  const router = useRouter();

  // États dérivés
  const isAuthenticated = authState === AUTH_STATES.AUTHENTICATED && !!user;
  const isLoading = authState === AUTH_STATES.LOADING;

  /**
   * ✅ SÉCURITÉ : Initialisation sécurisée du contexte d'authentification
   * Utilise les cookies httpOnly au lieu de localStorage
   * ✅ CORRECTION : Timeout pour éviter le blocage indéfini
   */
  const initializeAuth = async () => {
    // Éviter les initialisations multiples
    if (initializationRef.current) return;
    initializationRef.current = true;

    // if (process.env.NODE_ENV === "development") {
    //   console.log(
    //     "🔐 [AuthContext] Initialisation du contexte d'authentification"
    //   );
    // }

    // ✅ CORRECTION : Timeout de sécurité pour éviter le blocage
    const initTimeout = setTimeout(() => {
      // if (process.env.NODE_ENV === "development") {
      //   console.warn(
      //     "⚠️ [AuthContext] Timeout d'initialisation, passage à UNAUTHENTICATED"
      //   );
      // }
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setUser(null);
    }, 10000); // 10 secondes maximum

    try {
      setAuthState(AUTH_STATES.LOADING);

      // ✅ SÉCURITÉ : Vérifier la présence du token via l'API (cookies httpOnly)
      const tokenResponse = await fetch("/api/auth/token", {
        credentials: "include",
        signal: AbortSignal.timeout(5000), // 5 secondes max
      });

      if (!tokenResponse.ok || !tokenResponse) {
        // if (process.env.NODE_ENV === "development") {
        //   console.log("🔐 [AuthContext] Aucun token trouvé");
        // }
        clearTimeout(initTimeout);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return;
      }

      const { hasToken, hasRefreshToken } = await tokenResponse.json();

      if (!hasToken) {
        // if (process.env.NODE_ENV === "development") {
        //   console.log("🔐 [AuthContext] Aucun token trouvé");
        // }
        clearTimeout(initTimeout);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return;
      }

      // ✅ CORRECTION : Vérifier d'abord si le token actuel est valide
      // En cas d'erreur 401, cette méthode retourne false sans lever d'exception
      const isValid = await authService.verifyToken();
      if (isValid) {
        // Token valide, récupérer les données utilisateur
        try {
          const userData = await authService.getCurrentUser();
          // if (process.env.NODE_ENV === "development") {
          //   console.log(
          //     "🔐 [AuthContext] Utilisateur authentifié:",
          //     userData.email
          //   );
          // }

          clearTimeout(initTimeout);
          setUser(userData);
          setAuthState(AUTH_STATES.AUTHENTICATED);
          return;
        } catch {
          // if (process.env.NODE_ENV === "development") {
          //   console.log(
          //     "🔐 [AuthContext] Erreur lors de la récupération du profil:",
          //     getUserError
          //   );
          // }
          // Si on ne peut pas récupérer le profil, nettoyer et déconnecter
          clearTimeout(initTimeout);
          await deleteAuthCookie();
          setUser(null);
          setError(null);
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
          return;
        }
      }

      // ✅ CORRECTION : Token invalide, tenter de le rafraîchir SEULEMENT s'il y a un refresh token
      if (hasRefreshToken) {
        try {
          // if (process.env.NODE_ENV === "development") {
          //   console.log("🔐 [AuthContext] Tentative de refresh du token...");
          // }
          const newToken = await authService.refreshToken();
          if (newToken) {
            // Récupérer les nouvelles données utilisateur
            const userData = await authService.getCurrentUser();
            // if (process.env.NODE_ENV === "development") {
            //   console.log(
            //     "🔐 [AuthContext] Token rafraîchi, utilisateur authentifié:",
            //     userData.email
            //   );
            // }

            clearTimeout(initTimeout);
            setUser(userData);
            setAuthState(AUTH_STATES.AUTHENTICATED);
            // ✅ CORRECTION : Réinitialiser l'état de session expirée après un refresh réussi
            setSessionExpired(false);
            setInactivityWarning(false);
            setError(null);
            // ✅ CORRECTION : Marquer la reconnexion pour éviter les expirations intempestives
            if (typeof window !== "undefined") {
              sessionStorage.setItem("lastReconnect", Date.now().toString());
            }
            return;
          }
        } catch (refreshError: unknown) {
          // if (process.env.NODE_ENV === "development") {
          //   console.log("🔐 [AuthContext] Échec du refresh:", refreshError);
          // }

          // ✅ CORRECTION : Si le refresh échoue avec une erreur 401, nettoyer immédiatement
          const error = refreshError as { status?: number; code?: string };
          if (error?.status === 401 || error?.code === "REFRESH_TOKEN_ERROR") {
            // if (process.env.NODE_ENV === "development") {
            //   console.log(
            //     "🔐 [AuthContext] Token expiré détecté, nettoyage..."
            //   );
            // }
            clearTimeout(initTimeout);
            await deleteAuthCookie();
            setUser(null);
            setError(null); // Ne pas définir d'erreur pour éviter le blocage
            setSessionExpired(false); // ✅ CORRECTION : Réinitialiser l'état
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            return;
          }
        }
      }

      // ✅ CORRECTION : Aucun refresh token ou échec du refresh, nettoyer et passer à UNAUTHENTICATED
      // if (process.env.NODE_ENV === "development") {
      //   console.log(
      //     "🔐 [AuthContext] Aucun refresh token ou échec du refresh, nettoyage..."
      //   );
      // }
      clearTimeout(initTimeout);
      await deleteAuthCookie();
      setUser(null);
      setError(null); // ✅ Important : ne pas définir d'erreur, juste déconnecter
      setSessionExpired(false); // ✅ CORRECTION : Réinitialiser l'état
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ [AuthContext] Erreur d'initialisation:", error);
      }
      clearTimeout(initTimeout);
      await deleteAuthCookie();
      setUser(null);
      setError(null); // ✅ Important : ne pas bloquer sur une erreur
      setSessionExpired(false); // ✅ CORRECTION : Réinitialiser l'état
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
    }
  };

  /**
   * Connexion utilisateur
   */
  // 🔄 ÉTAPE 3 : TRAITEMENT DANS LE CONTEXTE D'AUTHENTIFICATION
  // Réception des identifiants depuis la page de login (onSubmit)
  // Gestion de l'état global d'authentification de l'application
  const login = useCallback(
    async (credentials: LoginDto) => {
      try {
        setAuthState(AUTH_STATES.LOADING);
        setError(null);
        // ✅ CORRECTION : Réinitialiser l'état de session expirée lors d'une nouvelle connexion
        setSessionExpired(false);
        setInactivityWarning(false);

        // if (process.env.NODE_ENV === "development") {
        //   console.log("🔐 [AuthContext] Tentative de connexion...");
        // }
        // 🔄 ÉTAPE 4 : APPEL DU SERVICE D'AUTHENTIFICATION
        // Délégation vers authService.login() pour la logique métier
        // Le service gère l'appel API et la création des cookies
        const response = await authService.login(credentials);

        if (response.user) {
          setUser(response.user);
          setAuthState(AUTH_STATES.AUTHENTICATED);
          // ✅ CORRECTION : S'assurer que sessionExpired est bien à false après connexion réussie
          setSessionExpired(false);
          setInactivityWarning(false);

          // 🔄 ÉTAPE 11 : DÉTERMINATION DU CHEMIN DE REDIRECTION
          // Extraction du rôle utilisateur depuis la réponse du service
          // Appel de getRedirectPath() pour déterminer la destination
          const roleCode =
            typeof response.user.role === "string"
              ? response.user.role
              : response.user.role?.code || "USER";
          const redirectPath = getRedirectPath(roleCode);
          // if (process.env.NODE_ENV === "development") {
          //   console.log(
          //     "🔐 [AuthContext] Connexion réussie, redirection vers:",
          //     redirectPath
          //   );
          // }

          // 🔄 ÉTAPE 12 : EXÉCUTION DE LA REDIRECTION
          // Redirection avec délai pour laisser l'état se stabiliser
          // Utilisation de router.push() pour naviguer vers la page de destination
          // if (process.env.NODE_ENV === "development") {
          //   console.log(
          //     "🔐 [AuthContext] Exécution de la redirection vers:",
          //     redirectPath
          //   );
          // }

          // Délai court pour éviter les conflits de redirection
          setTimeout(() => {
            router.push(redirectPath);
          }, 100);
        }
      } catch (error: unknown) {
        // ✅ AMÉLIORATION : Utiliser le message de l'erreur qui contient déjà le message du backend
        // L'erreur vient de authService.login() qui a préservé le message du backend
        const errorMessage =
          error instanceof Error ? error.message : "Erreur de connexion";
        setError(errorMessage);
        setAuthState(AUTH_STATES.ERROR);
        throw error;
      }
    },
    [router]
  );

  /**
   * Inscription utilisateur
   */
  const register = useCallback(
    async (userData: RegisterDto) => {
      try {
        setAuthState(AUTH_STATES.LOADING);
        setError(null);

        // if (process.env.NODE_ENV === "development") {
        //   console.log("🔐 [AuthContext] Tentative d'inscription...");
        // }
        await authService.register(userData);

        // if (process.env.NODE_ENV === "development") {
        //   console.log("🔐 [AuthContext] Inscription réussie");
        // }

        // Rediriger vers la page de connexion
        router.replace("/auth/login");
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ [AuthContext] Erreur d'inscription:", error);
        }
        const errorMessage =
          error instanceof Error ? error.message : "Erreur d'inscription";
        setError(errorMessage);
        setAuthState(AUTH_STATES.ERROR);
        throw error;
      }
    },
    [router]
  );

  /**
   * ✅ SÉCURITÉ : Déconnexion utilisateur (supprime les cookies httpOnly)
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(AUTH_STATES.LOADING);

      // if (process.env.NODE_ENV === "development") {
      //   console.log("🔐 [AuthContext] Déconnexion...");
      // }
      await authService.logout();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ [AuthContext] Erreur de déconnexion:", error);
      }
    } finally {
      // Toujours nettoyer l'état local
      setUser(null);
      setError(null);
      setSessionExpired(false); // ✅ CORRECTION : Réinitialiser l'état
      setInactivityWarning(false);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);

      // ✅ CORRECTION : Nettoyer le flag de reconnexion
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("lastReconnect");
      }

      // if (process.env.NODE_ENV === "development") {
      //   console.log("🔐 [AuthContext] Déconnexion terminée");
      // }

      // Redirection vers la page de connexion
      router.replace("/auth/login");
    }
  }, [router]);

  /**
   * ✅ SÉCURITÉ : Rafraîchissement de l'authentification (cookies httpOnly)
   */
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      // ✅ SÉCURITÉ : Vérifier la présence du token via l'API
      const tokenResponse = await fetch("/api/auth/token", {
        credentials: "include",
      });

      if (!tokenResponse.ok) {
        setUser(null);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return false;
      }

      const { hasToken } = await tokenResponse.json();

      if (!hasToken) {
        setUser(null);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return false;
      }

      // if (process.env.NODE_ENV === "development") {
      //   console.log("🔐 [AuthContext] Rafraîchissement du token...");
      // }
      const newToken = await authService.refreshToken();

      if (newToken) {
        // Récupérer les nouvelles données utilisateur
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        // ✅ CORRECTION : Réinitialiser l'état de session expirée après un refresh réussi
        setSessionExpired(false);
        setInactivityWarning(false);
        setError(null);
        // ✅ CORRECTION : Marquer la reconnexion pour éviter les expirations intempestives
        if (typeof window !== "undefined") {
          sessionStorage.setItem("lastReconnect", Date.now().toString());
        }

        // if (process.env.NODE_ENV === "development") {
        //   console.log("🔐 [AuthContext] Token rafraîchi avec succès");
        // }
        return true;
      }

      return false;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ [AuthContext] Erreur de refresh:", error);
      }

      // ✅ SÉCURITÉ : En cas d'erreur, déconnecter l'utilisateur
      setUser(null);
      setError("Session expirée");
      setSessionExpired(false); // ✅ CORRECTION : Réinitialiser l'état
      await deleteAuthCookie();
      setAuthState(AUTH_STATES.UNAUTHENTICATED);

      return false;
    }
  }, []);

  /**
   * Effacer les erreurs
   */
  const clearError = useCallback(() => {
    setError(null);
    setAuthState((prevState) =>
      prevState === AUTH_STATES.ERROR ? AUTH_STATES.UNAUTHENTICATED : prevState
    );
  }, []);

  /**
   * Mettre à jour les données utilisateur
   */
  const updateUser = useCallback(
    (userData: Partial<UserResponseDto>) => {
      setUser((prevUser) => {
        if (prevUser && authState === AUTH_STATES.AUTHENTICATED) {
          return { ...prevUser, ...userData };
        }
        return prevUser;
      });
    },
    [authState]
  );

  /**
   * Gérer l'expiration de session
   */
  const handleSessionExpired = useCallback(
    (event: CustomEvent) => {
      // if (process.env.NODE_ENV === "development") {
      //   console.log("🔐 [AuthContext] Session expirée:", event.detail?.reason);
      // }

      // ✅ CORRECTION : Ne pas déclencher l'expiration si l'utilisateur vient juste de se connecter
      // Vérifier si une connexion récente a eu lieu (dans les 5 dernières secondes)
      const lastReconnect =
        typeof window !== "undefined"
          ? sessionStorage.getItem("lastReconnect")
          : null;

      if (lastReconnect) {
        const timeSinceReconnect = Date.now() - parseInt(lastReconnect, 10);
        if (timeSinceReconnect < 5000) {
          // 5 secondes
          // if (process.env.NODE_ENV === "development") {
          //   console.log(
          //     "🔐 [AuthContext] Connexion récente détectée, ignorer l'expiration de session"
          //   );
          // }
          // Nettoyer le flag de reconnexion
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("lastReconnect");
          }
          return; // Ne pas déclencher l'expiration
        }
      }

      // ✅ CORRECTION : Vérifier que l'utilisateur est vraiment authentifié avant d'expirer
      // Si on n'est pas authentifié, ne rien faire (évite les boucles)
      if (authState !== AUTH_STATES.AUTHENTICATED) {
        // if (process.env.NODE_ENV === "development") {
        //   console.log(
        //     "🔐 [AuthContext] Utilisateur non authentifié, ignorer l'expiration"
        //   );
        // }
        return;
      }

      // ✅ CORRECTION : Mettre à jour immédiatement les états pour éviter le blocage
      setSessionExpired(true);
      setInactivityWarning(false);

      // ✅ CORRECTION : Utiliser le message spécifique de l'erreur
      const errorMessage =
        event.detail?.message || "Session expirée par inactivité";
      setError(errorMessage);
      setAuthState(AUTH_STATES.ERROR);

      // ✅ CORRECTION : Ne pas déclencher automatiquement la déconnexion
      // Laisser SessionExpiredHandler gérer la modal et la déconnexion
      // Cela évite les déconnexions automatiques intempestives
    },
    [authState]
  );

  /**
   * Afficher l'avertissement d'inactivité
   */
  const showInactivityWarning = useCallback(() => {
    setInactivityWarning(true);
  }, []);

  /**
   * Masquer l'avertissement d'inactivité
   */
  const hideInactivityWarning = useCallback(() => {
    setInactivityWarning(false);
  }, []);

  /**
   * ✅ SÉCURITÉ : Gestionnaire de synchronisation entre onglets
   * Surveille les événements personnalisés au lieu de localStorage
   */
  useEffect(() => {
    const handleCustomLogout = () => {
      if (isAuthenticated) {
        // if (process.env.NODE_ENV === "development") {
        //   console.log(
        //     "🔐 [AuthContext] Déconnexion détectée dans un autre onglet"
        //   );
        // }
        setUser(null);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        router.replace("/auth/login");
      }
    };

    const handleSessionExpiredEvent = (event: CustomEvent) => {
      // if (process.env.NODE_ENV === "development") {
      //   console.log("🔐 [AuthContext] Session expirée détectée:", event.detail);
      // }

      // Déclencher la gestion d'expiration de session
      handleSessionExpired(event);
    };

    window.addEventListener("auth-logout", handleCustomLogout);
    window.addEventListener(
      "auth-session-expired",
      handleSessionExpiredEvent as EventListener
    );

    return () => {
      window.removeEventListener("auth-logout", handleCustomLogout);
      window.removeEventListener(
        "auth-session-expired",
        handleSessionExpiredEvent as EventListener
      );
    };
  }, [isAuthenticated, router, handleSessionExpired]);

  /**
   * Initialisation au montage
   */
  useEffect(() => {
    initializeAuth();
  }, []); // Pas de dépendances pour éviter la boucle infinie

  // Valeur du contexte mémorisée pour éviter les re-renders
  const contextValue: AuthContextType = useMemo(() => {
    // if (process.env.NODE_ENV === "development") {
    //   console.log("🔄 [AuthContext] contextValue recalculé");
    // }
    return {
      // État
      user,
      isAuthenticated,
      isLoading,
      error,
      sessionExpired,
      inactivityWarning,

      // Actions (toutes mémorisées avec useCallback)
      login,
      register,
      logout,
      refreshAuth,
      clearError,
      updateUser,
      handleSessionExpired,
      showInactivityWarning,
      hideInactivityWarning,
    };
  }, [
    // États uniquement (les fonctions sont stables grâce à useCallback)
    user,
    isAuthenticated,
    isLoading,
    error,
    sessionExpired,
    inactivityWarning,
    // Fonctions mémorisées
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    updateUser,
    handleSessionExpired,
    showInactivityWarning,
    hideInactivityWarning,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return context;
}

/**
 * Hook pour vérifier les permissions utilisateur
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = useCallback(
    (role: string) => {
      return user?.role?.code === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => {
      return user?.role?.code && roles.includes(user.role.code);
    },
    [user]
  );

  const canAccess = useCallback(
    (resource: string, action: string) => {
      if (!user?.role) return false;

      const roleConfig = {
        USER: ["read:cels", "upload:excel"],
        ADMIN: [
          "read:cels",
          "read:departements",
          "upload:excel",
          "manage:users",
        ],
        SADMIN: ["*"],
      };

      const permissions = roleConfig[user.role.code as keyof typeof roleConfig];

      if (permissions?.includes("*")) return true;

      return permissions?.includes(`${action}:${resource}`) ?? false;
    },
    [user]
  );

  return {
    hasRole,
    hasAnyRole,
    canAccess,
    isUser: hasRole("USER"),
    isAdmin: hasRole("ADMIN"),
    isSuperAdmin: hasRole("SADMIN"),
  };
}
