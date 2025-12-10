"use server";

import { cookies } from "next/headers";

/**
 * ✅ SÉCURITÉ CRITIQUE : Crée des cookies d'authentification sécurisés
 *
 * Configuration de sécurité :
 * - httpOnly: true (protection XSS - JavaScript ne peut pas accéder aux tokens)
 * - secure: Détection automatique (true pour HTTPS, false pour HTTP)
 * - sameSite: "strict" pour HTTPS, "lax" pour HTTP (protection CSRF)
 * - maxAge: 7 jours (rotation fréquente des tokens)
 *
 * Détection automatique du protocole :
 * - En production avec HTTPS : secure = true, sameSite = "strict"
 * - En développement/test avec HTTP : secure = false, sameSite = "lax"
 */
// 🔄 ÉTAPE 9 : STOCKAGE SÉCURISÉ DES TOKENS
// Réception des tokens depuis authService.login()
// Création de cookies sécurisés avec configuration de sécurité maximale
export const createAuthCookie = async (
  token: string,
  refreshToken: string,
  role: string,
  status: string,
  userName?: string
) => {
  const cookieStore = await cookies();

  // ✅ Détection automatique du protocole (HTTPS ou HTTP)
  // En production avec HTTPS : secure = true
  // En développement/test avec HTTP : secure = false
  const isSecure =
    process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false)
      : false;

  // ✅ Détermination de sameSite selon le protocole
  // "strict" pour HTTPS (sécurité maximale), "lax" pour HTTP (compatibilité)
  const sameSiteValue: "strict" | "lax" = isSecure ? "strict" : "lax";

  // ✅ Configuration sécurisée pour les TOKENS (httpOnly)
  const secureCookieConfig = {
    httpOnly: true, // ✅ Protection XSS
    secure: isSecure, // ✅ HTTPS uniquement si disponible, sinon false pour HTTP
    sameSite: sameSiteValue, // ✅ "strict" pour HTTPS, "lax" pour HTTP
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ✅ 7 jours
  };

  // ✅ Configuration pour les DONNÉES NON-SENSIBLES (accessibles côté client)
  const publicCookieConfig = {
    httpOnly: false, // Accessible côté client pour l'UI
    secure: isSecure, // ✅ HTTPS uniquement si disponible
    sameSite: sameSiteValue, // ✅ "strict" pour HTTPS, "lax" pour HTTP
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ✅ 7 jours
  };

  // ✅ TOKENS SENSIBLES : Stockés avec httpOnly
  // Création des cookies sécurisés pour les tokens d'authentification
  // Ces cookies ne sont pas accessibles via JavaScript (protection XSS)
  cookieStore.set("access_token", token, secureCookieConfig);
  cookieStore.set("refresh_token", refreshToken, secureCookieConfig);

  // ✅ DONNÉES NON-SENSIBLES : Accessibles pour l'UI
  // Création des cookies publics pour les données d'interface utilisateur
  // Ces cookies sont accessibles côté client pour l'affichage
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
  cookieStore.delete("user");

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

