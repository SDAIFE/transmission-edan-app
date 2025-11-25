/**
 * Configuration de l'API backend
 */
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  apiVersion: '/api/v1',
  timeout: 30000,
} as const;

/**
 * URL complète de l'API
 */
export const API_URL = `${API_CONFIG.baseURL}${API_CONFIG.apiVersion}`;

