"use client";

import { useState, useEffect, useRef } from "react";
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
import { toast } from "sonner";

// API
import { listsApi, uploadApi } from "@/lib/api";
import type {
  ImportData,
  ImportFilters as ImportFiltersType,
} from "@/types/upload";

// Composants upload
import { UploadPageHeader } from "@/components/upload/upload-page-header";
import { UploadPageContent } from "@/components/upload/upload-page-content";

export default function UploadPage() {
  const { user: currentUser, isAuthenticated } = useAuth();

  // ✅ CORRECTION : Référence pour éviter les rafraîchissements multiples
  const hasRefreshedRef = useRef(false);

  // ✅ APPROCHE 2 : Charger les données dans la page (une seule fois au montage)
  const [initialData, setInitialData] = useState<{
    allCels: { codeCellule: string; libelleCellule: string }[];
    initialImports: ImportData[];
  } | null>(null);
  const [initialDataLoading, setInitialDataLoading] = useState(true);

  // Vérifier les permissions
  const canUpload =
    currentUser?.role?.code === "SADMIN" ||
    currentUser?.role?.code === "ADMIN" ||
    currentUser?.role?.code === "USER";

  // ✅ CORRECTION : Rafraîchir automatiquement la page si user.cellules n'est pas disponible pour USER
  useEffect(() => {
    // Ne rafraîchir que si l'utilisateur est authentifié et a les permissions
    if (!isAuthenticated || !canUpload || !currentUser) {
      return;
    }

    // ✅ CORRECTION : Pour les utilisateurs USER, rafraîchir la page si cellules n'est pas disponible
    // Cela force le rechargement de toutes les données, y compris user.cellules
    if (currentUser.role?.code === "USER") {
      if (!currentUser.cellules || currentUser.cellules.length === 0) {
        // Ne rafraîchir qu'une seule fois
        if (!hasRefreshedRef.current) {
          hasRefreshedRef.current = true;
          // if (process.env.NODE_ENV === "development") {
          //   console.warn(
          //     "🔄 [UploadPage] user.cellules non disponible, rafraîchissement automatique de la page..."
          //   );
          // }
          // Attendre un court délai pour éviter les boucles de rafraîchissement
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return;
        }
      }
    }
  }, [isAuthenticated, canUpload, currentUser, currentUser?.cellules?.length]);

  // ✅ APPROCHE 2 : Charger les données initiales (CELs et imports) une seule fois au montage
  // ✅ CORRECTION : Charger les données immédiatement, sans attendre user.cellules
  // UploadPageContent gérera le filtrage quand user.cellules sera disponible
  useEffect(() => {
    // Ne charger que si l'utilisateur est authentifié et a les permissions
    if (!isAuthenticated || !canUpload || !currentUser) {
      setInitialDataLoading(false);
      return;
    }

    // ✅ CORRECTION : Si on a déjà rafraîchi, ne pas charger les données ici
    // (le rafraîchissement va recharger toute la page)
    if (currentUser.role?.code === "USER" && hasRefreshedRef.current) {
      return;
    }

    // ✅ CORRECTION : Charger les données immédiatement
    // Le filtrage par user.cellules sera géré dans UploadPageContent

    const loadInitialData = async () => {
      try {
        setInitialDataLoading(true);

        // if (process.env.NODE_ENV === "development") {
        //   console.log("🔄 [UploadPage] Chargement des données initiales...", {
        //     userRole: currentUser.role?.code,
        //     userCellulesCount: currentUser.cellules?.length || 0,
        //   });
        // }

        // Charger les CELs et les imports en parallèle
        const [listsData, importsData] = await Promise.allSettled([
          listsApi.getFormLists(),
          uploadApi.getImports({ page: 1, limit: 10 } as ImportFiltersType),
        ]);

        const allCels: { codeCellule: string; libelleCellule: string }[] = [];
        const initialImports: ImportData[] = [];

        // Traiter les CELs
        if (listsData.status === "fulfilled") {
          allCels.push(...listsData.value.cels);
          // if (process.env.NODE_ENV === "development") {
          //   console.log(
          //     "✅ [UploadPage] CELs chargées:",
          //     listsData.value.cels.length
          //   );
          // }
        } else {
          console.error(
            "❌ [UploadPage] Erreur lors du chargement des CELs:",
            listsData.reason
          );
        }

        // Traiter les imports
        if (importsData.status === "fulfilled" && importsData.value !== null) {
          initialImports.push(...importsData.value.imports);
          // if (process.env.NODE_ENV === "development") {
          //   console.log(
          //     "✅ [UploadPage] Imports chargés:",
          //     importsData.value.imports.length
          //   );
          // }
        } else {
          // if (process.env.NODE_ENV === "development") {
          //   console.warn("⚠️ [UploadPage] Imports non disponibles");
          // }
        }

        setInitialData({ allCels, initialImports });

        // if (process.env.NODE_ENV === "development") {
        //   console.log("✅ [UploadPage] Données initiales chargées:", {
        //     celsCount: allCels.length,
        //     importsCount: initialImports.length,
        //     userCellulesCount: currentUser.cellules?.length || 0,
        //   });
        // }
      } catch (error) {
        console.error(
          "❌ [UploadPage] Erreur lors du chargement des données initiales:",
          error
        );
        toast.error("Erreur lors du chargement des données");
      } finally {
        setInitialDataLoading(false);
      }
    };

    loadInitialData();
  }, [
    isAuthenticated,
    canUpload,
    currentUser,
    // ✅ CORRECTION : Ne plus dépendre de userCellulesKey
    // On charge les données une seule fois, UploadPageContent gérera les mises à jour
  ]);

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
              Vous n&apos;avez pas les permissions pour uploader des fichiers
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

  // Afficher un loader pendant le chargement initial
  if (initialDataLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <UploadPageHeader />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <UploadPageHeader />
        {/* Contenu principal */}
        {/* ✅ APPROCHE 2 : Passer les données initiales en props */}
        <UploadPageContent
          initialAllCels={initialData?.allCels}
          initialImports={initialData?.initialImports}
        />
      </div>
    </MainLayout>
  );
}
