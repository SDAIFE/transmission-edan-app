"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { CirconscriptionsTable } from "@/components/legislatives-publications/circonscriptions-table";
import { legislativesPublicationsApi } from "@/lib/api/legislatives-publications";
import type { Circonscription, CirconscriptionQuery } from "@/types/legislatives-publications";
import { useAuth } from "@/contexts/AuthContext";

interface CirconscriptionsPublieesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CirconscriptionsPublieesModal({
  isOpen,
  onClose,
}: CirconscriptionsPublieesModalProps) {
  const { user } = useAuth();
  const [circonscriptions, setCirconscriptions] = useState<Circonscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Déterminer si l'utilisateur est MANAGER (pour le filtrage et les actions)
  const isManager = user?.role?.code === "MANAGER";
  const isAdmin = user?.role?.code === "ADMIN" || user?.role?.code === "SADMIN";

  // Charger les circonscriptions
  const loadCirconscriptions = useCallback(async (page = 1) => {
    if (!user) return;

    try {
      setLoading(true);

      // Construire les filtres : pas de filtre sur l'état de publication
      // Le backend filtre automatiquement selon le rôle :
      // - MANAGER : selon les circonscriptions assignées (tous les états)
      // - ADMIN/SADMIN : toutes les circonscriptions (tous les états)
      const filters: CirconscriptionQuery = {
        page,
        limit: 10,
      };

      const response = await legislativesPublicationsApi.getCirconscriptions(filters);

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
    }
  }, [user]);

  // Charger les données à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      loadCirconscriptions(1);
    }
  }, [isOpen, loadCirconscriptions]);

  // Gestion de la pagination
  const handlePageChange = useCallback((page: number) => {
    loadCirconscriptions(page);
  }, [loadCirconscriptions]);

  // Gestion de la vue des détails
  const handleViewDetails = useCallback((codeCirconscription: string) => {
    // TODO: Implémenter l'ouverture du modal de détails si nécessaire
    // Pour l'instant, on peut juste afficher un toast
    toast.info("Détails", {
      description: `Détails de la circonscription ${codeCirconscription}`,
    });
  }, []);

  // Gestion de la publication (ADMIN/SADMIN uniquement)
  const handlePublish = useCallback(async (codeCirconscription: string) => {
    try {
      const result = await legislativesPublicationsApi.publishCirconscription(codeCirconscription);
      
      if (result?.success) {
        toast.success(result.message || "Circonscription publiée avec succès");
        // Recharger les données
        await loadCirconscriptions(currentPage);
      } else {
        toast.error(result?.message || "Erreur lors de la publication");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la publication";
      console.error("Erreur lors de la publication:", error);
      toast.error(errorMessage);
    }
  }, [currentPage, loadCirconscriptions]);

  // Gestion de l'annulation (ADMIN/SADMIN uniquement)
  const handleCancel = useCallback(async (codeCirconscription: string) => {
    try {
      const result = await legislativesPublicationsApi.cancelPublication(codeCirconscription);
      
      if (result?.success) {
        toast.success(result.message || "Publication annulée avec succès");
        // Recharger les données
        await loadCirconscriptions(currentPage);
      } else {
        toast.error(result?.message || "Erreur lors de l'annulation");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'annulation";
      console.error("Erreur lors de l'annulation:", error);
      toast.error(errorMessage);
    }
  }, [currentPage, loadCirconscriptions]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Circonscriptions
          </DialogTitle>
          <DialogDescription>
            {isManager 
              ? "Liste des circonscriptions qui vous sont assignées (tous les états de publication)"
              : "Liste de toutes les circonscriptions (tous les états de publication)"}
          </DialogDescription>
        </DialogHeader>

        {loading && circonscriptions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Chargement des circonscriptions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <CirconscriptionsTable
              circonscriptions={circonscriptions}
              loading={loading}
              isUser={isManager} // MANAGER = isUser (pas d'actions), ADMIN/SADMIN = false (avec actions)
              onViewDetails={handleViewDetails}
              onPublish={isAdmin ? handlePublish : undefined} // ADMIN/SADMIN peuvent publier/annuler
              onCancel={isAdmin ? handleCancel : undefined}
              pagination={{
                page: currentPage,
                limit: 10,
                total,
                totalPages,
                onPageChange: handlePageChange,
              }}
            />

            <div className="flex items-center justify-end">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

