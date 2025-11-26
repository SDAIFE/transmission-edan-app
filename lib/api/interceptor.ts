// Configuration de l'intercepteur Axios pour le refresh automatique des tokens

import axios from 'axios';
import { authService } from '@/lib/services/auth.service';
import { deleteAuthCookie } from '@/actions/auth.action';

/**
 * ✅ SÉCURITÉ : Récupère le token depuis les cookies httpOnly
 */
async function getTokenFromCookies(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      credentials: 'include'
    });
    if (!response.ok) return null;
    const { token } = await response.json();
    return token;
  } catch {
    return null;
  }
}

// Instance Axios pour les requêtes API
export const apiClient = axios.create({
  baseURL: '/api/backend', // Utilise le proxy Next.js vers /api/v1 (voir next.config.ts)
  timeout: 30000, // ✅ SÉCURITÉ : Aligné avec backend (30 secondes)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance Axios pour les uploads de fichiers (timeout plus long)
export const uploadClient = axios.create({
  baseURL: '/api/backend', // Utilise le proxy Next.js vers /api/v1 (voir next.config.ts)
  timeout: 180000, // ✅ 180 secondes (3 minutes) pour les uploads avec traitement long
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// ✅ SÉCURITÉ : Intercepteur pour ajouter le token depuis les cookies httpOnly
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ [Interceptor] Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Variable pour éviter les tentatives de refresh multiples simultanées
let isRefreshingToken = false;
let refreshTokenPromise: Promise<string> | null = null;

// Intercepteur pour gérer les réponses et le refresh automatique des tokens
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ SÉCURITÉ : Gestion erreur 429 (Rate Limiting)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [Interceptor] Rate limit atteint. Retry-After: ${retryAfter}s`);
      }
      
      // Ajouter des informations pour le composant UI
      error.isRateLimited = true;
      error.retryAfter = parseInt(retryAfter, 10);
      
      return Promise.reject(error);
    }

    // ✅ SÉCURITÉ : Gestion timeout backend (503)
    if (error.response?.status === 503) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [Interceptor] Service temporairement indisponible (503)');
      }
      
      return Promise.reject(error);
    }

    // ✅ Gestion timeout côté client (ECONNABORTED)
    if (error.code === 'ECONNABORTED') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [Interceptor] Requête timeout (ECONNABORTED)');
      }
      
      error.isTimeout = true;
      return Promise.reject(error);
    }

    // Gestion des erreurs de connexion réseau
    if (error.code === 'ECONNRESET' || 
        error.code === 'NETWORK_ERROR' || 
        error.message?.includes('aborted') ||
        error.message?.includes('timeout') ||
        !error.response) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [Interceptor] Erreur de connexion réseau détectée:', error.code || error.message);
      }
      
      // Ne pas traiter les erreurs réseau comme des erreurs d'authentification
      // Garder l'utilisateur connecté en cas de problème réseau temporaire
      return Promise.reject(error);
    }

    // ✅ CORRECTION : Ne pas tenter de refresh si la requête a le flag X-Skip-Auth-Refresh
    const skipAuthRefresh = originalRequest.headers?.['X-Skip-Auth-Refresh'] === 'true';
    
    // Si l'erreur est 401 (Unauthorized) et qu'on n'a pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !skipAuthRefresh) {
      originalRequest._retry = true;

      try {
        // Si un refresh est déjà en cours, attendre qu'il se termine
        if (isRefreshingToken && refreshTokenPromise) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [Interceptor] Refresh en cours, attente...');
          }
          const newToken = await refreshTokenPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }

        // Démarrer un nouveau refresh
        if (!isRefreshingToken) {
          isRefreshingToken = true;
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [Interceptor] Token expiré, tentative de refresh...');
          }
          
          refreshTokenPromise = authService.refreshToken();
          const newToken = await refreshTokenPromise;
          
          if (newToken) {
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ [Interceptor] Token rafraîchi avec succès');
            }
            // Rejouer la requête originale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [Interceptor] Échec du refresh du token:', refreshError);
        }
        
        // ✅ SÉCURITÉ : En cas d'erreur de refresh, supprimer les cookies
        await deleteAuthCookie();
        
        // ✅ CORRECTION : Déclencher l'événement de session expirée au lieu de rediriger directement
        if (typeof window !== 'undefined') {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [Interceptor] Déclenchement de l\'événement auth-session-expired');
          }
          
          // ✅ CORRECTION : Utiliser le bon nom d'événement (auth-session-expired)
          let reason = 'token_refresh_failed';
          let message = 'Session expirée';
          
          if (refreshError?.message) {
            message = refreshError.message;
          } else if (error.response?.data?.message) {
            message = error.response.data.message;
          }
          
          if (message.includes('inactivité')) {
            reason = 'user_inactivity';
          } else if (message.includes('expiré')) {
            reason = 'token_expired';
          }
          
          window.dispatchEvent(new CustomEvent('auth-session-expired', { 
            detail: { 
              reason,
              originalError: error,
              message
            } 
          }));
        }
        
        // ✅ CORRECTION : Ne pas rejeter l'erreur, retourner une erreur claire
        const customError = new Error(refreshError?.message || 'Session expirée. Veuillez vous reconnecter.');
        (customError as any).isAuthError = true;
        (customError as any).status = 401;
        return Promise.reject(customError);
      } finally {
        // Réinitialiser les variables de contrôle
        isRefreshingToken = false;
        refreshTokenPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Appliquer les mêmes intercepteurs au uploadClient
uploadClient.interceptors.request.use(
  async (config) => {
    const token = await getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ [UploadInterceptor] Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Même gestion des erreurs pour uploadClient
uploadClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ SÉCURITÉ : Gestion erreur 429 (Rate Limiting) pour uploads
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [UploadInterceptor] Rate limit atteint. Retry-After: ${retryAfter}s`);
      }
      
      error.isRateLimited = true;
      error.retryAfter = parseInt(retryAfter, 10);
      
      return Promise.reject(error);
    }

    // ✅ SÉCURITÉ : Gestion timeout backend (503) pour uploads
    if (error.response?.status === 503) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [UploadInterceptor] Service temporairement indisponible (503)');
      }
      
      return Promise.reject(error);
    }

    // ✅ Gestion timeout côté client pour uploads (ECONNABORTED)
    if (error.code === 'ECONNABORTED') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [UploadInterceptor] Upload timeout (60s dépassé)');
      }
      
      error.isTimeout = true;
      return Promise.reject(error);
    }

    // Gestion des erreurs de connexion réseau
    if (error.code === 'ECONNRESET' || 
        error.code === 'NETWORK_ERROR' || 
        error.message?.includes('aborted') ||
        error.message?.includes('timeout') ||
        !error.response) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [UploadInterceptor] Erreur de connexion réseau:', error.code || error.message);
      }
      return Promise.reject(error);
    }

    // Refresh token pour uploads aussi
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [UploadInterceptor] Token expiré, tentative de refresh...');
        }
        
        const newToken = await authService.refreshToken();
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return uploadClient(originalRequest);
        }
      } catch (refreshError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [UploadInterceptor] Échec du refresh du token:', refreshError);
        }
        
        await deleteAuthCookie();
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session-expired', { 
            detail: { 
              reason: 'token_refresh_failed',
              originalError: error 
            } 
          }));
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
