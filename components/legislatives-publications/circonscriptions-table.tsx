"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
  Calendar,
  Hash,
  AlertCircle,
} from "lucide-react";
import type {
  CirconscriptionsTableProps,
  PublicationStatus,
} from "@/types/legislatives-publications";

export function CirconscriptionsTable({
  circonscriptions = [],
  loading = false,
  isUser = false,
  onViewDetails,
  onPublish,
  onCancel,
  pagination,
}: CirconscriptionsTableProps) {
  const [selectedCirconscription, setSelectedCirconscription] = useState<
    string | null
  >(null);

  // Protection contre undefined
  const safeCirconscriptions = circonscriptions || [];

  // Calculer les statistiques détaillées
  const stats = useMemo(() => {
    const published = safeCirconscriptions.filter(
      (circ) => circ.publicationStatus === "1"
    ).length;

    const readyToPublish = safeCirconscriptions.filter(
      (circ) =>
        circ.importedCels === circ.totalCels &&
        circ.totalCels > 0 &&
        circ.publicationStatus !== "1" &&
        circ.publicationStatus !== "C"
    ).length;

    const notPublished = safeCirconscriptions.filter(
      (circ) =>
        !(
          circ.importedCels === circ.totalCels &&
          circ.totalCels > 0 &&
          circ.publicationStatus !== "1" &&
          circ.publicationStatus !== "C"
        ) &&
        circ.publicationStatus !== "1" &&
        circ.publicationStatus !== "C"
    ).length;

    return {
      published,
      readyToPublish,
      notPublished,
      total: safeCirconscriptions.length,
    };
  }, [safeCirconscriptions]);

  const formatDate = (dateString: Date | string) => {
    if (!dateString) return "Date inconnue";

    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
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

  const getStatusBadge = (status: PublicationStatus) => {
    switch (status) {
      case "1":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Publié
          </Badge>
        );
      case "C":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Annulé
          </Badge>
        );
      case "0":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <RefreshCw className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  // Vérifier si une circonscription peut être publiée
  // Note: Les circonscriptions annulées (statut "C") peuvent être republiées
  // si toutes leurs CELs sont importées. Lors de l'annulation, le backend
  // doit mettre ETA_RESULTAT_CEL à "I" (Importé) et non "CANCELLED"
  // pour permettre la republication.
  const canPublish = (circ: (typeof circonscriptions)[0]) => {
    return (
      circ.importedCels === circ.totalCels &&
      circ.totalCels > 0 &&
      circ.publicationStatus !== "1" // Permet la republication des circonscriptions annulées (statut "C")
    );
  };

  // Vérifier si une circonscription est publiée
  const isPublished = (circ: (typeof circonscriptions)[0]) => {
    return circ.publicationStatus === "1";
  };

  // Couleur de fond selon l'état de la circonscription
  const getCirconscriptionRowClass = (circ: (typeof circonscriptions)[0]) => {
    // Priorité à la sélection
    if (selectedCirconscription === circ.codeCirconscription) {
      return "bg-muted/50";
    }

    // Orange atténué avec animation : Prête à publier (toutes CELs importées mais pas encore publiée)
    const isReadyToPublish =
      circ.importedCels === circ.totalCels &&
      circ.totalCels > 0 &&
      circ.publicationStatus !== "1" &&
      circ.publicationStatus !== "C";

    if (isReadyToPublish) {
      return "bg-orange-50/60 hover:bg-orange-50/80 animate-pulse-subtle transition-colors";
    }

    // Vert atténué : Publiée
    if (circ.publicationStatus === "1") {
      return "bg-green-50/50 hover:bg-green-50/70 transition-colors";
    }

    // Rouge atténué : Annulée
    if (circ.publicationStatus === "C") {
      return "bg-red-50/50 hover:bg-red-50/70 transition-colors";
    }

    // Par défaut, pas de couleur spéciale
    return "";
  };

  const handleAction = (action: () => void, codeCirconscription: string) => {
    setSelectedCirconscription(codeCirconscription);
    action();
    // Reset après un délai pour permettre l'animation
    setTimeout(() => setSelectedCirconscription(null), 1000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Circonscriptions</CardTitle>
          <CardDescription>
            Chargement des circonscriptions&hellip;
          </CardDescription>
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
              <Building2 className="h-5 w-5" />
              Circonscriptions
            </CardTitle>
            <CardDescription className="space-y-2">
              <div>
                {safeCirconscriptions.length} circonscription
                {safeCirconscriptions.length > 1 ? "s" : ""} au total
                {pagination && pagination.totalPages > 1
                  ? ` - Page ${pagination.page} sur ${pagination.totalPages}`
                  : ""}
              </div>
              {stats.total > 0 && (
                <div className="flex items-center gap-4 flex-wrap text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">
                      Publiées:{" "}
                      <span className="font-semibold text-green-700">
                        {stats.published}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <span className="text-muted-foreground">
                      En attente:{" "}
                      <span className="font-semibold text-orange-700">
                        {stats.readyToPublish}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    <span className="text-muted-foreground">
                      Non publiées:{" "}
                      <span className="font-semibold text-gray-700">
                        {stats.notPublished}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {safeCirconscriptions.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              Aucune circonscription trouvée
            </h3>
            <p className="text-muted-foreground">
              Aucune circonscription n&apos;a été trouvée pour le moment.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-100 dark:bg-gray-800 text-black">
                  Circonscription
                </TableHead>
                <TableHead className="bg-gray-100 dark:bg-gray-800 text-black">
                  Total CELs
                </TableHead>
                <TableHead className="bg-gray-100 dark:bg-gray-800 text-black">
                  Importées
                </TableHead>
                <TableHead className="bg-gray-100 dark:bg-gray-800 text-black">
                  En Attente
                </TableHead>
                <TableHead className="bg-gray-100 dark:bg-gray-800 text-black">
                  Statut
                </TableHead>
                <TableHead className="bg-gray-100 dark:bg-gray-800 text-black">
                  Dernière MAJ
                </TableHead>
                <TableHead className="w-[50px] bg-gray-100 dark:bg-gray-800 text-black">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeCirconscriptions.map((circ) => {
                const progressPercentage =
                  circ.totalCels > 0
                    ? Math.round((circ.importedCels / circ.totalCels) * 100)
                    : 0;
                const isComplete = canPublish(circ);

                return (
                  <TableRow
                    key={circ.codeCirconscription}
                    className={getCirconscriptionRowClass(circ)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">
                            {circ.libelleCirconscription || "Sans libellé"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            <span>Code: {circ.codeCirconscription}</span>
                            {circ.nombreSieges && (
                              <Badge variant="outline" className="text-xs">
                                {circ.nombreSieges} siège
                                {circ.nombreSieges > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span>{circ.totalCels}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>{circ.importedCels}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <RefreshCw
                          className={`h-3 w-3 ${
                            circ.pendingCels > 0
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        />
                        <span
                          className={
                            circ.pendingCels > 0
                              ? "text-yellow-600"
                              : "text-green-600"
                          }
                        >
                          {circ.pendingCels}
                        </span>
                      </div>
                      {/* Barre de progression */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isComplete
                              ? "bg-green-600"
                              : progressPercentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {progressPercentage}%
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(circ.publicationStatus)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(circ.lastUpdate)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {onViewDetails && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(
                                  () => onViewDetails(circ.codeCirconscription),
                                  circ.codeCirconscription
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                          )}
                          {/* Actions de publication/annulation (ADMIN/SADMIN uniquement) */}
                          {!isUser && (
                            <>
                              {canPublish(circ) &&
                                !isPublished(circ) &&
                                onPublish && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAction(
                                        () =>
                                          onPublish(circ.codeCirconscription),
                                        circ.codeCirconscription
                                      )
                                    }
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Publier
                                  </DropdownMenuItem>
                                )}
                              {isPublished(circ) && onCancel && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleAction(
                                      () => onCancel(circ.codeCirconscription),
                                      circ.codeCirconscription
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Annuler la publication
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {!canPublish(circ) && !isPublished(circ) && (
                            <DropdownMenuItem disabled>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              CELs incomplètes
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages} (
              {pagination.total} circonscription
              {pagination.total > 1 ? "s" : ""})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
