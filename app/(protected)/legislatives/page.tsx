"use client";

import { useAuth } from "@/contexts/AuthContext";
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
import { LegislativesPageContent } from "@/components/legislatives/legislatives-page-content";

export default function LegislativesPage() {
  const { user: currentUser, isAuthenticated } = useAuth();

  // Vérifier les permissions (SADMIN, ADMIN, USER peuvent uploader)
  const canUpload =
    currentUser?.role?.code === "SADMIN" ||
    currentUser?.role?.code === "ADMIN" ||
    currentUser?.role?.code === "USER";

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

  if (!canUpload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Accès non autorisé</CardTitle>
            <CardDescription className="text-center">
              Vous n&apos;avez pas les permissions pour accéder à cette page
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
        <div>
          <h1 className="text-3xl font-bold">Élections Législatives</h1>
          <p className="text-muted-foreground">
            Upload et visualisation des fichiers Excel pour les élections
            législatives
          </p>
        </div>
        <LegislativesPageContent />
      </div>
    </MainLayout>
  );
}
