"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
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
import { SupervisionPageContent } from "@/components/legislatives-supervision/supervision-page-content";

export default function LegislativesSupervisionPage() {
  const { user: currentUser, isAuthenticated } = useAuth();

  // Vérifier les permissions : SADMIN, ADMIN, MANAGER uniquement
  const hasAccess = useMemo(() => {
    return (
      currentUser?.role?.code === "SADMIN" ||
      currentUser?.role?.code === "ADMIN" ||
      currentUser?.role?.code === "MANAGER"
    );
  }, [currentUser?.role?.code]);

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

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Accès non autorisé</CardTitle>
            <CardDescription className="text-center">
              Vous n&apos;avez pas les permissions pour accéder à la supervision.
              <br />
              Rôles autorisés : SADMIN, ADMIN, MANAGER
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Supervision des Résultats Législatifs</h1>
            <p className="text-muted-foreground mt-1">
              Tableau de bord de supervision et statistiques avancées
            </p>
          </div>
        </div>

        {/* Contenu principal */}
        <SupervisionPageContent />
      </div>
    </MainLayout>
  );
}

