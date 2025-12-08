"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

// Composants
import { LegislativeStatsSection } from "./legislatives-stats-section";
import { CirconscriptionsTable } from "./circonscriptions-table";
import { CirconscriptionFilters } from "./circonscription-filters";
import { CirconscriptionDetailsModal } from "./circonscription-details-modal";
import { NationalDataModal } from "./national-data-modal";

// API et types
import { legislativesPublicationsApi } from "@/lib/api/legislatives-publications";
import type {
  Circonscription,
  LegislativePublicationStats,
  CirconscriptionQuery,
  LegislativesPublicationsPageContentProps,
} from "@/types/legislatives-publications";

export function LegislativesPublicationsPageContent({
  onPublicationSuccess,
  isUser = false,
  onRefresh: _externalOnRefresh, // Préfixé avec _ car utilisé uniquement par le header parent
  loading: externalLoading,
}: LegislativesPublicationsPageContentProps & {
  onRefresh?: () => void;
  loading?: boolean;
}) {
  // État pour le loading
  const [internalLoading, setInternalLoading] = useState(false);
  const loading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  // États pour les données
  const [circonscriptions, setCirconscriptions] = useState<Circonscription[]>(
    []
  );
  const [stats, setStats] = useState<LegislativePublicationStats | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CirconscriptionQuery>({
    page: 1,
    limit: 10,
  });

  // États pour la modal de détails
  const [selectedCodeCirconscription, setSelectedCodeCirconscription] =
    useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // États pour la modal des données nationales
  // const [isNationalDataModalOpen, setIsNationalDataModalOpen] = useState(false);

  // Référence pour éviter les dépendances circulaires
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Charger les données initiales
  const loadInitialData = useCallback(
    async (customFilters?: CirconscriptionQuery) => {
      try {
        setInternalLoading(true);
        const filtersToUse = customFilters || filtersRef.current;

        // Charger les statistiques et circonscriptions en parallèle
        const [statsData, circonscriptionsData] = await Promise.allSettled([
          legislativesPublicationsApi.getStats(),
          legislativesPublicationsApi.getCirconscriptions(filtersToUse),
        ]);

        // Traiter les statistiques
        if (statsData.status === "fulfilled") {
          setStats(statsData.value);
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "⚠️ [LegislativesPublicationsPageContent] Impossible de charger les statistiques"
            );
          }
          setStats(null);
        }

        // Traiter les circonscriptions
        if (
          circonscriptionsData.status === "fulfilled" &&
          circonscriptionsData.value
        ) {
          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.log(
              "🔍 [LegislativesPublicationsPageContent] Circonscriptions reçues:",
              {
                total: circonscriptionsData.value.total,
                count: circonscriptionsData.value.circonscriptions.length,
                page: circonscriptionsData.value.page,
              }
            );
          }
          setCirconscriptions(circonscriptionsData.value.circonscriptions);
          setTotalPages(circonscriptionsData.value.totalPages);
          setCurrentPage(circonscriptionsData.value.page);
        } else {
          console.warn(
            "⚠️ [LegislativesPublicationsPageContent] Impossible de charger les circonscriptions"
          );
          setCirconscriptions([]);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } catch (error: unknown) {
        console.error(
          "❌ [LegislativesPublicationsPageContent] Erreur lors du chargement:",
          error
        );
        toast.error("Erreur lors du chargement des données");
      } finally {
        setInternalLoading(false);
      }
    },
    []
  );

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Gestion des actions de publication
  const handlePublish = useCallback(
    async (codeCirconscription: string): Promise<void> => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(
          "📢 [LegislativesPublicationsPageContent] Publication de la circonscription:",
          codeCirconscription
        );
      }

      try {
        const result = await legislativesPublicationsApi.publishCirconscription(
          codeCirconscription
        );

        if (result.success) {
          toast.success(result.message);

          // Mettre à jour le statut localement
          setCirconscriptions((prev) =>
            prev.map((c) =>
              c.codeCirconscription === codeCirconscription
                ? {
                    ...c,
                    publicationStatus: "1" as const,
                    lastUpdate: new Date().toISOString(),
                  }
                : c
            )
          );

          onPublicationSuccess?.();

          // Recharger toutes les données pour avoir les statistiques à jour
          await loadInitialData();
        } else {
          toast.error(result.message || "Erreur lors de la publication");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de la publication";
        console.error(
          "❌ [LegislativesPublicationsPageContent] Erreur lors de la publication:",
          error
        );
        toast.error(errorMessage);
      }
    },
    [onPublicationSuccess, loadInitialData]
  );

  // Gestion de l'annulation de publication
  const handleCancel = useCallback(
    async (codeCirconscription: string): Promise<void> => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(
          "❌ [LegislativesPublicationsPageContent] Annulation de la circonscription:",
          codeCirconscription
        );
      }

      try {
        const result = await legislativesPublicationsApi.cancelPublication(
          codeCirconscription
        );

        if (result.success) {
          toast.success(result.message);

          // Mettre à jour le statut localement
          setCirconscriptions((prev) =>
            prev.map((c) =>
              c.codeCirconscription === codeCirconscription
                ? {
                    ...c,
                    publicationStatus: "C" as const,
                    lastUpdate: new Date().toISOString(),
                  }
                : c
            )
          );

          onPublicationSuccess?.();

          // Recharger toutes les données pour avoir les statistiques à jour
          await loadInitialData();
        } else {
          toast.error(result.message || "Erreur lors de l'annulation");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'annulation";
        console.error(
          "❌ [LegislativesPublicationsPageContent] Erreur lors de l'annulation:",
          error
        );
        toast.error(errorMessage);
      }
    },
    [onPublicationSuccess, loadInitialData]
  );

  // Gestion de la vue des détails
  const handleViewDetails = useCallback((codeCirconscription: string) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(
        "👁️ [LegislativesPublicationsPageContent] Voir détails:",
        codeCirconscription
      );
    }
    setSelectedCodeCirconscription(codeCirconscription);
    setIsDetailsModalOpen(true);
  }, []);

  // Fermer la modal de détails
  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedCodeCirconscription(null);
  }, []);

  // Gestion des changements de filtres
  const handleFiltersChange = useCallback(
    (newFilters: CirconscriptionQuery) => {
      setFilters(newFilters);
      // Recharger les données avec les nouveaux filtres
      loadInitialData(newFilters);
    },
    [loadInitialData]
  );

  // Gestion des changements de page
  const handlePageChange = useCallback(
    (page: number) => {
      const newFilters = { ...filtersRef.current, page };
      setFilters(newFilters);
      loadInitialData(newFilters);
    },
    [loadInitialData]
  );

  // Note: _externalOnRefresh est passé depuis la page parent pour le header
  // Le composant content gère son propre refresh via loadInitialData
  // Le header parent utilise onRefresh directement depuis ses props

  // Ouvrir la modal des données nationales
  // const handleOpenNationalData = useCallback(() => {
  //   setIsNationalDataModalOpen(true);
  // }, []);

  // Fermer la modal des données nationales
  // const handleCloseNationalData = useCallback(() => {
  //   setIsNationalDataModalOpen(false);
  // }, []);

  // Vérifier si on peut afficher les boutons de données nationales
  const showNationalDataButtons = useMemo(() => {
    return !isUser && circonscriptions.length > 0;
  }, [isUser, circonscriptions.length]);

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <LegislativeStatsSection stats={stats} loading={loading} />

      {/* Boutons de données nationales (ADMIN/SADMIN uniquement) */}
      {/* {showNationalDataButtons && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📊 Données Nationales
              </h3>
              <p className="text-sm text-blue-700">
                Consultez les résultats consolidés au niveau national
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleOpenNationalData}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Voir Données Nationales
              </Button>
            </div>
          </div>
        </div>
      )} */}

      {/* Filtres et recherche */}
      <CirconscriptionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />

      {/* Tableau des circonscriptions */}
      <CirconscriptionsTable
        circonscriptions={circonscriptions}
        loading={loading}
        isUser={isUser}
        onViewDetails={handleViewDetails}
        onPublish={!isUser ? handlePublish : undefined}
        onCancel={!isUser ? handleCancel : undefined}
        pagination={{
          page: currentPage,
          limit: filters.limit || 10,
          total:
            circonscriptions.length > 0
              ? totalPages * (filters.limit || 10)
              : 0,
          totalPages,
          onPageChange: handlePageChange,
        }}
      />

      {/* Modal de détails de la circonscription */}
      {selectedCodeCirconscription && (
        <CirconscriptionDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          codeCirconscription={selectedCodeCirconscription}
          isUser={isUser}
          publicationStatus={
            circonscriptions.find(
              (c) => c.codeCirconscription === selectedCodeCirconscription
            )?.publicationStatus
          }
          onPublish={!isUser ? handlePublish : undefined}
          onCancel={!isUser ? handleCancel : undefined}
        />
      )}

      {/* Modal des données nationales */}
      {/* <NationalDataModal
        isOpen={isNationalDataModalOpen}
        onClose={handleCloseNationalData}
      /> */}
    </div>
  );
}
