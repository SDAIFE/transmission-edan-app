"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Composants
import { ImportFilters } from "./import-filters";
import { ImportsTable } from "./imports-table";

// API et types
import { uploadApi } from "@/lib/api";
import type {
  ImportData,
  ImportFilters as ImportFiltersType,
} from "@/types/upload";

interface ImportsSectionProps {
  imports?: ImportData[];
  availableCels: { codeCellule: string; libelleCellule: string }[];
  onRefresh?: () => void;
  onFiltersChange?: (filters: ImportFiltersType) => void;
  loading?: boolean;
  // ✅ NOUVEAU : Props de pagination
  total?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ImportsSection({
  imports: propsImports,
  availableCels,
  onRefresh,
  onFiltersChange,
  loading: propsLoading,
  // ✅ NOUVEAU : Props de pagination
  total,
  currentPage,
  totalPages,
  onPageChange,
}: ImportsSectionProps) {
  // États pour les imports
  const [imports, setImports] = useState<ImportData[]>([]);
  const [filters, setFilters] = useState<ImportFiltersType>({
    page: 1,
    limit: 10,
  });
  const [importsLoading, setImportsLoading] = useState(false);

  // Fonction pour mapper les données du backend vers notre interface
  const mapBackendDataToFrontend = (
    backendData: any,
    index: number
  ): ImportData => {
    return {
      id: backendData.id || `import-${index}-${backendData.codeCellule}`,
      codeCellule: backendData.codeCellule || "",
      libelleCellule: backendData.libelleCellule || "",
      codeCirconscription: backendData.codeCirconscription || "",
      libelleCirconscription: backendData.libelleCirconscription || "",
      nomFichier: backendData.nomFichier || "",
      nombreBureauxVote: backendData.nombreBureauxVote || 0,
      dateDernierImport:
        backendData.dateDernierImport || new Date().toISOString(),
      utilisateurAssign: backendData.utilisateurAssign
        ? {
            id: backendData.utilisateurAssign.id || "",
            firstName: backendData.utilisateurAssign.firstName || "",
            lastName: backendData.utilisateurAssign.lastName || "",
            email: backendData.utilisateurAssign.email || "",
          }
        : undefined,
    };
  };

  // Charger les imports avec filtres - sans useCallback
  const loadImports = async (newFilters: ImportFiltersType) => {
    try {
      setImportsLoading(true);
      const response = await uploadApi.getImports(newFilters);

      if (response === null) {
        console.warn(
          "⚠️ [ImportsSection] Imports non disponibles (permissions insuffisantes)"
        );
        setImports([]);
        return;
      }

      // Mapper les données du backend vers notre interface
      const mappedImports = response.imports.map((backendData, index) =>
        mapBackendDataToFrontend(backendData, index)
      );
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("📋 [ImportsSection] Imports mappés:", mappedImports);
      }
      setImports(mappedImports);
    } catch (error: unknown) {
      console.error("Erreur lors du chargement des imports:", error);
      toast.error("Erreur lors du chargement des imports");
    } finally {
      setImportsLoading(false);
    }
  };

  // Utiliser les imports passés en props ou charger localement
  useEffect(() => {
    if (propsImports) {
      // Utiliser les imports passés en props
      if (process.env.NODE_ENV === "development") {
        console.log("📋 [ImportsSection] Utilisation des imports en props:", {
          count: propsImports.length,
          imports: propsImports.map((i) => ({
            id: i.id,
            codeCellule: i.codeCellule,
            nomFichier: i.nomFichier,
          })),
        });
      }
      setImports(propsImports);
    } else {
      // Charger les imports localement si pas fournis en props
      if (process.env.NODE_ENV === "development") {
        console.log("📋 [ImportsSection] Chargement local des imports...");
      }
      loadImports({ page: 1, limit: 10 });
    }
  }, [propsImports]); // Seulement dépendre de propsImports pour éviter la boucle

  // Synchroniser les filtres avec les props
  useEffect(() => {
    if (propsImports) {
      // Si on reçoit des imports en props, on n'a pas besoin de gérer les filtres localement
      // Les filtres sont gérés par le parent (UploadPageContent)
      return;
    }
  }, [propsImports]);

  // Gestion des changements de filtres
  const handleFiltersChange = (newFilters: ImportFiltersType) => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [ImportsSection] Changement de filtres:", newFilters);
    }

    // Toujours mettre à jour les filtres locaux
    setFilters(newFilters);

    // Si on a une fonction onFiltersChange du parent, l'utiliser (mode props)
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    } else {
      // Mode autonome : charger localement
      loadImports(newFilters);
    }
  };

  // Actions sur les imports
  const handleViewDetails = (importData: ImportData) => {
    // TODO: Implémenter la modal de détails
    if (process.env.NODE_ENV === "development") {
      console.log("Voir détails:", importData);
    }
  };

  const handleDownload = async (importData: ImportData) => {
    if (!importData.id) {
      toast.error("ID d'import manquant");
      return;
    }
    try {
      const blob = await uploadApi.downloadImport(importData.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = importData.nomFichier;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: unknown) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleDelete = async (importData: ImportData) => {
    if (!importData.id) {
      toast.error("ID d'import manquant");
      return;
    }
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer l'import "${importData.nomFichier}" ?`
      )
    ) {
      try {
        await uploadApi.deleteImport(importData.id);
        toast.success("Import supprimé avec succès");
        onRefresh?.();
      } catch (error: unknown) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleRefresh = () => {
    // Si onRefresh est fourni (depuis UploadPageContent), l'utiliser
    // Sinon, recharger seulement les imports locaux
    if (onRefresh) {
      console.log("🔄 [ImportsSection] Rafraîchissement via onRefresh...");
      onRefresh();
    } else {
      console.log("🔄 [ImportsSection] Rafraîchissement local des imports...");
      loadImports(filters);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📋 Imports</h2>

      {/* Filtres */}
      <ImportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableCels={availableCels}
        imports={imports}
        loading={propsLoading || importsLoading}
      />

      {/* Tableau des imports */}
      <ImportsTable
        imports={imports}
        loading={propsLoading || importsLoading}
        onRefresh={handleRefresh}
        onViewDetails={handleViewDetails}
        onDownload={handleDownload}
        onDelete={handleDelete}
        // ✅ NOUVEAU : Props de pagination
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
