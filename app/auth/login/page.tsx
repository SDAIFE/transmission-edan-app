"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertTriangle, Clock } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAuthCookie } from "@/actions/auth.action";
import Image from "next/image";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [isCleaningSession, setIsCleaningSession] = useState(false);
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ✅ CORRECTION : Nettoyer automatiquement les cookies expirés au chargement de la page de login
  useEffect(() => {
    const cleanupExpiredTokens = async () => {
      try {
        // Vérifier si un token existe
        const tokenResponse = await fetch("/api/auth/token", {
          credentials: "include",
        });

        if (tokenResponse.ok) {
          const { hasToken } = await tokenResponse.json();

          // Si un token existe mais qu'on arrive sur la page de login (probablement expiré)
          if (hasToken && !isAuthenticated) {
            if (process.env.NODE_ENV === "development") {
              console.log(
                "🧹 [LoginForm] Nettoyage des cookies expirés détectés..."
              );
            }
            setIsCleaningSession(true);
            await deleteAuthCookie();
            clearError();
            setIsCleaningSession(false);

            // Afficher une notification si l'utilisateur a été redirigé après expiration
            const sessionExpired = searchParams.get("session_expired");
            if (sessionExpired === "true") {
              toast.info("Votre session a expiré. Veuillez vous reconnecter.");
            }
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ [LoginForm] Erreur lors du nettoyage:", err);
        }
        setIsCleaningSession(false);
      }
    };

    cleanupExpiredTokens();
  }, []); // Exécuter une seule fois au montage

  // Rediriger si déjà connecté (géré par AuthContext)
  useEffect(() => {
    if (isAuthenticated) {
      // La redirection est gérée par AuthContext après connexion
      // Pas besoin de redirection ici pour éviter les conflits
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔐 [LoginForm] Utilisateur authentifié, redirection gérée par AuthContext"
        );
      }
    }
  }, [isAuthenticated]);

  // Gérer les erreurs depuis l'URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "account_inactive") {
      toast.error("Votre compte n'est pas encore activé");
    }
  }, [searchParams]);

  // Effacer les erreurs au changement de formulaire
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // ✅ SÉCURITÉ : Compteur dégressif pour le rate limiting
  useEffect(() => {
    if (isRateLimited && retryAfter > 0) {
      const interval = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRateLimited, retryAfter]);

  // 🔄 ÉTAPE 1 : SOUMISSION DU FORMULAIRE DE CONNEXION
  // L'utilisateur clique sur "Se connecter" après avoir saisi ses identifiants
  // Cette fonction est déclenchée par handleSubmit(onSubmit) du formulaire
  const onSubmit = async (data: LoginFormData) => {
    try {
      // 🔄 ÉTAPE 2 : APPEL DE LA FONCTION LOGIN DU CONTEXTE
      // Appel de la fonction login() depuis useAuth() (AuthContext)
      // Passage des identifiants validés par le schéma Zod
      await login({
        email: data.email,
        password: data.password,
      });
      toast.success("Connexion réussie");
    } catch (error: any) {
      // ✅ SÉCURITÉ : Gestion du rate limiting (erreur 429)
      if (error.isRateLimited || error.response?.status === 429) {
        const seconds = error.retryAfter || 60;
        setIsRateLimited(true);
        setRetryAfter(seconds);
        toast.error(
          `Trop de tentatives. Veuillez réessayer dans ${seconds} secondes.`
        );
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Erreur de connexion";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo CEI */}
        <div className="text-center">
          <Image
            src="/images/logos/logocei2.webp"
            alt="Logo CEI 2"
            width={150}
            height={150}
            priority
            className="mx-auto"
          />
        </div>

        {/* Card de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-2xl font-medium">
                  TRECIV-Expert - EDAN 2025
                </h1>
                <p className="text-2xl text-muted-foreground">Connexion</p>
              </div>
            </CardTitle>
            <CardDescription>
              Connectez-vous à votre compte pour accéder à l&apos;application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@cei.ci"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Erreur */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* ✅ SÉCURITÉ : Alerte Rate Limiting */}
              {isRateLimited && (
                <Alert
                  variant="default"
                  className="border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          Trop de tentatives. Réessayez dans{" "}
                          <strong>{retryAfter}</strong> seconde
                          {retryAfter > 1 ? "s" : ""}
                        </span>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isRateLimited || isCleaningSession}
              >
                {(isLoading || isCleaningSession) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isCleaningSession
                  ? "Nettoyage en cours..."
                  : isRateLimited
                  ? `Réessayez dans ${retryAfter}s`
                  : isLoading
                  ? "Connexion..."
                  : "Se connecter"}
              </Button>
            </form>

            {/* Information sur l'accès */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Vous n&apos;avez pas de compte ? Contactez votre administrateur
                système.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            © 2025 Commission Électorale Indépendante - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
