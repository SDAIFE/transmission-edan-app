"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableColumnsType } from "antd";
import {
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MapPin,
  Eye,
  XCircle,
  AlertCircle,
  X as XIcon,
  FileText,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CirconscriptionsContent } from "./circonscriptions-content";
import type {
  SupervisionDashboardResponse,
  Alerte,
  RegionSupervision,
  HistoriqueEntry,
  TypeAlerte,
} from "@/types/legislatives-supervision";

interface SupervisionDashboardProps {
  data: SupervisionDashboardResponse;
  onCirconscriptionClick?: (codeCirconscription: string) => void;
  onAlerteClick?: (alerte: Alerte) => void;
}

export function SupervisionDashboard({
  data,
  onCirconscriptionClick,
  onAlerteClick,
}: SupervisionDashboardProps) {
  const { user } = useAuth();
  const [selectedAlerteTypes, setSelectedAlerteTypes] = useState<
    Set<TypeAlerte>
  >(new Set());
  const [activeTab, setActiveTab] = useState<"regions" | "circonscriptions">(
    "regions"
  );
  const [regionSearchText, setRegionSearchText] = useState("");

  // Vérifier si l'utilisateur peut accéder aux circonscriptions (MANAGER, ADMIN, SADMIN)
  const canAccessCirconscriptions = useMemo(() => {
    const role = user?.role?.code;
    return role === "MANAGER" || role === "ADMIN" || role === "SADMIN";
  }, [user?.role?.code]);

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return "-";
    }
    return value.toLocaleString("fr-FR");
  };

  const formatPercentage = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return "-";
    }
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tri des alertes par priorité (HAUTE > MOYENNE > BASSE)
  const getPrioriteOrder = (priorite: string): number => {
    switch (priorite) {
      case "HAUTE":
        return 0;
      case "MOYENNE":
        return 1;
      case "BASSE":
        return 2;
      default:
        return 3;
    }
  };

  // Filtrage et tri des alertes
  const filteredAndSortedAlertes = useMemo(() => {
    let filtered = [...data.alertes];

    // Filtrage par type
    if (selectedAlerteTypes.size > 0) {
      filtered = filtered.filter((alerte) =>
        selectedAlerteTypes.has(alerte.type)
      );
    }

    // Tri par priorité
    filtered.sort((a, b) => {
      const orderA = getPrioriteOrder(a.priorite);
      const orderB = getPrioriteOrder(b.priorite);
      return orderA - orderB;
    });

    return filtered;
  }, [data.alertes, selectedAlerteTypes]);

  // Filtrage des régions par recherche
  const filteredRegions = useMemo(() => {
    if (!regionSearchText.trim()) {
      return data.regions;
    }

    const searchLower = regionSearchText.toLowerCase().trim();
    return data.regions.filter(
      (region) =>
        region.codeRegion?.toLowerCase().includes(searchLower) ||
        region.libelleRegion?.toLowerCase().includes(searchLower)
    );
  }, [data.regions, regionSearchText]);

  const toggleAlerteTypeFilter = (type: TypeAlerte) => {
    const newSet = new Set(selectedAlerteTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedAlerteTypes(newSet);
  };

  const getAlerteIcon = (type: string) => {
    switch (type) {
      case "ANOMALIE":
        return <AlertCircle className="h-4 w-4" />;
      case "RETARD":
        return <Clock className="h-4 w-4" />;
      case "ERREUR":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlerteColor = (priorite: string) => {
    switch (priorite) {
      case "HAUTE":
        return "destructive";
      case "MOYENNE":
        return "default";
      case "BASSE":
        return "secondary";
      default:
        return "default";
    }
  };

  // Colonnes pour le tableau des régions
  const regionsColumns: TableColumnsType<RegionSupervision> = [
    {
      title: "Code",
      dataIndex: "codeRegion",
      key: "codeRegion",
      width: 80,
    },
    {
      title: "Région",
      dataIndex: "libelleRegion",
      key: "libelleRegion",
      width: 200,
    },
    {
      title: "Circonscriptions",
      dataIndex: "nombreCirconscriptions",
      key: "nombreCirconscriptions",
      width: 120,
      align: "center",
      render: (value: number | undefined | null) => formatNumber(value),
    },
    {
      title: "Circonscriptions Publiées",
      dataIndex: "nombreCirconscriptionsPubliees",
      key: "nombreCirconscriptionsPubliees",
      width: 150,
      align: "center",
      render: (value: number | undefined) =>
        value !== undefined ? formatNumber(value) : "-",
    },
    {
      title: "Taux Publication",
      dataIndex: "tauxPublication",
      key: "tauxPublication",
      width: 120,
      align: "center",
      render: (value: number | undefined | null) => {
        if (value === undefined || value === null || isNaN(value)) {
          return "-";
        }

        // Déterminer la couleur de fond selon le pourcentage
        let bgColor: string;
        if (value === 100) {
          bgColor = "bg-green-600"; // Vert pour 100%
        } else if (value >= 46) {
          bgColor = "bg-orange-500"; // Orange pour 46-99%
        } else {
          bgColor = "bg-red-600"; // Rouge pour 0-45%
        }

        return (
          <Badge className={`${bgColor} text-white border-0`}>
            {formatPercentage(value)}
          </Badge>
        );
      },
    },
    {
      title: "Total CELs",
      dataIndex: "nombreCels",
      key: "nombreCels",
      width: 100,
      align: "center",
      render: (value: number | undefined) =>
        value !== undefined ? formatNumber(value) : "-",
    },
    {
      title: "CELs Importées",
      dataIndex: "nombreCelsImportes",
      key: "nombreCelsImportes",
      width: 120,
      align: "center",
      render: (value: number | undefined) =>
        value !== undefined ? (
          <span className="text-green-600 font-medium">
            {formatNumber(value)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "CELs en Attente",
      dataIndex: "celsEnAttente",
      key: "celsEnAttente",
      width: 120,
      align: "center",
      render: (_: unknown, record: RegionSupervision) => {
        // Calculer celsEnAttente = nombreCels - nombreCelsImportes
        const totalCels = record.nombreCels ?? 0;
        const celsImportes = record.nombreCelsImportes ?? 0;
        const celsEnAttente = Math.max(0, totalCels - celsImportes);

        return (
          <span
            className={celsEnAttente > 0 ? "text-yellow-600 font-medium" : ""}
          >
            {formatNumber(celsEnAttente)}
          </span>
        );
      },
    },
  ];

  // Colonnes pour le tableau des alertes
  // const alertesColumns: TableColumnsType<Alerte> = [
  //   {
  //     title: "Type",
  //     dataIndex: "type",
  //     key: "type",
  //     width: 120,
  //     render: (type: string) => (
  //       <div className="flex items-center gap-2">
  //         {getAlerteIcon(type)}
  //         <span>{type}</span>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Priorité",
  //     dataIndex: "priorite",
  //     key: "priorite",
  //     width: 100,
  //     render: (priorite: string) => (
  //       <Badge
  //         variant={
  //           getAlerteColor(priorite) as "default" | "secondary" | "destructive"
  //         }
  //       >
  //         {priorite}
  //       </Badge>
  //     ),
  //   },
  //   {
  //     title: "Message",
  //     dataIndex: "message",
  //     key: "message",
  //     ellipsis: true,
  //   },
  //   {
  //     title: "Circonscription",
  //     dataIndex: "codeCirconscription",
  //     key: "codeCirconscription",
  //     width: 120,
  //     render: (code: string | undefined) =>
  //       code ? (
  //         <Button
  //           variant="link"
  //           size="sm"
  //           onClick={() => code && onCirconscriptionClick?.(code)}
  //           className="h-auto p-0"
  //         >
  //           {code}
  //         </Button>
  //       ) : (
  //         "-"
  //       ),
  //   },
  //   {
  //     title: "Action",
  //     key: "action",
  //     width: 80,
  //     render: (_: unknown, record: Alerte) => (
  //       <Button
  //         variant="ghost"
  //         size="sm"
  //         onClick={() => onAlerteClick?.(record)}
  //         className="h-8"
  //       >
  //         <Eye className="h-4 w-4" />
  //       </Button>
  //     ),
  //   },
  // ];

  // Colonnes pour l'historique
  const historiqueColumns: TableColumnsType<HistoriqueEntry> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 180,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      ellipsis: true,
    },
    {
      title: "Circonscription",
      dataIndex: "codeCirconscription",
      key: "codeCirconscription",
      width: 120,
      render: (code: string | undefined) =>
        code ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => code && onCirconscriptionClick?.(code)}
            className="h-auto p-0"
          >
            {code}
          </Button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Circonscriptions
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.vueEnsemble.totalCirconscriptions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de publication:{" "}
              {formatPercentage(data.vueEnsemble.tauxPublication)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(data.vueEnsemble.circonscriptionsPubliees)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(
                (data.vueEnsemble.circonscriptionsPubliees /
                  data.vueEnsemble.totalCirconscriptions) *
                  100
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(data.vueEnsemble.circonscriptionsEnAttente)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(
                (data.vueEnsemble.circonscriptionsEnAttente /
                  data.vueEnsemble.totalCirconscriptions) *
                  100
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux Publication
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(data.vueEnsemble.tauxPublication)}
            </div>
            <p className="text-xs text-muted-foreground">Global</p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de performance */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métriques de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Temps Moyen Publication
              </p>
              <p className="text-xl font-bold">
                {data.metriquesPerformance.tempsMoyenPublication} min
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Taux d&apos;Erreur
              </p>
              <p className="text-xl font-bold text-red-600">
                {formatPercentage(data.metriquesPerformance.tauxErreur)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Imports Réussis</p>
              <p className="text-xl font-bold text-green-600">
                {formatNumber(data.metriquesPerformance.nombreImportsReussis)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Imports Échoués</p>
              <p className="text-xl font-bold text-red-600">
                {formatNumber(data.metriquesPerformance.nombreImportsEchoues)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Alertes */}
      {/* {data.alertes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertes ({filteredAndSortedAlertes.length}/{data.alertes.length}
                )
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrer:</span>
                {(["ANOMALIE", "RETARD", "ERREUR"] as TypeAlerte[]).map(
                  (type) => (
                    <Button
                      key={type}
                      variant={
                        selectedAlerteTypes.has(type) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleAlerteTypeFilter(type)}
                      className="h-7 text-xs"
                    >
                      {type}
                    </Button>
                  )
                )}
                {selectedAlerteTypes.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAlerteTypes(new Set())}
                    className="h-7 text-xs"
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedAlertes.length > 0 ? (
              <Table
                columns={alertesColumns}
                dataSource={filteredAndSortedAlertes}
                rowKey={(record, index) => `alerte-${index}`}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Aucune alerte ne correspond aux filtres sélectionnés
              </div>
            )}
          </CardContent>
        </Card>
      )} */}

      {/* Statistiques par région / Circonscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {canAccessCirconscriptions
                ? "Statistiques par Région / Circonscriptions"
                : "Statistiques par Région"}
              {data.regions.length > 0 && ` (${data.regions.length} régions)`}
            </CardTitle>
            {activeTab === "regions" && (
              <div className="flex items-center gap-2 w-full max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher une région..."
                    value={regionSearchText}
                    onChange={(e) => setRegionSearchText(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {regionSearchText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRegionSearchText("")}
                    className="h-9"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {canAccessCirconscriptions ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value as "regions" | "circonscriptions");
                // Réinitialiser la recherche lors du changement d'onglet
                if (value === "circonscriptions") {
                  setRegionSearchText("");
                }
              }}
            >
              <TabsList>
                <TabsTrigger value="regions">
                  <MapPin className="h-4 w-4 mr-2" />
                  Régions
                </TabsTrigger>
                <TabsTrigger value="circonscriptions">
                  <FileText className="h-4 w-4 mr-2" />
                  Circonscriptions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="regions" className="mt-4">
                {filteredRegions.length > 0 ? (
                  <>
                    {regionSearchText && (
                      <div className="mb-4 text-sm text-muted-foreground">
                        {filteredRegions.length} région
                        {filteredRegions.length > 1 ? "s" : ""} trouvée
                        {filteredRegions.length > 1 ? "s" : ""} sur{" "}
                        {data.regions.length}
                      </div>
                    )}
                    <Table
                      columns={regionsColumns}
                      dataSource={filteredRegions}
                      rowKey="codeRegion"
                      pagination={{ pageSize: 10 }}
                      size="small"
                    />
                  </>
                ) : data.regions.length > 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune région ne correspond à votre recherche
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune région disponible
                  </div>
                )}
              </TabsContent>

              <TabsContent value="circonscriptions" className="mt-4">
                <CirconscriptionsContent />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              {data.regions.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une région..."
                      value={regionSearchText}
                      onChange={(e) => setRegionSearchText(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {regionSearchText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRegionSearchText("")}
                      className="h-9"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              {filteredRegions.length > 0 ? (
                <>
                  {regionSearchText && (
                    <div className="mb-4 text-sm text-muted-foreground">
                      {filteredRegions.length} région
                      {filteredRegions.length > 1 ? "s" : ""} trouvée
                      {filteredRegions.length > 1 ? "s" : ""} sur{" "}
                      {data.regions.length}
                    </div>
                  )}
                  <Table
                    columns={regionsColumns}
                    dataSource={filteredRegions}
                    rowKey="codeRegion"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </>
              ) : data.regions.length > 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune région ne correspond à votre recherche
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune région disponible
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Historique récent */}
      {data.historique.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique Récent</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={historiqueColumns}
              dataSource={data.historique.slice(0, 10)}
              rowKey={(record, index) => `hist-${index}`}
              pagination={false}
              size="small"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
