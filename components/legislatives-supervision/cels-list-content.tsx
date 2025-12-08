"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  X as XIcon,
  RefreshCw,
  Loader2,
  List,
  MapPin,
  Building2,
} from "lucide-react";
import { legislativesSupervisionApi } from "@/lib/api/legislatives-supervision";
import type {
  CelsByRegionResponse,
  RegionCels,
  CirconscriptionCels,
  CelItem,
  CelEtatResultat,
} from "@/types/legislatives-supervision";
import { toast } from "sonner";

interface CelsListContentProps {
  onRefresh?: () => void;
}

export function CelsListContent({ onRefresh }: CelsListContentProps) {
  const [data, setData] = useState<CelsByRegionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCirconscription, setSelectedCirconscription] =
    useState<string>("all");
  const [selectedCel, setSelectedCel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  // États pour les accordéons
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set()
  );
  const [expandedCirconscriptions, setExpandedCirconscriptions] = useState<
    Set<string>
  >(new Set());

  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const REGIONS_PER_PAGE = 3;

  // Charger les données
  const loadData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const result = await legislativesSupervisionApi.getCelsByRegion();
      setData(result);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des CELs";
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Options pour les filtres
  const availableRegions = useMemo(() => {
    if (!data) return [];
    return data.regions.map((region) => ({
      value: region.codeRegion,
      label: region.libelleRegion || `Région ${region.codeRegion}`,
    }));
  }, [data]);

  const availableCirconscriptions = useMemo(() => {
    if (!data || selectedRegion === "all") return [];
    const region = data.regions.find((r) => r.codeRegion === selectedRegion);
    if (!region) return [];
    return region.circonscriptions.map((circ) => ({
      value: circ.codeCirconscription,
      label:
        circ.libelleCirconscription ||
        `Circonscription ${circ.codeCirconscription}`,
    }));
  }, [data, selectedRegion]);

  const availableCels = useMemo(() => {
    if (!data || selectedRegion === "all" || selectedCirconscription === "all")
      return [];
    const region = data.regions.find((r) => r.codeRegion === selectedRegion);
    if (!region) return [];
    const circ = region.circonscriptions.find(
      (c) => c.codeCirconscription === selectedCirconscription
    );
    if (!circ) return [];
    return circ.cels.map((cel) => ({
      value: cel.codeCel,
      label: cel.libelleCel || `CEL ${cel.codeCel}`,
    }));
  }, [data, selectedRegion, selectedCirconscription]);

  // Réinitialiser les filtres dépendants
  useEffect(() => {
    if (selectedRegion === "all") {
      setSelectedCirconscription("all");
      setSelectedCel("all");
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedCirconscription === "all") {
      setSelectedCel("all");
    }
  }, [selectedCirconscription]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedRegion,
    selectedCirconscription,
    selectedCel,
    selectedStatus,
    searchText,
  ]);

  // Fonctions utilitaires pour les statuts
  const getStatusColor = (etat: CelEtatResultat): string => {
    switch (etat) {
      case "I":
        return "bg-blue-600";
      case "PUBLISHED":
        return "bg-green-600";
      case "CANCELLED":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (etat: CelEtatResultat): string => {
    switch (etat) {
      case "I":
        return "Importée";
      case "PUBLISHED":
        return "Publiée";
      case "CANCELLED":
        return "Annulée";
      default:
        return "En attente";
    }
  };

  // Filtrage des données
  const filteredData = useMemo(() => {
    if (!data) return null;

    let filteredRegions = [...data.regions];

    // Filtre par région
    if (selectedRegion !== "all") {
      filteredRegions = filteredRegions.filter(
        (region) => region.codeRegion === selectedRegion
      );
    }

    // Appliquer tous les filtres sur les CELs et circonscriptions
    filteredRegions = filteredRegions.map((region) => {
      let filteredCircs = [...region.circonscriptions];

      // Filtre par circonscription
      if (selectedCirconscription !== "all") {
        filteredCircs = filteredCircs.filter(
          (circ) => circ.codeCirconscription === selectedCirconscription
        );
      }

      // Appliquer les filtres sur les CELs pour chaque circonscription
      filteredCircs = filteredCircs.map((circ) => {
        let filteredCels = [...circ.cels];

        // Filtre par CEL
        if (selectedCel !== "all") {
          filteredCels = filteredCels.filter(
            (cel) => cel.codeCel === selectedCel
          );
        }

        // Filtre par statut
        if (selectedStatus !== "all") {
          const statusValue = selectedStatus === "null" ? null : selectedStatus;
          filteredCels = filteredCels.filter(
            (cel) => cel.etatResultat === statusValue
          );
        }

        // Recherche textuelle sur les CELs
        if (searchText.trim()) {
          const searchLower = searchText.toLowerCase().trim();
          filteredCels = filteredCels.filter(
            (cel) =>
              cel.codeCel.toLowerCase().includes(searchLower) ||
              cel.libelleCel?.toLowerCase().includes(searchLower)
          );
        }

        return {
          ...circ,
          cels: filteredCels,
        };
      });

      // Filtrer les circonscriptions selon la recherche textuelle
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase().trim();
        filteredCircs = filteredCircs.filter((circ) => {
          const matchesCirc =
            circ.codeCirconscription.toLowerCase().includes(searchLower) ||
            circ.libelleCirconscription?.toLowerCase().includes(searchLower);
          return matchesCirc || circ.cels.length > 0;
        });
      }

      // Supprimer les circonscriptions sans CELs
      filteredCircs = filteredCircs.filter((circ) => circ.cels.length > 0);

      return {
        ...region,
        circonscriptions: filteredCircs,
      };
    });

    // Filtrer les régions selon la recherche textuelle
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filteredRegions = filteredRegions.filter((region) => {
        const matchesRegion =
          region.codeRegion.toLowerCase().includes(searchLower) ||
          region.libelleRegion?.toLowerCase().includes(searchLower);
        return matchesRegion || region.circonscriptions.length > 0;
      });
    }

    // Supprimer les régions sans circonscriptions
    filteredRegions = filteredRegions.filter(
      (region) => region.circonscriptions.length > 0
    );

    // Calculer le total de CELs filtrées
    const totalFilteredCels = filteredRegions.reduce(
      (total, region) =>
        total +
        region.circonscriptions.reduce(
          (sum, circ) => sum + circ.cels.length,
          0
        ),
      0
    );

    return {
      regions: filteredRegions,
      totalCels: totalFilteredCels,
    };
  }, [
    data,
    selectedRegion,
    selectedCirconscription,
    selectedCel,
    selectedStatus,
    searchText,
  ]);

  // Calculer la pagination
  const totalRegions = filteredData?.regions.length || 0;
  const totalPages = Math.ceil(totalRegions / REGIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * REGIONS_PER_PAGE;
  const endIndex = startIndex + REGIONS_PER_PAGE;
  const paginatedRegions =
    filteredData?.regions.slice(startIndex, endIndex) || [];

  // Calculer les statistiques par région
  const calculateRegionStats = (region: RegionCels) => {
    const stats = {
      total: 0,
      imported: 0,
      published: 0,
      cancelled: 0,
      pending: 0,
    };

    region.circonscriptions.forEach((circ) => {
      circ.cels.forEach((cel) => {
        stats.total++;
        switch (cel.etatResultat) {
          case "I":
            stats.imported++;
            break;
          case "PUBLISHED":
            stats.published++;
            break;
          case "CANCELLED":
            stats.cancelled++;
            break;
          default:
            stats.pending++;
        }
      });
    });

    return stats;
  };

  // Toggle accordéons
  const toggleRegion = (codeRegion: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(codeRegion)) {
      newExpanded.delete(codeRegion);
    } else {
      newExpanded.add(codeRegion);
    }
    setExpandedRegions(newExpanded);
  };

  const toggleCirconscription = (codeCirc: string) => {
    const newExpanded = new Set(expandedCirconscriptions);
    if (newExpanded.has(codeCirc)) {
      newExpanded.delete(codeCirc);
    } else {
      newExpanded.add(codeCirc);
    }
    setExpandedCirconscriptions(newExpanded);
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSelectedRegion("all");
    setSelectedCirconscription("all");
    setSelectedCel("all");
    setSelectedStatus("all");
    setSearchText("");
  };

  const hasActiveFilters =
    selectedRegion !== "all" ||
    selectedCirconscription !== "all" ||
    selectedCel !== "all" ||
    selectedStatus !== "all" ||
    searchText.trim() !== "";

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Chargement des CELs...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          className="mt-4"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (!data || data.regions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Aucune CEL trouvée</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          className="mt-4"
        >
          Actualiser
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec totaux et rafraîchissement */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Liste des CELs</h3>
          <p className="text-sm text-muted-foreground">
            {filteredData ? (
              <>
                {filteredData.totalCels} CEL(s) affichée(s)
                {filteredData.totalCels !== data.totalCels && (
                  <> sur {data.totalCels} au total</>
                )}
              </>
            ) : (
              `${data.totalCels} CEL(s) au total`
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadData(true);
            onRefresh?.();
          }}
          disabled={refreshing || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Rafraîchissement..." : "Rafraîchir"}
        </Button>
      </div>

      {/* Zone de filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche textuelle */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par code ou libellé circonscription..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
                {searchText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchText("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filtre par région */}
            <div>
              <Select
                value={selectedRegion}
                onValueChange={setSelectedRegion}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {availableRegions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par circonscription */}
            <div>
              <Select
                value={selectedCirconscription}
                onValueChange={setSelectedCirconscription}
                disabled={loading || selectedRegion === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Circonscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Toutes les circonscriptions
                  </SelectItem>
                  {availableCirconscriptions.map((circ) => (
                    <SelectItem key={circ.value} value={circ.value}>
                      {circ.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par statut */}
            <div>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="I">Importées</SelectItem>
                  <SelectItem value="PUBLISHED">Publiées</SelectItem>
                  <SelectItem value="CANCELLED">Annulées</SelectItem>
                  <SelectItem value="null">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bouton de réinitialisation */}
          {hasActiveFilters && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <XIcon className="h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des CELs */}
      {filteredData && filteredData.regions.length > 0 ? (
        <>
          <div className="space-y-4">
            {paginatedRegions.map((region) => {
              const isExpanded = expandedRegions.has(region.codeRegion);
              const stats = calculateRegionStats(region);

              return (
                <Card key={region.codeRegion}>
                  <CardHeader>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleRegion(region.codeRegion)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-base">
                            {region.libelleRegion ||
                              `Région ${region.codeRegion}`}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Code: {region.codeRegion} • {stats.total} CEL(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {stats.imported > 0 && (
                          <Badge className="bg-blue-600 text-white">
                            {stats.imported} Importée
                            {stats.imported > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {stats.published > 0 && (
                          <Badge className="bg-green-600 text-white">
                            {stats.published} Publiée
                            {stats.published > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {stats.pending > 0 && (
                          <Badge className="bg-gray-500 text-white">
                            {stats.pending} En attente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      {region.circonscriptions.length > 0 ? (
                        <div className="space-y-3">
                          {region.circonscriptions.map((circ) => {
                            const isCircExpanded = expandedCirconscriptions.has(
                              circ.codeCirconscription
                            );

                            return (
                              <div
                                key={circ.codeCirconscription}
                                className="border rounded-lg p-4"
                              >
                                <div
                                  className="flex items-center justify-between cursor-pointer mb-2"
                                  onClick={() =>
                                    toggleCirconscription(
                                      circ.codeCirconscription
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-3">
                                    {isCircExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Building2 className="h-4 w-4 text-orange-600" />
                                    <div>
                                      <p className="font-medium">
                                        {circ.libelleCirconscription ||
                                          `Circonscription ${circ.codeCirconscription}`}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Code: {circ.codeCirconscription} •{" "}
                                        {circ.cels.length} CEL(s)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {isCircExpanded && (
                                  <div className="mt-3 space-y-2">
                                    {circ.cels.length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {circ.cels.map((cel) => (
                                          <div
                                            key={cel.codeCel}
                                            className="border rounded p-3 flex items-center justify-between"
                                            style={{
                                              borderLeft: `4px solid ${
                                                cel.etatResultat === "I"
                                                  ? "#2563eb"
                                                  : cel.etatResultat ===
                                                    "PUBLISHED"
                                                  ? "#16a34a"
                                                  : cel.etatResultat ===
                                                    "CANCELLED"
                                                  ? "#dc2626"
                                                  : "#6b7280"
                                              }`,
                                            }}
                                          >
                                            <div className="flex-1">
                                              <p className="font-medium text-sm">
                                                {cel.codeCel}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {cel.libelleCel ||
                                                  `CEL ${cel.codeCel}`}
                                              </p>
                                            </div>
                                            <Badge
                                              className={`${getStatusColor(
                                                cel.etatResultat as CelEtatResultat
                                              )} text-white border-0`}
                                            >
                                              {getStatusLabel(
                                                cel.etatResultat as CelEtatResultat
                                              )}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground text-center py-2">
                                        Aucune CEL dans cette circonscription
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucune circonscription avec CELs dans cette région
                        </p>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de{" "}
                <span className="font-medium">{paginatedRegions.length}</span>{" "}
                région{paginatedRegions.length > 1 ? "s" : ""} sur{" "}
                <span className="font-medium">{totalRegions}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune CEL ne correspond aux filtres sélectionnés</p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
