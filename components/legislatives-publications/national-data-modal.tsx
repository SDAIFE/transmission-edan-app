"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableColumnsType } from "antd";
import {
  X,
  Loader2,
  Search,
  Trophy,
  Users,
  Vote,
  TrendingUp,
  FileText,
  Building2,
  Globe,
  CheckCircle,
  Clock,
} from "lucide-react";
import { legislativesPublicationsApi } from "@/lib/api/legislatives-publications";
import type { NationalDataResponse, NationalCandidateData, NationalCirconscriptionData } from "@/types/legislatives-publications";

interface NationalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Styles personnalisés pour le tableau
const tableStyles = `
  .national-data-table .ant-table-thead > tr > th {
    background-color: #6FDD6F !important;
    border: 1px solid #d1d5db !important;
    font-weight: bold !important;
    text-align: center !important;
    padding: 8px 4px !important;
    font-size: 11px !important;
  }
  
  .national-data-table .ant-table-tbody > tr > td {
    border: 1px solid #d1d5db !important;
    padding: 6px 4px !important;
    font-size: 11px !important;
  }
  
  .national-data-table .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #f9fafb !important;
  }
  
  .national-data-table .ant-table-tbody > tr:hover > td {
    background-color: #f3f4f6 !important;
  }
`;

export function NationalDataModal({ isOpen, onClose }: NationalDataModalProps) {
  const [data, setData] = useState<NationalDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"candidates" | "circonscriptions">("candidates");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("🔄 [NationalDataModal] Chargement des données nationales...");
      }

      const response = await legislativesPublicationsApi.getNationalData();

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("📥 [NationalDataModal] Données reçues:", response);
      }

      setData(response);
    } catch (err: any) {
      console.error("❌ [NationalDataModal] Erreur lors du chargement:", err);
      setError(err.message || "Erreur lors du chargement des données nationales");
      toast.error("Erreur lors du chargement des données nationales", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      setData(null);
      setError(null);
      setSearchText("");
      setActiveTab("candidates");
    }
  }, [isOpen]);

  // Injecter les styles CSS
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = tableStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const formatNumber = (value: number | string): string => {
    const num = typeof value === "string" ? parseInt(value) || 0 : value;
    return num.toLocaleString("fr-FR");
  };

  const formatPercentage = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value) || 0 : value;
    return `${num.toFixed(2)}%`;
  };

  // Colonnes pour le tableau des candidats
  const candidatesColumns: TableColumnsType<NationalCandidateData> = useMemo(() => {
    const baseColumns: TableColumnsType<NationalCandidateData> = [
      {
        title: "Rang",
        key: "rank",
        width: 60,
        align: "center",
        render: (_: any, __: any, index: number) => (
          <Badge variant="outline">{index + 1}</Badge>
        ),
      },
      {
        title: "Numéro Dossier",
        dataIndex: "numeroDossier",
        key: "numeroDossier",
        width: 120,
        render: (value: string) => (
          <div className="font-medium text-sm">{value}</div>
        ),
      },
      {
        title: "Nom",
        dataIndex: "nom",
        key: "nom",
        width: 200,
        render: (value: string) => (
          <div className="font-medium">{value}</div>
        ),
      },
      {
        title: "Parti",
        dataIndex: "parti",
        key: "parti",
        width: 150,
        render: (value: string) => (
          <Badge variant="secondary" className="text-xs">
            {value}
          </Badge>
        ),
      },
      {
        title: "Score National",
        dataIndex: "score",
        key: "score",
        width: 120,
        align: "center",
        render: (value: number) => (
          <div className="text-sm font-bold text-blue-600">{formatNumber(value)}</div>
        ),
      },
      {
        title: "Pourcentage",
        dataIndex: "pourcentage",
        key: "pourcentage",
        width: 100,
        align: "center",
        render: (value: number) => (
          <div className="text-sm font-bold text-green-600">{formatPercentage(value)}</div>
        ),
      },
    ];

    // Colonnes dynamiques pour les scores par circonscription (si disponibles)
    if (data && data.circonscriptions && data.circonscriptions.length > 0) {
      const circonscriptionCols = data.circonscriptions.slice(0, 10).map((circ) => ({
        title: (
          <div className="text-center">
            <div className="font-bold text-xs">{circ.codeCirconscription}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[80px]">
              {circ.libelleCirconscription || ""}
            </div>
          </div>
        ),
        key: `circ_${circ.codeCirconscription}`,
        width: 100,
        align: "center" as const,
        render: (_: any, record: NationalCandidateData) => {
          const score = record.scoresParCirconscription?.[circ.codeCirconscription] || 0;
          return (
            <div className="text-xs" data-index={`circ-${circ.codeCirconscription}`}>
              {score > 0 ? formatNumber(score) : "-"}
            </div>
          );
        },
      }));

      return [...baseColumns, ...circonscriptionCols];
    }

    return baseColumns;
  }, [data]);

  // Colonnes pour le tableau des circonscriptions
  const circonscriptionsColumns: TableColumnsType<NationalCirconscriptionData> = [
    {
      title: "Code",
      dataIndex: "codeCirconscription",
      key: "codeCirconscription",
      width: 100,
      fixed: "left",
      render: (value: string) => (
        <div className="font-medium text-sm">{value}</div>
      ),
    },
    {
      title: "Libellé",
      dataIndex: "libelleCirconscription",
      key: "libelleCirconscription",
      width: 250,
      fixed: "left",
      render: (value: string | null) => (
        <div className="text-sm">{value || "Sans libellé"}</div>
      ),
    },
    {
      title: "Inscrits",
      dataIndex: "inscrits",
      key: "inscrits",
      width: 120,
      align: "center",
      render: (value: number) => (
        <div className="text-sm font-medium">{formatNumber(value)}</div>
      ),
    },
    {
      title: "Votants",
      dataIndex: "votants",
      key: "votants",
      width: 120,
      align: "center",
      render: (value: number) => (
        <div className="text-sm font-medium text-blue-600">{formatNumber(value)}</div>
      ),
    },
    {
      title: "Participation",
      dataIndex: "participation",
      key: "participation",
      width: 120,
      align: "center",
      render: (value: number) => (
        <div className="text-sm font-medium text-green-600">{formatPercentage(value)}</div>
      ),
    },
    {
      title: "Bureaux",
      dataIndex: "nombreBureaux",
      key: "nombreBureaux",
      width: 100,
      align: "center",
      render: (value: number) => (
        <div className="text-sm">{formatNumber(value)}</div>
      ),
    },
    {
      title: "Statut",
      dataIndex: "publicationStatus",
      key: "publicationStatus",
      width: 100,
      align: "center",
      render: (value: string | null) => {
        if (value === "1") {
          return (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Publié
            </Badge>
          );
        }
        if (value === "C") {
          return (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              <X className="h-3 w-3 mr-1" />
              Annulé
            </Badge>
          );
        }
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      },
    },
  ];

  // Filtrer les candidats selon la recherche
  const filteredCandidates = useMemo(() => {
    if (!data || !data.candidats) return [];
    if (!searchText.trim()) return data.candidats;

    const searchLower = searchText.toLowerCase();
    return data.candidats.filter(
      (candidat) =>
        candidat.nom?.toLowerCase().includes(searchLower) ||
        candidat.parti?.toLowerCase().includes(searchLower) ||
        candidat.numeroDossier?.toLowerCase().includes(searchLower)
    );
  }, [data, searchText]);

  // Filtrer les circonscriptions selon la recherche
  const filteredCirconscriptions = useMemo(() => {
    if (!data || !data.circonscriptions) return [];
    if (!searchText.trim()) return data.circonscriptions;

    const searchLower = searchText.toLowerCase();
    return data.circonscriptions.filter(
      (circ) =>
        circ.codeCirconscription?.toLowerCase().includes(searchLower) ||
        circ.libelleCirconscription?.toLowerCase().includes(searchLower)
    );
  }, [data, searchText]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-xl font-bold">Données Nationales</div>
              <div className="text-sm text-muted-foreground font-normal">
                Résultats consolidés au niveau national
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Statistiques et résultats agrégés de toutes les circonscriptions
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Chargement des données nationales...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            {/* Statistiques globales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistiques Nationales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Inscrits</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(data.inscrits)}</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Vote className="h-4 w-4" />
                      <span>Votants</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(data.votants)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Participation</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(data.participation)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Bureaux</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(data.nombreBureaux)}</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>Circonscriptions</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatNumber(data.nombreCirconscriptions)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>Publiées</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(data.circonscriptionsPubliees)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Onglets pour Candidats / Circonscriptions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === "candidates" ? "default" : "outline"}
                      onClick={() => setActiveTab("candidates")}
                      size="sm"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Candidats ({data.candidats?.length || 0})
                    </Button>
                    <Button
                      variant={activeTab === "circonscriptions" ? "default" : "outline"}
                      onClick={() => setActiveTab("circonscriptions")}
                      size="sm"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Circonscriptions ({data.circonscriptions?.length || 0})
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={
                          activeTab === "candidates"
                            ? "Rechercher un candidat..."
                            : "Rechercher une circonscription..."
                        }
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "candidates" && (
                  <div className="overflow-x-auto">
                    <Table
                      className="national-data-table"
                      columns={candidatesColumns}
                      dataSource={filteredCandidates.sort((a, b) => b.score - a.score)}
                      scroll={{ x: "max-content" }}
                      pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Total: ${total} candidat${total > 1 ? "s" : ""}`,
                      }}
                      size="small"
                      rowKey="numeroDossier"
                    />
                  </div>
                )}

                {activeTab === "circonscriptions" && (
                  <div className="overflow-x-auto">
                    <Table
                      className="national-data-table"
                      columns={circonscriptionsColumns}
                      dataSource={filteredCirconscriptions}
                      scroll={{ x: "max-content" }}
                      pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) =>
                          `Total: ${total} circonscription${total > 1 ? "s" : ""}`,
                      }}
                      size="small"
                      rowKey="codeCirconscription"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
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

