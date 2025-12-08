"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CirconscriptionsTable } from "@/components/legislatives-publications/circonscriptions-table";
import { CirconscriptionFilters } from "@/components/legislatives-publications/circonscription-filters";
import { CirconscriptionDetailsModal } from "@/components/legislatives-publications/circonscription-details-modal";
import { legislativesPublicationsApi } from "@/lib/api/legislatives-publications";
import type {
  Circonscription,
  CirconscriptionQuery,
} from "@/types/legislatives-publications";
import { useAuth } from "@/contexts/AuthContext";

export function CirconscriptionsContent() {
  const { user } = useAuth();
  const [circonscriptions, setCirconscriptions] = useState<Circonscription[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CirconscriptionQuery>({
    page: 1,
    limit: 10,
  });
  const [selectedCodeCirconscription, setSelectedCodeCirconscription] =
    useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Référence pour éviter les dépendances circulaires
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Note: En mode supervision, toutes les actions de publication sont désactivées
  // La section supervision est en lecture seule pour tous les utilisateurs

  // Charger les circonscriptions
  const loadCirconscriptions = useCallback(
    async (customFilters?: CirconscriptionQuery, forceRefresh = false) => {
      if (!user) return;

      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // Utiliser les filtres personnalisés ou les filtres actuels
        const filtersToUse = customFilters || filtersRef.current;

        const response = await legislativesPublicationsApi.getCirconscriptions(
          filtersToUse
        );

        if (response) {
          // Le backend filtre automatiquement :
          // - MANAGER : selon les circonscriptions assignées
          // - ADMIN/SADMIN : toutes les circonscriptions
          setCirconscriptions(response.circonscriptions);
          setTotalPages(response.totalPages);
          setCurrentPage(response.page);
          setTotal(response.total);
        } else {
          setCirconscriptions([]);
          setTotalPages(1);
          setCurrentPage(1);
          setTotal(0);
        }
      } catch (error: unknown) {
        console.error("Erreur lors du chargement des circonscriptions:", error);
        toast.error("Erreur lors du chargement des circonscriptions");
        setCirconscriptions([]);
        setTotalPages(1);
        setCurrentPage(1);
        setTotal(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  // Charger les données au montage
  useEffect(() => {
    loadCirconscriptions();
  }, [loadCirconscriptions]);

  // Gestion de la pagination
  const handlePageChange = useCallback(
    (page: number) => {
      const newFilters = { ...filtersRef.current, page };
      setFilters(newFilters);
      loadCirconscriptions(newFilters);
    },
    [loadCirconscriptions]
  );

  // Gestion des changements de filtres
  const handleFiltersChange = useCallback(
    (newFilters: CirconscriptionQuery) => {
      setFilters(newFilters);
      loadCirconscriptions(newFilters);
    },
    [loadCirconscriptions]
  );

  // Gestion du rafraîchissement
  const handleRefresh = useCallback(() => {
    loadCirconscriptions(filtersRef.current, true);
  }, [loadCirconscriptions]);

  // Gestion de la vue des détails
  const handleViewDetails = useCallback((codeCirconscription: string) => {
    setSelectedCodeCirconscription(codeCirconscription);
    setIsDetailsModalOpen(true);
  }, []);

  // Fermer la modal de détails
  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedCodeCirconscription(null);
  }, []);

  // Note: Les actions de publication/annulation sont désactivées en mode supervision
  // La section supervision est en lecture seule pour tous les utilisateurs

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <CirconscriptionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />

      {/* Bouton de rafraîchissement */}
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Rafraîchissement..." : "Rafraîchir"}
        </Button>
      </div>

      {/* Tableau des circonscriptions */}
      {loading && circonscriptions.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Chargement des circonscriptions...</span>
        </div>
      ) : (
        <CirconscriptionsTable
          circonscriptions={circonscriptions}
          loading={loading}
          isUser={true} // Section supervision = lecture seule pour tous
          onViewDetails={handleViewDetails}
          onPublish={undefined} // Désactivé en mode supervision (lecture seule)
          onCancel={undefined} // Désactivé en mode supervision (lecture seule)
          pagination={{
            page: currentPage,
            limit: filters.limit || 10,
            total,
            totalPages,
            onPageChange: handlePageChange,
          }}
        />
      )}

      {/* Modal de détails de la circonscription */}
      {selectedCodeCirconscription && (
        <CirconscriptionDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          codeCirconscription={selectedCodeCirconscription}
          isUser={true} // Section supervision = lecture seule pour tous
          onPublish={undefined} // Désactivé en mode supervision (lecture seule)
          onCancel={undefined} // Désactivé en mode supervision (lecture seule)
        />
      )}
    </div>
  );
}
