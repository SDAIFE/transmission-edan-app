"use server";

import { cookies } from "next/headers";

/**
 * ✅ SÉCURITÉ CRITIQUE : Crée des cookies d'authentification sécurisés
 * 
 * Configuration de sécurité :
 * - httpOnly: true (protection XSS - JavaScript ne peut pas accéder aux tokens)
 * - secure: true (HTTPS uniquement)
 * - sameSite: "strict" (protection CSRF maximale)
 * - maxAge: 7 jours (rotation fréquente des tokens)
 */
export const createAuthCookie = async (
  token: string,
  refreshToken: string,
  role: string,
  status: string,
  userName?: string
) => {
  const cookieStore = await cookies();
  
  // ✅ Configuration sécurisée pour les TOKENS (httpOnly)
  const secureCookieConfig = {
    httpOnly: true,              // ✅ Protection XSS
    secure: true,                // ✅ HTTPS uniquement
    sameSite: "strict" as const, // ✅ Protection CSRF
    path: "/",
    maxAge: 60 * 60 * 24 * 7,    // ✅ 7 jours
  };
  
  // ✅ Configuration pour les DONNÉES NON-SENSIBLES (accessibles côté client)
  const publicCookieConfig = {
    httpOnly: false,             // Accessible côté client pour l'UI
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,    // ✅ 7 jours
  };
  
  // ✅ TOKENS SENSIBLES : Stockés avec httpOnly
  cookieStore.set("access_token", token, secureCookieConfig);
  cookieStore.set("refresh_token", refreshToken, secureCookieConfig);
  
  // ✅ DONNÉES NON-SENSIBLES : Accessibles pour l'UI
  cookieStore.set("user_role", role, publicCookieConfig);
  cookieStore.set("user_status", status, publicCookieConfig);
  cookieStore.set("user_name", userName || "", publicCookieConfig);
};

/**
 * ✅ SÉCURITÉ : Supprime tous les cookies d'authentification
 */
export const deleteAuthCookie = async () => {
  const cookieStore = await cookies();
  
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_role");
  cookieStore.delete("user_status");
  cookieStore.delete("user_name");
};

/**
 * ✅ SÉCURITÉ : Récupère le token d'accès côté serveur
 */
export const getServerToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
};

/**
 * ✅ SÉCURITÉ : Récupère le refresh token côté serveur
 */
export const getServerRefreshToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value || null;
};

/**
 * ✅ SÉCURITÉ : Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getServerToken();
  return !!token;
};

