'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

/**
 * ✅ Composant de débogage pour tester la gestion des tokens
 * Adapté pour les cookies httpOnly sécurisés
 */
export function TokenDebug() {
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    tokenExpiry?: Date;
    refreshTokenExpiry?: Date;
    error?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkTokens = async () => {
    setIsChecking(true);
    try {
      // ✅ Récupérer les tokens depuis les cookies httpOnly via API
      const tokenResponse = await fetch('/api/auth/token', {
        credentials: 'include'
      });
      
      if (!tokenResponse.ok) {
        setTokenInfo({
          hasAccessToken: false,
          hasRefreshToken: false,
          error: 'Impossible de récupérer les tokens'
        });
        return;
      }
      
      const { token, hasToken, hasRefreshToken } = await tokenResponse.json();
      
      setTokenInfo({
        hasAccessToken: hasToken && !!token,
        hasRefreshToken: hasRefreshToken,
        tokenExpiry: token ? getTokenExpiry(token) : undefined,
        refreshTokenExpiry: undefined, // Le refresh token n'est pas accessible côté client
        error: undefined
      });
    } catch (error) {
      setTokenInfo({
        hasAccessToken: false,
        hasRefreshToken: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getTokenExpiry = (token: string): Date | undefined => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return undefined;
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshAuth();
      await checkTokens();
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkTokens();
    }
  }, [isAuthenticated]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Debug des Tokens d&apos;Authentification
        </CardTitle>
        <CardDescription>
          Informations de débogage pour la gestion des tokens (cookies httpOnly)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État d'authentification */}
        <div className="flex items-center justify-between">
          <span className="font-medium">État d&apos;authentification :</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isLoading ? "Chargement..." : isAuthenticated ? "Connecté" : "Déconnecté"}
          </Badge>
        </div>

        {/* Informations utilisateur */}
        {user && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Utilisateur :</span>
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        )}

        {/* Erreur */}
        {tokenInfo?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{tokenInfo.error}</span>
            </div>
          </div>
        )}

        {/* Tokens */}
        {tokenInfo && !tokenInfo.error && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Access Token :</span>
              <div className="flex items-center gap-2">
                {tokenInfo.hasAccessToken ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {tokenInfo.hasAccessToken ? "Présent" : "Absent"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Refresh Token :</span>
              <div className="flex items-center gap-2">
                {tokenInfo.hasRefreshToken ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {tokenInfo.hasRefreshToken ? "Présent (httpOnly)" : "Absent"}
                </span>
              </div>
            </div>

            {/* Expiration des tokens */}
            {tokenInfo.tokenExpiry && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Expiration Access Token :</span>
                <div className="flex items-center gap-2">
                  {tokenInfo.tokenExpiry > new Date() ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    {tokenInfo.tokenExpiry.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Note sur la sécurité */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700">
                  Les tokens sont maintenant stockés dans des cookies httpOnly sécurisés
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={checkTokens} 
            variant="outline" 
            size="sm"
            disabled={isChecking}
          >
            {isChecking ? "Vérification..." : "Actualiser"}
          </Button>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            disabled={isLoading || isChecking}
          >
            Tester Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TokenDebug;
