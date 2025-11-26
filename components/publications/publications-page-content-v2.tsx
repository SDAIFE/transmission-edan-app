"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

// Composants
import { PublicationsStatsSection } from "./publications-stats-section";
import { EntitiesTable } from "./entities-table";
import { EntityFiltersComponent } from "./entity-filters";
import { ReadyForPublicationEntitiesAlert } from "./ready-for-publication-entities-alert";
import { EntityDetailsModal } from "./entity-details-modal";
import { NationalResultsModal } from "./national-results-modal";

// API et types
import { publicationsApi } from "@/lib/api/publications";
import type {
  PublishableEntity,
  DepartmentStats,
  EntityFilters,
  PublicationsPageContentProps,
} from "@/types/publications";

export function PublicationsPageContentV2({
  onPublicationSuccess,
  isUser = false,
}: PublicationsPageContentProps) {
  // État pour le loading
  const [loading, setLoading] = useState(false);

  // États pour les données
  const [entities, setEntities] = useState<PublishableEntity[]>([]);
  const [allEntitiesRaw, setAllEntitiesRaw] = useState<PublishableEntity[]>([]); // Toutes les entités pour les statistiques
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<EntityFilters>({
    page: 1,
    limit: 10,
  });

  // Stabiliser la référence avec useMemo (avec protection undefined)
  const allEntities = useMemo(() => allEntitiesRaw || [], [allEntitiesRaw]);

  // États pour la génération des PDFs nationaux
  const [generatingNationalPDF, setGeneratingNationalPDF] = useState(false);
  const [generatingDetailedPDF, setGeneratingDetailedPDF] = useState(false);

  // États pour la modal de détails
  const [selectedEntity, setSelectedEntity] =
    useState<PublishableEntity | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // États pour la modal des résultats nationaux
  const [isNationalResultsModalOpen, setIsNationalResultsModalOpen] =
    useState(false);

  // Référence pour éviter les dépendances circulaires
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Logique pour déterminer si les boutons de résultats nationaux doivent être visibles
  const showNationalResultButtons = useMemo(() => {
    if (!allEntities || allEntities.length === 0) return false;

    return allEntities.some(
      (entity) =>
        // Entité prête pour publication (toutes les CELs importées)
        (entity.pendingCels === 0 && entity.importedCels > 0) ||
        // Entité déjà publiée
        entity.publicationStatus === "PUBLISHED"
    );
  }, [allEntities]);

  // Compter le nombre d'entités prêtes pour la publication
  const _readyEntitiesCount = useMemo(() => {
    if (!allEntities || allEntities.length === 0) return 0;

    return allEntities.filter(
      (entity) =>
        entity.pendingCels === 0 &&
        entity.importedCels > 0 &&
        entity.publicationStatus !== "PUBLISHED"
    ).length;
  }, [allEntities]);

  // Charger les données initiales
  const loadInitialData = useCallback(async (customFilters?: EntityFilters) => {
    try {
      setLoading(true);
      const filtersToUse = customFilters || filtersRef.current;

      // Charger les statistiques, entités filtrées et toutes les entités en parallèle
      const [statsData, entitiesData, allEntitiesData] =
        await Promise.allSettled([
          publicationsApi.getStats(),
          publicationsApi.getEntities(filtersToUse),
          publicationsApi.getEntities({ page: 1, limit: 1000 }), // Charger toutes les entités
        ]);

      // Traiter les statistiques
      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      } else {
        //en developpement
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "⚠️ [PublicationsPageContentV2] Impossible de charger les statistiques"
          );
        }
        setStats(null);
      }

      // Traiter les entités filtrées
      if (entitiesData.status === "fulfilled" && entitiesData.value) {
        //en developpement
        if (process.env.NODE_ENV === "development") {
          console.warn("🔍 [PublicationsPageContentV2] Entités reçues:", {
            total: entitiesData.value.total,
            count: entitiesData.value.entities.length,
            premiereEntite: entitiesData.value.entities[0],
            typesPresents: [
              ...new Set(
                entitiesData.value.entities.map(
                  (e: PublishableEntity) => e.type
                )
              ),
            ],
            communesAbidjan: entitiesData.value.entities.filter(
              (e: PublishableEntity) => e.type === "COMMUNE"
            ).length,
          });
        }
        setEntities(entitiesData.value.entities);
        setTotalPages(entitiesData.value.totalPages);
        setCurrentPage(entitiesData.value.page);
      } else {
        console.warn(
          "⚠️ [PublicationsPageContentV2] Impossible de charger les entités filtrées"
        );
        setEntities([]);
        setTotalPages(1);
        setCurrentPage(1);
      }

      // Traiter toutes les entités
      if (allEntitiesData.status === "fulfilled" && allEntitiesData.value) {
        setAllEntitiesRaw(allEntitiesData.value.entities);
      } else {
        console.warn(
          "⚠️ [PublicationsPageContentV2] Impossible de charger toutes les entités"
        );
        setAllEntitiesRaw([]);
      }
    } catch (error: unknown) {
      console.error(
        "❌ [PublicationsPageContentV2] Erreur lors du chargement:",
        error
      );
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Gestion des actions de publication
  const handlePublish = useCallback(
    async (entity: PublishableEntity): Promise<void> => {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "📢 [PublicationsPageContentV2] Publication de l'entité:",
          entity.libelle
        );
      }

      // Vérifier si l'entité peut être publiée
      if (entity.pendingCels > 0) {
        toast.error(`Impossible de publier ${entity.libelle}`, {
          description: `${entity.pendingCels} CEL(s) ne sont pas encore importées`,
        });
        return;
      }

      try {
        const result = await publicationsApi.publishEntity(entity);

        if (result.success) {
          toast.success(result.message);

          // Mettre à jour le statut localement
          setEntities((prev) =>
            prev.map((e) =>
              e.id === entity.id
                ? {
                    ...e,
                    publicationStatus:
                      "PUBLISHED" as PublishableEntity["publicationStatus"],
                    lastUpdate: new Date().toISOString(),
                  }
                : e
            )
          );

          onPublicationSuccess?.();

          // Recharger toutes les données pour avoir les statistiques à jour
          await loadInitialData();
        } else {
          toast.error(result.message || "Erreur lors de la publication");
        }
      } catch (error) {
        console.error(
          "❌ [PublicationsPageContentV2] Erreur lors de la publication:",
          error
        );
        toast.error("Erreur lors de la publication");
      }
    },
    [onPublicationSuccess, loadInitialData]
  );

  // Gestion de l'annulation de publication
  const handleCancel = useCallback(
    async (entity: PublishableEntity): Promise<void> => {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "❌ [PublicationsPageContentV2] Annulation de l'entité:",
          entity.libelle
        );
      }

      try {
        const result = await publicationsApi.cancelEntity(entity);

        if (result.success) {
          toast.success(result.message);

          // Mettre à jour le statut localement
          setEntities((prev) =>
            prev.map((e) =>
              e.id === entity.id
                ? {
                    ...e,
                    publicationStatus:
                      "CANCELLED" as PublishableEntity["publicationStatus"],
                    lastUpdate: new Date().toISOString(),
                  }
                : e
            )
          );

          onPublicationSuccess?.();

          // Recharger toutes les données pour avoir les statistiques à jour
          await loadInitialData();
        } else {
          toast.error(result.message || "Erreur lors de l'annulation");
        }
      } catch (error) {
        //en developpement
        if (process.env.NODE_ENV === "development") {
          console.error(
            "❌ [PublicationsPageContentV2] Erreur lors de l'annulation:",
            error
          );
        }
        toast.error("Erreur lors de l'annulation");
      }
    },
    [onPublicationSuccess, loadInitialData]
  );

  // Gestion de la vue des détails
  const handleViewDetails = useCallback((entity: PublishableEntity) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("👁️ [PublicationsPageContentV2] Voir détails:", entity);
    }
    setSelectedEntity(entity);
    setIsDetailsModalOpen(true);
  }, []);

  // Fermer la modal de détails
  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedEntity(null);
  }, []);

  // Ouvrir la modal des résultats nationaux
  const handleOpenNationalResults = useCallback(() => {
    setIsNationalResultsModalOpen(true);
  }, []);

  // Fermer la modal des résultats nationaux
  const handleCloseNationalResults = useCallback(() => {
    setIsNationalResultsModalOpen(false);
  }, []);

  // Gestion des changements de filtres
  const handleFiltersChange = useCallback(
    (newFilters: EntityFilters) => {
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

  // Gestion de la recherche depuis l'alerte
  const handleSearchFromAlert = useCallback(
    (searchTerm: string) => {
      const newFilters = {
        ...filtersRef.current,
        search: searchTerm,
        page: 1, // Reset à la page 1 lors de la recherche
      };
      setFilters(newFilters);
      loadInitialData(newFilters);
    },
    [loadInitialData]
  );

  // Génération du PDF Résultat National
  const _handleGenerateNationalPDF = async () => {
    if (generatingNationalPDF) return;

    try {
      setGeneratingNationalPDF(true);

      //en developpement
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "📄 [PublicationsPageContentV2] Génération du Résultat National..."
        );
      }

      // Utiliser l'API pour générer le PDF
      const pdfBlob = await publicationsApi.generateNationalResultsPDF({
        includeImages: true,
        format: "A4",
        orientation: "portrait",
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resultats-nationaux-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF généré avec succès", {
        description: "Le Résultat National a été généré et téléchargé",
        duration: 5000,
      });
    } catch (error: unknown) {
      //en developpement
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ [PublicationsPageContentV2] Erreur lors de la génération du PDF National:",
          error
        );
      }
      toast.error("Erreur lors de la génération", {
        description:
          (error as Error)?.message ||
          "Impossible de générer le PDF Résultat National",
        duration: 5000,
      });
    } finally {
      setGeneratingNationalPDF(false);
    }
  };

  // Génération du PDF Résultat National Détaillé
  const _handleGenerateDetailedPDF = async () => {
    if (generatingDetailedPDF) return;

    try {
      setGeneratingDetailedPDF(true);

      //en developpement
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "📄 [PublicationsPageContentV2] Génération du Résultat National Détaillé..."
        );
      }

      // TODO: Implémenter la génération du PDF Résultat National Détaillé
      // Simulation pour le moment
      await new Promise((resolve) => setTimeout(resolve, 4000));

      toast.success("PDF généré avec succès", {
        description: "Le Résultat National Détaillé a été généré et téléchargé",
        duration: 5000,
      });
    } catch (error) {
      //en developpement
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ [PublicationsPageContentV2] Erreur lors de la génération du PDF Détaillé:",
          error
        );
      }
      toast.error("Erreur lors de la génération", {
        description: "Impossible de générer le PDF Résultat National Détaillé",
        duration: 5000,
      });
    } finally {
      setGeneratingDetailedPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <PublicationsStatsSection stats={stats} loading={loading} />

      {/* Alerte pour les entités prêtes à publier/consolider */}
      <ReadyForPublicationEntitiesAlert
        entities={allEntities}
        loading={loading}
        onViewDetails={handleViewDetails}
        onPublish={handlePublish}
        onSearchEntity={handleSearchFromAlert}
        isUser={isUser}
      />

      {/* Ancien compteur simple supprimé - remplacé par ReadyForPublicationEntitiesAlert */}

      {/* Boutons de génération des résultats nationaux - Visibles uniquement pour SADMIN et ADMIN */}
      {!isUser && showNationalResultButtons && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📊 Résultats Nationaux
              </h3>
              <p className="text-sm text-blue-700">
                Générer les rapports consolidés au niveau national (125 entités
                : 111 départements + 14 communes Abidjan)
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleOpenNationalResults}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Voir Résultats Nationaux
              </Button>
              {/*               
              <Button
                onClick={handleGenerateNationalPDF}
                disabled={generatingNationalPDF || generatingDetailedPDF}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {generatingNationalPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {generatingNationalPDF ? 'Génération...' : 'Télécharger PDF'}
              </Button>
              
              <Button
                onClick={handleGenerateDetailedPDF}
                disabled={generatingNationalPDF || generatingDetailedPDF}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                size="sm"
              >
                {generatingDetailedPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {generatingDetailedPDF ? 'Génération...' : 'Résultat National Détaillé'}
              </Button> */}
            </div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <EntityFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Tableau des entités */}
      <EntitiesTable
        entities={entities}
        loading={loading}
        onRefresh={loadInitialData}
        onPublish={handlePublish}
        onCancel={handleCancel}
        onViewDetails={handleViewDetails}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isUser={isUser}
      />

      {/* Modal de détails de l'entité */}
      <EntityDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        entity={selectedEntity}
        onPublish={handlePublish}
        onCancel={handleCancel}
        isUser={isUser}
      />

      {/* Modal des résultats nationaux */}
      <NationalResultsModal
        isOpen={isNationalResultsModalOpen}
        onClose={handleCloseNationalResults}
      />
    </div>
  );
}
