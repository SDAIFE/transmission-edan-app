"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMemo, memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";

// Composants publications législatives
import { LegislativesPublicationsPageHeader } from "@/components/legislatives-publications/legislatives-publications-page-header";
import { LegislativesPublicationsPageContent } from "@/components/legislatives-publications/legislatives-publications-page-content";

const LegislativesPublicationsPage = memo(
  function LegislativesPublicationsPage() {
    // if (process.env.NODE_ENV === "development") {
    //   // eslint-disable-next-line no-console
    //   console.log("🔄 [LegislativesPublicationsPage] RENDER");
    // }

    const { user: currentUser, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

    // Stabiliser les variables calculées avec useMemo
    const canPublish = useMemo(() => {
      return (
        currentUser?.role?.code === "SADMIN" ||
        currentUser?.role?.code === "ADMIN"
      );
    }, [currentUser?.role?.code]);

    const isUser = useMemo(() => {
      return currentUser?.role?.code === "USER";
    }, [currentUser?.role?.code]);

    // Fonction de refresh - déclenche un refresh des données
    // Le composant content gère son propre refresh via loadInitialData
    // On met juste à jour le loading pour l'UI du header
    const handleRefresh = useCallback(() => {
      setLoading(true);
      // Le composant content se rechargera automatiquement via loadInitialData
      // On simule juste un délai pour l'UI
      setTimeout(() => setLoading(false), 1000);
    }, []);

    // Stabiliser les props passées aux composants enfants
    const headerProps = useMemo(
      () => ({
        isUser,
        onRefresh: handleRefresh,
        loading,
      }),
      [isUser, handleRefresh, loading]
    );
    const contentProps = useMemo(
      () => ({
        isUser,
        onRefresh: handleRefresh,
        loading,
      }),
      [isUser, handleRefresh, loading]
    );

    // Vérifications d'authentification et permissions
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Non connecté</CardTitle>
              <CardDescription className="text-center">
                Vous devez être connecté pour accéder à cette page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/login">Se connecter</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!canPublish && !isUser) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Accès non autorisé</CardTitle>
              <CardDescription className="text-center">
                Vous n&apos;avez pas les permissions pour gérer les{" "}
                {isUser ? "consolidations" : "publications"} législatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard">Retour au Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <LegislativesPublicationsPageHeader {...headerProps} />

          {/* Contenu principal */}
          <LegislativesPublicationsPageContent {...contentProps} />
        </div>
      </MainLayout>
    );
  }
);

export default LegislativesPublicationsPage;
