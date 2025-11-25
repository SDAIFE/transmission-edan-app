import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_URL } from '@/lib/config/api';

/**
 * Crée une instance Axios avec intercepteurs
 * 
 * Note: Les tokens sont dans des cookies httpOnly, donc ils sont envoyés automatiquement
 * par le navigateur. On n'a pas besoin de les ajouter manuellement dans les headers.
 */
export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true, // Important pour envoyer les cookies httpOnly
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur de requête
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Les cookies httpOnly sont envoyés automatiquement
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur de réponse
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      // Gestion des erreurs d'authentification
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        // Le middleware/backend devra gérer le refresh token
        if (typeof window !== 'undefined') {
          // Déclencher un événement pour que l'AuthContext gère la déconnexion
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Instance API par défaut
 */
export const apiClient = createApiClient();
