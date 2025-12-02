"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

// Hooks et types
import { useCelExcelData } from "@/hooks/use-legislatives";
import type { CelExcelDataTableProps } from "@/types/legislatives";
import { CEL_FIXED_COLUMNS } from "@/types/legislatives";

/**
 * Composant pour afficher les données CEL au format Excel
 *
 * Caractéristiques :
 * - Affichage des données dans un tableau
 * - Colonnes fixes + colonnes dynamiques (candidats)
 * - Export vers Excel
 * - Gestion des états de chargement et d'erreur
 */
export function CelExcelDataTable({
  codCel,
  onExport,
}: CelExcelDataTableProps) {
  const { data, loading, error, refetch } = useCelExcelData(codCel);
  const [exporting, setExporting] = useState(false);

  // Fonction d'export vers Excel
  const handleExport = async () => {
    if (!data) return;

    setExporting(true);
    try {
      // Préparer les en-têtes
      const headers = [
        ...CEL_FIXED_COLUMNS,
        ...data.candidats.map((c) => c.numDos), // Colonnes candidats
      ];

      // Préparer les lignes de données
      const rows = data.data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return value !== undefined && value !== null ? value : 0;
        })
      );

      // Créer le workbook
      const wb = XLSX.utils.book_new();

      // Créer la feuille avec les données
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Ajouter une ligne d'en-tête avec les noms des candidats (optionnel)
      // On peut ajouter une ligne supplémentaire pour les noms complets
      const candidateNamesRow = [
        ...CEL_FIXED_COLUMNS.map(() => ""),
        ...data.candidats.map((c) => c.nom),
      ];
      XLSX.utils.sheet_add_aoa(ws, [candidateNamesRow], { origin: 1 });

      // Ajuster la largeur des colonnes
      const colWidths = headers.map((_, index) => {
        if (index < CEL_FIXED_COLUMNS.length) {
          return { wch: 12 }; // Colonnes fixes
        }
        return { wch: 15 }; // Colonnes candidats
      });
      ws["!cols"] = colWidths;

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(wb, ws, data.libCel || data.codCel);

      // Télécharger le fichier
      const fileName = `${data.codCel}_${data.libCel || "data"}.xlsx`;
      XLSX.writeFile(wb, fileName);

      onExport?.();
    } catch (err) {
      console.error("❌ [CelExcelDataTable] Erreur lors de l'export:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Chargement des données...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune donnée disponible pour cette CEL
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Colonnes dynamiques (candidats)
  const candidateColumns = data.candidats.map((c) => c.numDos);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {data.libCel} ({data.codCel})
            </CardTitle>
            <CardDescription>
              Circonscription : {data.codCe} - {data.libCe || "N/A"}
            </CardDescription>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter vers Excel
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span>
            <strong>{data.data.length}</strong> bureaux de vote
          </span>
          <span>
            <strong>{data.candidats.length}</strong> candidats
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Colonnes fixes */}
                {CEL_FIXED_COLUMNS.map((col) => (
                  <TableHead key={col} className="whitespace-nowrap">
                    {col}
                  </TableHead>
                ))}
                {/* Colonnes candidats */}
                {data.candidats.map((candidat) => (
                  <TableHead
                    key={candidat.numDos}
                    className="whitespace-nowrap"
                    title={candidat.nom}
                  >
                    {candidat.numDos}
                  </TableHead>
                ))}
              </TableRow>
              {/* Ligne d'en-tête avec noms des candidats */}
              <TableRow>
                {CEL_FIXED_COLUMNS.map((col) => (
                  <TableHead
                    key={col}
                    className="text-xs text-muted-foreground"
                  ></TableHead>
                ))}
                {data.candidats.map((candidat) => (
                  <TableHead
                    key={candidat.numDos}
                    className="text-xs text-muted-foreground font-normal"
                  >
                    {candidat.nom}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row, index) => (
                <TableRow key={index}>
                  {/* Colonnes fixes */}
                  {CEL_FIXED_COLUMNS.map((col) => (
                    <TableCell key={col} className="whitespace-nowrap">
                      {row[col]}
                    </TableCell>
                  ))}
                  {/* Colonnes candidats */}
                  {candidateColumns.map((numDos) => (
                    <TableCell key={numDos} className="text-center">
                      {row[numDos] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
