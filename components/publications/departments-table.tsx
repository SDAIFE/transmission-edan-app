"use client";

import { useState } from "react";
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
} from "lucide-react";
import { DepartmentDetailsModal } from "./department-details-modal";
import type {
  DepartmentsTableProps,
  DepartmentData,
  PublicationStatus,
} from "@/types/publications";

export function DepartmentsTable({
  departments,
  loading = false,
  onRefresh,
  onPublish,
  onCancel,
  onViewDetails,
  totalPages = 1,
  currentPage = 1,
  onPageChange: _onPageChange,
  filters: _filters,
  onFiltersChange: _onFiltersChange,
  isUser = false,
}: DepartmentsTableProps) {
  // const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null); // ❌ NON UTILISÉ
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDepartmentData, setSelectedDepartmentData] =
    useState<DepartmentData | null>(null);

  // Adaptation des termes selon le rôle
  // const publishAction = isUser ? 'Consolider' : 'Publier'; // ❌ NON UTILISÉ
  // const publishActionLower = isUser ? 'consolider' : 'publier'; // ❌ NON UTILISÉ
  // const publishActionPast = isUser ? 'consolidé' : 'publié'; // ❌ NON UTILISÉ
  const publishActionPastFeminine = isUser ? "consolidée" : "publiée";
  // const publishActionGerund = isUser ? 'consolidation' : 'publication'; // ❌ NON UTILISÉ

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";

    const date = new Date(dateString);
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
      case "PUBLISHED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {publishActionPastFeminine}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Annulée
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <RefreshCw className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // const handleAction = (action: () => void, departmentId: string) => { // ❌ NON UTILISÉ
  //   setSelectedDepartment(departmentId);
  //   action();
  //   // Reset après un délai pour permettre l'animation
  //   setTimeout(() => setSelectedDepartment(null), 1000);
  // };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedDepartmentData(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Départements</CardTitle>
          <CardDescription>Chargement des départements&hellip;</CardDescription>
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
              Départements
            </CardTitle>
            <CardDescription>
              {departments.length} département
              {departments.length > 1 ? "s" : ""} au total
              {totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
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
        {departments.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucun département trouvé</h3>
            <p className="text-muted-foreground">
              Aucun département n&apos;a été trouvé pour le moment.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Département</TableHead>
                <TableHead>Total CELs</TableHead>
                <TableHead>Importées</TableHead>
                <TableHead>En Attente</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière MAJ</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow
                  key={department.id}
                  // className={selectedDepartment === department.id ? 'bg-muted/50' : ''} // ❌ NON UTILISÉ - selectedDepartment commenté
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">
                          {department.libelleDepartement}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {department.codeDepartement}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span>{department.totalCels}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>{department.importedCels}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <RefreshCw
                        className={`h-3 w-3 ${
                          department.pendingCels > 0
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      />
                      <span
                        className={
                          department.pendingCels > 0
                            ? "text-yellow-600"
                            : "text-green-600"
                        }
                      >
                        {department.pendingCels}
                      </span>
                      {department.pendingCels === 0 && (
                        <span className="text-xs text-green-600 ml-1">✓</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(department.publicationStatus)}
                      {department.publicationStatus !== "PUBLISHED" &&
                        department.pendingCels > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs text-orange-600 border-orange-200"
                          >
                            {department.pendingCels} CEL(s) en attente
                          </Badge>
                        )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(department.lastUpdate)}
                    </div>
                  </TableCell>

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
                          onClick={() => {
                            // if (process.env.NODE_ENV === 'development') {
                            //   console.log('👁️ [DepartmentsTable] Voir détails:', department);
                            // }
                            setSelectedDepartmentData(department);
                            setDetailsModalOpen(true);
                            if (onViewDetails) {
                              onViewDetails(department);
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </DropdownMenuItem>

                        {/* Actions de publication retirées pour SADMIN/ADMIN - maintenant dans le modal */}
                        {/* Actions de consolidation retirées pour USER - remplacées par import fichier signé */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal de détails de département */}
      <DepartmentDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleCloseDetails}
        departmentData={selectedDepartmentData}
        onPublish={onPublish}
        onCancel={onCancel}
        isUser={isUser}
      />
    </Card>
  );
}
