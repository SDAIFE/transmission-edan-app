// Service d'authentification central - Gestion des appels API

import { authApi } from '@/lib/api/auth';
// ✅ SÉCURITÉ : Plus besoin de getAuthToken, saveAuthToken, removeAuthToken (localStorage supprimé)
import { createAuthCookie, deleteAuthCookie } from '@/actions/auth.action';
import type {
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
  RegisterDto,
  CreateUserDto
} from '@/types/auth';

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export const authService = {
  /**
   * Connexion utilisateur
   */
  // 🔄 ÉTAPE 5 : SERVICE D'AUTHENTIFICATION - LOGIQUE MÉTIER
  // Réception des identifiants depuis AuthContext.login()
  // Orchestration de l'appel API et de la gestion des cookies
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    try {
      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('🔐 [AuthService] Tentative de connexion...');
      // }
      // 🔄 ÉTAPE 6 : APPEL DE L'API D'AUTHENTIFICATION
      // Délégation vers authApi.login() pour l'appel HTTP au backend
      // Transmission des identifiants au serveur d'authentification
      const response = await authApi.login(credentials);

      // ✅ VALIDATION : Vérifier que la réponse contient les données requises
      if (!response.accessToken) {
        throw new Error('Token d\'accès manquant dans la réponse du serveur');
      }

      if (!response.user) {
        throw new Error('Données utilisateur manquantes dans la réponse du serveur');
      }

      // ✅ VALIDATION : Vérifier les propriétés essentielles de l'utilisateur
      if (!response.user.email) {
        throw new Error('Email utilisateur manquant dans la réponse');
      }

      if (!response.user.role) {
        throw new Error('Rôle utilisateur manquant dans la réponse');
      }

      // ✅ SÉCURITÉ : Ne PLUS utiliser localStorage (vulnérable XSS)
      // Les tokens sont maintenant uniquement dans les cookies httpOnly

      // 🔄 ÉTAPE 8 : CRÉATION DES COOKIES SÉCURISÉS
      // Appel de createAuthCookie() pour stocker les tokens de manière sécurisée
      // Séparation des données sensibles (httpOnly) et publiques (accessibles côté client)

      // ✅ ADAPTATION : Extraction du code du rôle selon la structure de la réponse
      // La réponse contient : { role: { id, code, name } }
      const roleCode = typeof response.user.role === 'string'
        ? response.user.role
        : response.user.role?.code || 'USER';

      // ✅ ADAPTATION : Gestion de isActive (peut être true/false ou undefined)
      const userStatus = response.user.isActive === true ? 'active' : 'inactive';

      // ✅ ADAPTATION : Construction du nom complet avec gestion des valeurs manquantes
      const userName = [
        response.user.firstName || '',
        response.user.lastName || ''
      ]
        .filter(Boolean)
        .join(' ') || response.user.email || 'Utilisateur';

      await createAuthCookie(
        response.accessToken,
        response.refreshToken || '', // ✅ Le refreshToken peut être présent dans la réponse
        roleCode,
        userStatus,
        userName
      );

      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('✅ [AuthService] Connexion réussie pour:', response.user.email);
      //   console.warn('📋 [AuthService] Rôle:', roleCode, '| Statut:', userStatus);
      // }

      return response;
    } catch (error: unknown) {
      console.error('❌ [AuthService25] Erreur de connexion:', error);

      // ✅ AMÉLIORATION : Extraire correctement le message et le status de l'erreur
      // L'erreur peut venir de authApi.login() qui préserve maintenant status et code
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      const errorCode = (error as { code?: string })?.code;
      // L'erreur enrichie de authApi.login() a maintenant un status direct
      const errorStatus = (error as { status?: number })?.status;

      const authError: AuthError = {
        message: errorMessage,
        code: errorCode,
        status: errorStatus,
      };

      throw authError;
    }
  },

  /**
   * Inscription utilisateur
   */
  async register(userData: RegisterDto): Promise<UserResponseDto> {
    try {
      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('📝 [AuthService] Tentative d\'inscription...');
      // }

      const response = await authApi.register(userData);

      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('✅ [AuthService] Inscription réussie pour:', response.email);
      // }
      return response;
    } catch (error: unknown) {
      console.error('❌ [AuthService] Erreur d\'inscription:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      const errorCode = (error as { code?: string })?.code;
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;

      const authError: AuthError = {
        message: errorMessage,
        code: errorCode,
        status: errorStatus,
      };

      throw authError;
    }
  },

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('🚪 [AuthService] Déconnexion...');
      // }
      // Appeler l'API de déconnexion
      await authApi.logout();
      // ✅ SÉCURITÉ : Supprimer uniquement les cookies (plus de localStorage)
      await deleteAuthCookie();
      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('✅ [AuthService] Déconnexion réussie');
      // }
    } catch (error: unknown) {
      console.error('❌ [AuthService] Erreur de déconnexion:', error);

      // Même en cas d'erreur, supprimer les cookies
      await deleteAuthCookie();
    }
  },

  /**
   * Récupération du profil utilisateur actuel
   */
  async getCurrentUser(): Promise<UserResponseDto> {
    try {
      const response = await authApi.getProfile();
      return response;
    } catch (error: unknown) {
      console.error('❌ [AuthService] Erreur de récupération du profil:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erreur de récupération du profil';
      const errorCode = (error as { code?: string })?.code;
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;

      const authError: AuthError = {
        message: errorMessage,
        code: errorCode,
        status: errorStatus,
      };

      throw authError;
    }
  },

  /**
   * ✅ SÉCURITÉ : Rafraîchissement du token d'accès
   * Les tokens sont maintenant dans les cookies httpOnly (pas de localStorage)
   */
  async refreshToken(): Promise<string> {
    try {
      // ✅ SÉCURITÉ : Récupérer le refresh token depuis les cookies (via API)
      const tokenResponse = await fetch('/api/auth/token', {
        credentials: 'include' // Important pour inclure les cookies
      });

      if (!tokenResponse.ok) {
        throw new Error('Impossible de récupérer le refresh token');
      }

      const { refreshToken } = await tokenResponse.json();

      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('🔄 [AuthService] Tentative de refresh du token...');
      // }

      const response = await authApi.refresh(refreshToken);

      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('🔄 [AuthService] Response refresh token:', {
      //     hasAccessToken: !!response.accessToken,
      //     hasUser: !!response.user,
      //     userRole: response.user?.role,
      //   });
      // }

      if (response.accessToken && response.user) {
        // ✅ SÉCURITÉ : Mettre à jour les cookies avec les nouveaux tokens
        // ✅ ADAPTATION : Extraction du code du rôle selon la structure de la réponse
        const roleCode = typeof response.user.role === 'string'
          ? response.user.role
          : response.user.role?.code || 'USER';

        // ✅ ADAPTATION : Gestion de isActive (peut être true/false ou undefined)
        const userStatus = response.user.isActive === true ? 'active' : 'inactive';

        // ✅ ADAPTATION : Construction du nom complet avec gestion des valeurs manquantes
        const userName = [
          response.user.firstName || '',
          response.user.lastName || ''
        ]
          .filter(Boolean)
          .join(' ') || response.user.email || 'Utilisateur';

        await createAuthCookie(
          response.accessToken,
          response.refreshToken || refreshToken, // Utiliser le nouveau ou garder l'ancien
          roleCode,
          userStatus,
          userName
        );

        // if (process.env.NODE_ENV === 'development') {
        //   console.warn('✅ [AuthService] Token rafraîchi avec succès (cookies httpOnly mis à jour)');
        // }

        // Marquer la reconnexion pour les notifications
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastReconnect', Date.now().toString());
        }

        return response.accessToken;
      }

      throw new Error('Réponse de refresh invalide');
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [AuthService] Erreur de refresh:', error);
      }

      // Vérifier si c'est une erreur réseau
      const isNetworkError = error instanceof Error && (
        error.message.includes('ECONNRESET') ||
        error.message.includes('aborted') ||
        error.message.includes('Network Error')
      );

      if (isNetworkError) {
        // if (process.env.NODE_ENV === 'development') {
        //   console.warn('⚠️ [AuthService] Erreur réseau lors du refresh, réessai possible');
        // }
        const authError: AuthError = {
          message: 'Erreur de connexion, veuillez réessayer',
          code: 'NETWORK_ERROR',
          status: 0,
        };
        throw authError;
      }

      // ✅ SÉCURITÉ : En cas d'erreur de refresh, déconnecter l'utilisateur
      await deleteAuthCookie();

      // ✅ CORRECTION : Créer une erreur avec les bonnes propriétés pour le traitement
      const errorMessage = error instanceof Error ? error.message : 'Session expirée, veuillez vous reconnecter';
      const authError = new Error(errorMessage) as Error & AuthError;
      authError.message = errorMessage;
      authError.code = 'REFRESH_TOKEN_ERROR';
      authError.status = 401;

      throw authError;
    }
  },

  /**
   * ✅ SÉCURITÉ : Vérification de la validité du token
   * Récupère le token depuis les cookies httpOnly
   * ✅ CORRECTION : Gérer les erreurs 401 sans lever d'exception
   */
  async verifyToken(): Promise<boolean> {
    try {
      // ✅ SÉCURITÉ : Récupérer le token depuis les cookies (via API)
      const tokenResponse = await fetch('/api/auth/token', {
        credentials: 'include'
      });

      if (!tokenResponse.ok) {
        // if (process.env.NODE_ENV === 'development') {
        //   console.warn('🔐 [AuthService] Pas de token dans les cookies');
        // }
        return false;
      }

      const { hasToken } = await tokenResponse.json();
      if (!hasToken) {
        // if (process.env.NODE_ENV === 'development') {
        //   console.warn('🔐 [AuthService] Aucun token présent');
        // }
        return false;
      }

      // ✅ CORRECTION : Vérifier le token avec gestion d'erreur robuste
      try {
        const isValid = await authApi.verify();
        // if (process.env.NODE_ENV === 'development') {
        //   console.warn('🔐 [AuthService] Token valide:', isValid);
        // }
        return isValid;
      } catch (verifyError: unknown) {
        const error = verifyError as { response?: { status?: number }; status?: number };
        // ✅ CORRECTION : Si erreur 401, le token est expiré mais ne pas lever d'exception
        if (error?.response?.status === 401 || error?.status === 401) {
          // if (process.env.NODE_ENV === 'development') {
          //   console.warn('🔐 [AuthService] Token expiré (401), retour false');
          // }
          return false;
        }
        // Autres erreurs (réseau, etc.)
          // if (process.env.NODE_ENV === 'development') {
          //   const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          //   console.warn('⚠️ [AuthService] Erreur lors de la vérification:', errorMessage);
          // }
        return false;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [AuthService] Erreur générale verifyToken:', error);
      }
      return false;
    }
  },

  /**
   * Mise à jour du profil utilisateur
   */
  async updateProfile(updates: Partial<UserResponseDto>): Promise<UserResponseDto> {
    try {

      const response = await authApi.updateProfile(updates);

      return response;
    } catch (error: unknown) {
      console.error('❌ [AuthService] Erreur de mise à jour:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour du profil';
      const errorCode = (error as { code?: string })?.code;
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;

      const authError: AuthError = {
        message: errorMessage,
        code: errorCode,
        status: errorStatus,
      };

      throw authError;
    }
  },

  /**
   * Création d'un utilisateur (Admin/SuperAdmin uniquement)
   */
  async createUser(userData: unknown): Promise<UserResponseDto> {
    try {

      const response = await authApi.createUser(userData as CreateUserDto);

      return response;
    } catch (error: unknown) {
      console.error('❌ [AuthService] Erreur de création:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erreur de création d\'utilisateur';
      const errorCode = (error as { code?: string })?.code;
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;

      const authError: AuthError = {
        message: errorMessage,
        code: errorCode,
        status: errorStatus,
      };

      throw authError;
    }
  },
};

// Fonction d'initialisation de l'intercepteur d'authentification
export function setupAuthInterceptor() {
  // Cette fonction est maintenant simplifiée car l'intercepteur principal
  // est géré dans lib/api/interceptor.ts pour éviter les doublons

  // if (process.env.NODE_ENV === 'development') {
  //   console.warn('✅ [AuthService] Intercepteur d\'authentification initialisé');
  // }

  // L'intercepteur principal est configuré dans lib/api/interceptor.ts
  // Cette fonction reste pour la compatibilité mais ne fait plus de configuration
}
