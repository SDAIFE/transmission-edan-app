"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

// Composants
import { StatsSection } from "./stats-section";
import { ImportsSection } from "./imports-section";
import { UploadModal } from "./upload-modal";
import { ReadyToPublishCirconscriptionsAlert } from "./ready-to-publish-circonscriptions-alert";

// API et types
import { uploadApi, listsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ImportData,
  ImportStats,
  ImportFilters as ImportFiltersType,
  ReadyToPublishCirconscription,
} from "@/types/upload";

interface UploadPageContentProps {
  onUploadSuccess?: () => void;
  // ✅ APPROCHE 2 : Props optionnelles pour les données initiales chargées dans la page
  initialAllCels?: { codeCellule: string; libelleCellule: string }[];
  initialImports?: ImportData[];
}

export function UploadPageContent({
  onUploadSuccess,
  initialAllCels,
  initialImports,
}: UploadPageContentProps) {
  // Log pour détecter les re-renders
  // if (process.env.NODE_ENV === "development") {
  //   console.log("🔄 [UploadPageContent] RENDER");
  // }

  // États pour les données
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [filters, setFilters] = useState<ImportFiltersType>({
    page: 1,
    limit: 10,
  });
  // ✅ NOUVEAU : État pour les circonscriptions prêtes à publier
  const [readyToPublishCirconscriptions, setReadyToPublishCirconscriptions] =
    useState<ReadyToPublishCirconscription[]>([]);

  // Récupérer l'utilisateur connecté pour filtrer les CELs
  const { user } = useAuth();

  // ✅ NOUVEAU : États pour la pagination
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  // ✅ APPROCHE 2 : Initialiser avec les données passées en props si disponibles
  const [allCels, setAllCels] = useState<
    { codeCellule: string; libelleCellule: string }[]
  >(initialAllCels || []);

  // ✅ APPROCHE 2 : Initialiser imports avec les données passées en props si disponibles
  const [imports, setImports] = useState<ImportData[]>(initialImports || []);

  // ✅ Filtrer les CELs selon le rôle de l'utilisateur
  // ✅ CORRECTION : Utiliser un état local pour forcer le recalcul quand les données sont prêtes
  const [availableCels, setAvailableCels] = useState<
    { codeCellule: string; libelleCellule: string }[]
  >([]);

  // ✅ CORRECTION : Créer des clés de dépendance stables
  const userCelCodesKey = user?.cellules
    ? user.cellules
        .map((c) => c.COD_CEL)
        .sort()
        .join(",")
    : "";
  const allCelsKey =
    allCels.length > 0
      ? allCels
          .map((c) => c.codeCellule)
          .sort()
          .join(",")
      : "";

  // ✅ CORRECTION : useEffect pour recalculer availableCels quand user ou allCels changent
  // ✅ CORRECTION : Attendre que user.cellules soit disponible pour les utilisateurs USER
  useEffect(() => {
    // if (process.env.NODE_ENV === "development") {
    //   console.log("🔄 [UploadPageContent] Recalcul availableCels:", {
    //     userRole: user?.role?.code,
    //     userCellulesCount: user?.cellules?.length || 0,
    //     allCelsCount: allCels.length,
    //     hasUser: !!user,
    //     hasCellules: !!(user?.cellules && user.cellules.length > 0),
    //   });
    // }

    // Si pas d'utilisateur ou pas de CELs chargées, retourner vide
    if (!user || allCels.length === 0) {
      // if (process.env.NODE_ENV === "development") {
      //   console.log("⚠️ [UploadPageContent] Données incomplètes:", {
      //     hasUser: !!user,
      //     allCelsCount: allCels.length,
      //   });
      // }
      setAvailableCels([]);
      return;
    }

    // ✅ CORRECTION : Pour les utilisateurs USER, attendre que cellules soit disponible
    if (user.role?.code === "USER") {
      // Si cellules n'est pas encore chargé, attendre
      if (!user.cellules || user.cellules.length === 0) {
        if (process.env.NODE_ENV === "development") {
          // console.log(
          //   "⏳ [UploadPageContent] En attente de user.cellules pour USER..."
          // );
        }
        setAvailableCels([]);
        return;
      }

      // Pour les utilisateurs USER, ne montrer que leurs CELs attribuées
      const userCelCodes = user.cellules.map((cel) => cel.COD_CEL);
      const filtered = allCels.filter((cel) =>
        userCelCodes.includes(cel.codeCellule)
      );
      // if (process.env.NODE_ENV === "development") {
      //   console.log("✅ [UploadPageContent] CELs filtrées pour USER:", {
      //     userCelCodes,
      //     filteredCount: filtered.length,
      //     allCelsCount: allCels.length,
      //   });
      // }
      setAvailableCels(filtered);
    } else {
      // Pour ADMIN et SADMIN, montrer toutes les CELs
      // if (process.env.NODE_ENV === "development") {
      //   console.log(
      //     "✅ [UploadPageContent] Toutes les CELs pour",
      //     user.role?.code
      //   );
      // }
      setAvailableCels(allCels);
    }
  }, [
    user,
    user?.role?.code,
    userCelCodesKey,
    allCels,
    allCelsKey,
    user?.cellules?.length,
  ]); // ✅ CORRECTION : Ajouter user?.cellules?.length pour détecter quand cellules est chargé

  // État pour le modal d'upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fonction de chargement des données - mémorisée avec useCallback
  const loadData = useCallback(
    async (newFilters?: ImportFiltersType) => {
      try {
        setLoading(true);

        const filtersToUse = newFilters || filters;

        // if (process.env.NODE_ENV === "development") {
        //   console.log(
        //     "📊 [UploadPageContent] Chargement avec filtres:",
        //     filtersToUse
        //   );
        // }

        // Charger les données en parallèle, mais gérer les erreurs individuellement
        const [statsData, importsData, listsData, readyToPublishData] =
          await Promise.allSettled([
            uploadApi.getStats(),
            uploadApi.getImports(filtersToUse),
            listsApi.getFormLists(),
            uploadApi.getReadyToPublishCirconscriptions(),
          ]);

        // Traiter les statistiques (peuvent être null si pas de permissions)
        if (statsData.status === "fulfilled") {
          setStats(statsData.value);
        } else {
          // console.warn(
          //   "⚠️ [UploadPageContent] Statistiques non disponibles:",
          //   statsData.reason
          // );
          setStats(null);
        }

        // Traiter les imports
        if (importsData.status === "fulfilled") {
          if (importsData.value === null) {
            if (process.env.NODE_ENV === "development") {
              // console.warn(
              //   "⚠️ [UploadPageContent] Imports non disponibles (permissions insuffisantes)"
              // );
            }
            setImports([]);
          } else {
            // if (process.env.NODE_ENV === "development") {
            //   console.log(
            //     "📊 [UploadPageContent] Imports chargés:",
            //     importsData.value.imports.length,
            //     "éléments"
            //   );
            // }
            setImports(importsData.value.imports);

            // ✅ NOUVEAU : Mettre à jour les états de pagination
            if (importsData.value.total !== undefined) {
              setTotal(importsData.value.total);
            }
            if (importsData.value.page !== undefined) {
              setCurrentPage(importsData.value.page);
            }
            if (importsData.value.totalPages !== undefined) {
              setTotalPages(importsData.value.totalPages);
            }
          }
        }

        // Traiter les CELs
        if (listsData.status === "fulfilled") {
          setAllCels(listsData.value.cels);

          // if (process.env.NODE_ENV === "development") {
          //   console.log("📊 [UploadPageContent] Listes chargées:", {
          //     totalCels: listsData.value.cels.length,
          //     userRole: user?.role?.code,
          //     userCels: user?.cellules?.length || 0,
          //   });
          // }
        } else {
          console.error(
            "❌ [UploadPageContent] Erreur lors du chargement des listes:",
            listsData.reason
          );
          toast.error("Erreur lors du chargement des listes");
        }

        // ✅ NOUVEAU : Traiter les circonscriptions prêtes à publier
        if (
          readyToPublishData.status === "fulfilled" &&
          readyToPublishData.value
        ) {
          setReadyToPublishCirconscriptions(
            readyToPublishData.value.circonscriptions
          );
        } else {
          // En cas d'erreur ou de permissions insuffisantes, mettre une liste vide
          setReadyToPublishCirconscriptions([]);
        }
      } catch (error: unknown) {
        console.error(
          "❌ [UploadPageContent] Erreur générale lors du chargement:",
          error
        );
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  ); // Dépendances : filters pour recharger quand ils changent

  // ✅ APPROCHE 2 : Si les données initiales sont fournies, on les utilise directement
  // Sinon, on charge les données normalement
  useEffect(() => {
    // Si on a reçu des données initiales, on les utilise et on charge seulement les stats
    if (initialAllCels && initialAllCels.length > 0) {
      setAllCels(initialAllCels);
      // ✅ CORRECTION : Initialiser aussi les imports si fournis
      if (initialImports && initialImports.length > 0) {
        setImports(initialImports);
      }
      // if (process.env.NODE_ENV === "development") {
      //   console.log(
      //     "✅ [UploadPageContent] Utilisation des données initiales:",
      //     {
      //       celsCount: initialAllCels.length,
      //       importsCount: initialImports?.length || 0,
      //     }
      //   );
      // }

      // Charger seulement les stats et circonscriptions prêtes (les CELs et imports sont déjà chargés)
      if (user) {
        // Charger les stats
        uploadApi
          .getStats()
          .then((statsData) => {
            setStats(statsData);
          })
          .catch((_error) => {
            // console.warn(
            //   "⚠️ [UploadPageContent] Statistiques non disponibles:",
            //   _error
            // );
            setStats(null);
          });

        // ✅ NOUVEAU : Charger les circonscriptions prêtes à publier
        uploadApi
          .getReadyToPublishCirconscriptions()
          .then((data) => {
            if (data) {
              setReadyToPublishCirconscriptions(data.circonscriptions);
            } else {
              setReadyToPublishCirconscriptions([]);
            }
          })
          .catch((_error) => {
            // En cas d'erreur, mettre une liste vide
            setReadyToPublishCirconscriptions([]);
          });
      }
      return;
    }

    // Sinon, charger les données normalement (fallback si pas de données initiales)
    if (!user) {
      // if (process.env.NODE_ENV === "development") {
      //   console.log("⏳ [UploadPageContent] En attente de l'utilisateur...");
      // }
      return;
    }

    // if (process.env.NODE_ENV === "development") {
    //   console.log(
    //     "✅ [UploadPageContent] Utilisateur disponible, chargement des données...",
    //     {
    //       userRole: user.role?.code,
    //       userCellulesCount: user.cellules?.length || 0,
    //     }
    //   );
    // }

    // Charger les données maintenant que l'utilisateur est disponible
    loadData();
  }, [loadData, user, initialAllCels, initialImports]); // Dépendre de user ET loadData pour s'assurer que user est chargé

  // Gestion du succès d'upload
  const handleUploadSuccess = () => {
    if (process.env.NODE_ENV === "development") {
      // console.log(
      //   "🔄 [UploadPageContent] Upload réussi, rechargement des données..."
      // );
    }
    loadData();
    setIsUploadModalOpen(false); // Fermer le modal
    onUploadSuccess?.();
  };

  // Gestion des changements de filtres
  const handleFiltersChange = (newFilters: ImportFiltersType) => {
    if (process.env.NODE_ENV === "development") {
      // console.log("🔍 [UploadPageContent] Changement de filtres:", newFilters);
    }

    // Mettre à jour les filtres locaux
    setFilters(newFilters);

    // Recharger les données avec les nouveaux filtres
    loadData(newFilters);
  };

  // ✅ NOUVEAU : Gestion du changement de page
  const handlePageChange = (page: number) => {
    if (process.env.NODE_ENV === "development") {
      // console.log("📄 [UploadPageContent] Changement de page:", page);
    }

    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadData(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <StatsSection stats={stats} loading={loading} />

      {/* ✅ NOUVEAU : Alerte des circonscriptions prêtes à publier */}
      <ReadyToPublishCirconscriptionsAlert
        circonscriptions={readyToPublishCirconscriptions}
        loading={loading}
        isUser={user?.role?.code === "USER"}
        onViewDetails={(codeCirconscription) => {
          // Optionnel: Filtrer les imports par circonscription quand on clique
          handleFiltersChange({ ...filters, codeCirconscription, page: 1 });
        }}
      />

      {/* Bouton pour ouvrir le modal d'upload */}
      <div className="flex justify-center">
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2"
          size="lg"
        >
          <Upload className="h-5 w-5" />
          Nouvel import Excel
        </Button>
      </div>

      {/* Section Imports */}
      <ImportsSection
        imports={imports}
        availableCels={availableCels}
        onRefresh={() => loadData(filters)}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal d'upload */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
