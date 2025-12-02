"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSimpleLists } from "@/hooks/useSimpleLists";
import { LegislativesUploadSection } from "./legislatives-upload-section";
import { CelExcelDataTable } from "./cel-excel-data-table";
import type { LegislativesUploadResponse } from "@/types/legislatives";

/**
 * Composant principal pour la page des législatives
 *
 * Caractéristiques :
 * - Onglets pour upload et visualisation
 * - Sélection de CEL pour la visualisation
 * - Gestion des états et erreurs
 */
export function LegislativesPageContent() {
  const [activeTab, setActiveTab] = useState<"upload" | "view">("upload");
  const [selectedCelForView, setSelectedCelForView] = useState<string>("");
  const { cels, loading: celsLoading } = useSimpleLists();

  const handleUploadSuccess = (result: LegislativesUploadResponse) => {
    // Optionnel : basculer vers l'onglet de visualisation après un upload réussi
    // setActiveTab('view');
    // setSelectedCelForView(result.codCel);
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "upload" | "view")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload de fichier Excel</TabsTrigger>
          <TabsTrigger value="view">Visualisation des données</TabsTrigger>
        </TabsList>

        {/* Onglet Upload */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload de fichier Excel Législatives</CardTitle>
              <CardDescription>
                Importez un fichier Excel (.xlsm ou .xlsx) contenant les
                résultats électoraux pour une CEL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegislativesUploadSection
                onUploadSuccess={handleUploadSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Visualisation */}
        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualisation des données CEL</CardTitle>
              <CardDescription>
                Sélectionnez une CEL pour afficher ses données au format Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cel-select-view">Sélectionner une CEL</Label>
                <Select
                  value={selectedCelForView}
                  onValueChange={setSelectedCelForView}
                  disabled={celsLoading}
                >
                  <SelectTrigger id="cel-select-view">
                    <SelectValue placeholder="Sélectionner une CEL" />
                  </SelectTrigger>
                  <SelectContent>
                    {cels.map((cel) => (
                      <SelectItem key={cel.codeCellule} value={cel.codeCellule}>
                        {cel.codeCellule} - {cel.libelleCellule}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCelForView && (
                <CelExcelDataTable codCel={selectedCelForView} />
              )}

              {!selectedCelForView && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Sélectionnez une CEL pour afficher ses données</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
