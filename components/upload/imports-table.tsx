"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CelDetailsModal } from "./cel-details-modal";
import type { ImportsTableProps, ImportData } from "@/types/upload";

export function ImportsTable({
  imports,
  loading = false,
  onRefresh,
  onViewDetails,
  onDownload,
  onDelete,
  // ✅ NOUVEAU : Props de pagination
  total,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ImportsTableProps & {
  total?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedImportData, setSelectedImportData] =
    useState<ImportData | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      if (process.env.NODE_ENV === "development") {
        console.warn("🔍 [ImportsTable] Date invalide:", dateString);
      }
      return "Date invalide";
    }

    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = (action: () => void, importId: string) => {
    setSelectedImport(importId);
    action();
    // Reset après un délai pour permettre l'animation
    setTimeout(() => setSelectedImport(null), 1000);
  };

  const handleViewDetails = (importData: ImportData) => {
    setSelectedImportData(importData);
    setDetailsModalOpen(true);
    if (onViewDetails) {
      onViewDetails(importData);
    }
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedImportData(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imports</CardTitle>
          <CardDescription>Chargement des imports...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 border rounded"
              >
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/6"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Imports
            </CardTitle>
            <CardDescription>
              {imports.length} feuille{imports.length > 1 ? "s" : ""} Excel au
              total
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {imports.length === 0 ? (
          <div className="text-center py-8">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucun import trouvé</h3>
            <p className="text-muted-foreground">
              Aucun fichier n&apos;a été importé pour le moment.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CEL</TableHead>
                <TableHead>Circonscription</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Bureaux</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.map((importData, index) => (
                <TableRow
                  key={
                    importData.id ||
                    `import-${index}-${importData.codeCellule}-${importData.dateDernierImport}`
                  }
                  className={`${
                    selectedImport === importData.id ? "bg-muted/50" : ""
                  }`}
                >
                  {/* CEL */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">
                          {importData.libelleCellule}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {importData.codeCellule} • {importData.nomFichier}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Circonscription */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {importData.libelleCirconscription}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {importData.codeCirconscription}
                      </span>
                    </div>
                  </TableCell>

                  {/* Utilisateur */}
                  <TableCell>
                    {importData.utilisateurAssign ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {importData.utilisateurAssign.firstName}{" "}
                          {importData.utilisateurAssign.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {importData.utilisateurAssign.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(importData.dateDernierImport)}
                    </div>
                  </TableCell>

                  {/* Nombre de bureaux */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span>{importData.nombreBureauxVote || 0}</span>
                      {importData.nombreBureauxVote === 0 && (
                        <span className="text-yellow-600 text-xs">
                          (aucune donnée)
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(
                              () => handleViewDetails(importData),
                              importData.id || ""
                            )
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </DropdownMenuItem>

                        {onDownload && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(
                                () => onDownload(importData),
                                importData.id || ""
                              )
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {onDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleAction(
                                () => onDelete(importData),
                                importData.id || ""
                              )
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal de détails CEL */}
      <CelDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleCloseDetails}
        importData={selectedImportData}
      />

      {/* ✅ NOUVEAU : Contrôles de pagination */}
      {total !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Affichage de <span className="font-medium">{imports.length}</span>{" "}
            sur <span className="font-medium">{total}</span> import
            {total > 1 ? "s" : ""}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
