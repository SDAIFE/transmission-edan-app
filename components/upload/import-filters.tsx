"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Filter, X } from "lucide-react";
import { ImportStatus } from "@/types/upload";
import { useAuth } from "@/contexts/AuthContext";
import type { ImportFiltersProps, ImportData } from "@/types/upload";

interface ExtendedImportFiltersProps extends ImportFiltersProps {
  imports?: ImportData[]; // Pour extraire les circonscriptions réellement présentes
}

export function ImportFilters({
  filters,
  onFiltersChange,
  availableCels,
  imports = [],
}: ExtendedImportFiltersProps) {
  // Récupérer l'utilisateur connecté (DOIT être déclaré AVANT tout useEffect qui l'utilise)
  const { user } = useAuth();

  // ✅ CORRECTION : Gérer les CELs séparées par des virgules
  const [selectedCels, setSelectedCels] = useState<string[]>(() => {
    if (filters.codeCellule) {
      // Si codeCellule contient des virgules, splitter
      return filters.codeCellule.includes(",")
        ? filters.codeCellule
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : [filters.codeCellule];
    }
    return [];
  });
  const [selectedStatus, setSelectedStatus] = useState<ImportStatus | "all">(
    filters.statut || "all"
  );
  const [selectedCirconscription, setSelectedCirconscription] =
    useState<string>(filters.codeCirconscription || "all");

  // Ref pour éviter les appels répétés
  const isInitialMount = useRef(true);

  // ✅ DEBUG : Logs pour comprendre le timing du chargement (APRÈS la déclaration de user)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("📊 [ImportFilters] RENDER - État actuel:", {
        availableCelsCount: availableCels.length,
        importsCount: imports.length,
        userRole: user?.role?.code,
        userCellulesCount: user?.cellules?.length || 0,
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    availableCels.length,
    imports.length,
    user?.role?.code,
    user?.cellules?.length,
  ]);

  // ✅ EXPLICATION : availableCels est déjà filtré par le parent (UploadPageContent)
  // selon le rôle de l'utilisateur. On n'a donc pas besoin de refiltrer ici.
  // On utilise directement availableCels comme baseCelsFiltered.
  //
  // Note : Si availableCels est vide au premier chargement, c'est normal car :
  // 1. Les données sont chargées de manière asynchrone
  // 2. Le parent filtre les CELs dans un useEffect qui attend user et allCels
  // 3. Une fois les données chargées, availableCels sera mis à jour automatiquement

  // ✅ SIMPLIFICATION : Utiliser directement availableCels (déjà filtré par le parent)
  const baseCelsFiltered = availableCels;

  // ✨ Filtrer les CELs selon la circonscription sélectionnée
  const filteredCels = useMemo(() => {
    let celsToFilter = baseCelsFiltered;

    // Si une circonscription est sélectionnée, filtrer par circonscription
    if (selectedCirconscription !== "all") {
      const celsInCirconscription = new Set<string>();

      imports.forEach((importData) => {
        if (importData.codeCirconscription === selectedCirconscription) {
          celsInCirconscription.add(importData.codeCellule);
        }
      });

      celsToFilter = celsToFilter.filter((cel) =>
        celsInCirconscription.has(cel.codeCellule)
      );
    }

    return celsToFilter;
  }, [baseCelsFiltered, selectedCirconscription, imports]);

  // ✅ CORRECTION : Utiliser un état local pour forcer le recalcul des circonscriptions
  const [availableCirconscriptions, setAvailableCirconscriptions] = useState<
    { codeCirconscription: string; libelleCirconscription: string }[]
  >([]);

  // ✅ CORRECTION : Créer une clé de dépendance stable pour les imports
  // ✅ CORRECTION : Utiliser useMemo pour garantir la réactivité
  const importsKey = useMemo(() => {
    if (imports.length === 0) return "";
    return imports
      .map((i) => `${i.codeCellule}-${i.codeCirconscription || ""}`)
      .sort()
      .join(",");
  }, [imports]);

  // ✅ CORRECTION : Créer une clé de dépendance stable pour user.cellules
  // ✅ CORRECTION : Utiliser useMemo pour garantir la réactivité
  const userCelCodesKey = useMemo(() => {
    if (!user?.cellules || user.cellules.length === 0) return "";
    return user.cellules
      .map((c) => c.COD_CEL)
      .sort()
      .join(",");
  }, [user?.cellules]);

  // ✅ CORRECTION : useEffect pour recalculer availableCirconscriptions quand user ou imports changent
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 [ImportFilters] Recalcul availableCirconscriptions:", {
        userRole: user?.role?.code,
        userCellulesCount: user?.cellules?.length || 0,
        importsCount: imports.length,
        hasUser: !!user,
        importsKey: importsKey.substring(0, 50), // Log partiel pour debug
      });
    }

    // ✅ CORRECTION : Si pas d'imports, retourner vide immédiatement
    if (imports.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ [ImportFilters] Pas d'imports disponibles");
      }
      setAvailableCirconscriptions([]);
      return;
    }

    const uniqueCirconscriptions = new Map<string, string>();

    if (user?.role?.code === "USER") {
      // Pour USER : Uniquement les circonscriptions des imports de ses CELs
      const userCelCodes = user.cellules?.map((cel) => cel.COD_CEL) || [];

      if (userCelCodes.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.log("⚠️ [ImportFilters] USER sans CELs attribuées");
        }
        setAvailableCirconscriptions([]);
        return;
      }

      imports.forEach((importData) => {
        // Vérifier si cet import appartient à une CEL de l'utilisateur
        if (
          userCelCodes.includes(importData.codeCellule) &&
          importData.codeCirconscription &&
          importData.libelleCirconscription
        ) {
          uniqueCirconscriptions.set(
            importData.codeCirconscription,
            importData.libelleCirconscription
          );
        }
      });
    } else {
      // Pour ADMIN et SADMIN : Toutes les circonscriptions des imports
      imports.forEach((importData) => {
        if (
          importData.codeCirconscription &&
          importData.libelleCirconscription
        ) {
          uniqueCirconscriptions.set(
            importData.codeCirconscription,
            importData.libelleCirconscription
          );
        }
      });
    }

    // Convertir en tableau et trier par libellé
    const result = Array.from(uniqueCirconscriptions.entries())
      .map(([codeCirconscription, libelleCirconscription]) => ({
        codeCirconscription,
        libelleCirconscription,
      }))
      .sort((a, b) =>
        a.libelleCirconscription.localeCompare(b.libelleCirconscription)
      );

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [ImportFilters] Circonscriptions calculées:", {
        count: result.length,
        circonscriptions: result.map((c) => c.libelleCirconscription),
      });
    }

    setAvailableCirconscriptions(result);
  }, [user, user?.role?.code, userCelCodesKey, imports, importsKey]);

  // ✨ Décocher les CELs qui ne sont plus dans la circonscription filtrée
  useEffect(() => {
    if (selectedCels.length > 0 && selectedCirconscription !== "all") {
      // Vérifier si toutes les CELs sélectionnées sont toujours dans les CELs filtrées
      const validCelCodes = new Set(filteredCels.map((cel) => cel.codeCellule));
      const invalidSelectedCels = selectedCels.filter(
        (celCode) => !validCelCodes.has(celCode)
      );

      if (invalidSelectedCels.length > 0) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log(
            "🔄 [ImportFilters] Désélection des CELs hors circonscription:",
            {
              invalidCels: invalidSelectedCels,
            }
          );
        }

        // ✅ Utiliser une fonction de mise à jour pour éviter la dépendance
        setSelectedCels((prev) => {
          const newCels = prev.filter((celCode) => validCelCodes.has(celCode));
          // Ne mettre à jour que si quelque chose a changé
          if (newCels.length !== prev.length) {
            return newCels;
          }
          return prev;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCirconscription, filteredCels]); // selectedCels retiré intentionnellement car on utilise setSelectedCels avec fonction de mise à jour

  // ✅ CORRECTION : Mémoriser onFiltersChange avec useCallback ou utiliser une ref
  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  // Appliquer les filtres avec debounce pour la recherche
  useEffect(() => {
    // Éviter l'appel au montage initial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const newFilters = {
        page: 1, // Reset à la première page lors du filtrage
        limit: 10, // Valeur fixe pour éviter les dépendances
        codeCellule:
          selectedCels.length > 0 ? selectedCels.join(",") : undefined, // CELs sélectionnées
        statut: selectedStatus === "all" ? undefined : selectedStatus,
        codeCirconscription:
          selectedCirconscription === "all"
            ? undefined
            : selectedCirconscription,
      };

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("🔍 [ImportFilters] Application des filtres:", {
          selectedCels,
          selectedStatus,
          selectedCirconscription,
          newFilters,
          filteredCelsCount: filteredCels.length,
        });
      }

      // ✅ CORRECTION : Utiliser la ref pour éviter la dépendance
      onFiltersChangeRef.current?.(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    selectedCels,
    selectedStatus,
    selectedCirconscription,
    filteredCels.length,
    // ✅ CORRECTION : Retirer onFiltersChange des dépendances, utiliser la ref
  ]);

  const clearFilters = () => {
    setSelectedCels([]);
    setSelectedStatus("all");
    setSelectedCirconscription("all");
    onFiltersChange({
      page: 1,
      limit: 10,
    });
  };

  const hasActiveFilters =
    selectedCels.length > 0 ||
    selectedStatus !== "all" ||
    selectedCirconscription !== "all";

  const celOptions: MultiSelectOption[] = filteredCels.map((cel) => ({
    value: cel.codeCellule,
    label: cel.libelleCellule,
    description: `Code: ${cel.codeCellule}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ✨ Filtre par Circonscription */}
          <div className="space-y-2">
            <Label htmlFor="circonscription-filter">Circonscription</Label>
            <Select
              value={selectedCirconscription}
              onValueChange={setSelectedCirconscription}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les circonscriptions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les circonscriptions</SelectItem>
                {availableCirconscriptions.map((circonscription) => (
                  <SelectItem
                    key={circonscription.codeCirconscription}
                    value={circonscription.codeCirconscription}
                  >
                    {circonscription.libelleCirconscription}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par CEL */}
          <div className="space-y-2">
            <Label htmlFor="cel-filter">
              Commission Électorale
              {selectedCirconscription !== "all" && (
                <span className="ml-1 text-xs text-blue-600">
                  (filtré par circonscription)
                </span>
              )}
            </Label>
            <MultiSelect
              options={celOptions}
              selected={selectedCels}
              onChange={setSelectedCels}
              placeholder={
                selectedCirconscription !== "all"
                  ? "CELs de la circonscription sélectionnée..."
                  : "Sélectionner les CELs..."
              }
              searchPlaceholder="Rechercher une CEL..."
              emptyText={
                selectedCirconscription !== "all"
                  ? "Aucune CEL dans cette circonscription."
                  : user?.role?.code === "USER"
                  ? "Aucune CEL attribuée à votre compte."
                  : "Aucune CEL trouvée."
              }
              maxDisplay={2}
            />

            {/* Message informatif */}
            <div className="text-xs text-muted-foreground">
              {user?.role?.code === "USER" ? (
                // Message pour USER
                filteredCels.length > 0 ? (
                  <span className="text-blue-600">
                    📋 {filteredCels.length} CEL
                    {filteredCels.length > 1 ? "s" : ""}
                    {selectedCirconscription !== "all"
                      ? " dans cette circonscription"
                      : " attribuée" +
                        (filteredCels.length > 1 ? "s" : "") +
                        " à votre compte"}
                  </span>
                ) : (
                  <span className="text-orange-600">
                    {selectedCirconscription !== "all"
                      ? "⚠️ Aucune CEL attribuée dans cette circonscription."
                      : "⚠️ Aucune CEL n'est attribuée à votre compte. Contactez votre administrateur."}
                  </span>
                )
              ) : (
                // Message pour ADMIN/SADMIN
                selectedCirconscription !== "all" && (
                  <span className="text-blue-600">
                    📋 {filteredCels.length} CEL
                    {filteredCels.length > 1 ? "s" : ""} dans cette
                    circonscription
                  </span>
                )
              )}
            </div>
          </div>

          {/* Filtre par statut */}
          {/* <div className="space-y-2">
            <Label htmlFor="status-filter">Statut</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as ImportStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value={ImportStatus.N}>En attente</SelectItem>
                <SelectItem value={ImportStatus.I}>Importé</SelectItem>
                <SelectItem value={ImportStatus.P}>Publié</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Filtres actifs:
                </span>
                {selectedCirconscription &&
                  selectedCirconscription !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Circonscription:{" "}
                      {availableCirconscriptions.find(
                        (c) => c.codeCirconscription === selectedCirconscription
                      )?.libelleCirconscription || selectedCirconscription}
                    </Badge>
                  )}
                {selectedCels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedCels.slice(0, 3).map((celCode) => {
                      const cel = filteredCels.find(
                        (c) => c.codeCellule === celCode
                      );
                      return (
                        <Badge
                          key={celCode}
                          variant="secondary"
                          className="text-xs"
                        >
                          CEL: {cel?.libelleCellule || celCode}
                        </Badge>
                      );
                    })}
                    {selectedCels.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedCels.length - 3} autres
                      </Badge>
                    )}
                  </div>
                )}
                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Statut:{" "}
                    {selectedStatus === ImportStatus.N
                      ? "En attente"
                      : selectedStatus === ImportStatus.I
                      ? "Importé"
                      : selectedStatus === ImportStatus.P
                      ? "Publié"
                      : selectedStatus}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Effacer
              </Button>
            )}

            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, page: 1 })}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
