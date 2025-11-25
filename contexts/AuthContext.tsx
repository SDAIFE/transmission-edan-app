"use client";

import { createContext, useContext, ReactNode } from 'react';

/**
 * Contexte d'authentification
 * 
 * TODO: Implémenter le contexte complet avec :
 * - Machine d'état (IDLE, LOADING, AUTHENTICATED, UNAUTHENTICATED, ERROR)
 * - Gestion login/register/logout
 * - Refresh token automatique
 * - Gestion expiration de session
 * - Détection d'inactivité
 * - Synchronisation entre onglets
 */
interface AuthContextType {
  // TODO: Définir les types et méthodes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: Implémenter le provider
  return (
    <AuthContext.Provider value={{}}>
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

