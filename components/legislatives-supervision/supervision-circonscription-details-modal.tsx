"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Building2,
  Loader2,
  Users,
  Vote,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  History,
} from "lucide-react";
import { legislativesSupervisionApi } from "@/lib/api/legislatives-supervision";
import type {
  SupervisionCirconscriptionResponse,
  SupervisionCirconscriptionDetailsProps,
} from "@/types/legislatives-supervision";

export function SupervisionCirconscriptionDetailsModal({
  codeCirconscription,
  isOpen,
  onClose,
  isUser = false,
}: SupervisionCirconscriptionDetailsProps) {
  const [data, setData] = useState<SupervisionCirconscriptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!codeCirconscription) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await legislativesSupervisionApi.getCirconscriptionDetails(
        codeCirconscription
      );

      setData(response);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du chargement des données";
      console.error("❌ [SupervisionCirconscriptionDetailsModal] Erreur:", err);
      setError(errorMessage);
      toast.error("Erreur lors du chargement des données", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && codeCirconscription) {
      loadData();
    } else {
      setData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, codeCirconscription]);

  const formatNumber = (value: number | string): string => {
    const num = typeof value === "string" ? parseInt(value) || 0 : value;
    return num.toLocaleString("fr-FR");
  };

  const formatPercentage = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value) || 0 : value;
    return `${num.toFixed(2)}%`;
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

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "1":
      case "PUBLISHED":
        return <Badge className="bg-green-600">Publié</Badge>;
      case "0":
        return <Badge variant="secondary">En attente</Badge>;
      case "C":
      case "CANCELLED":
        return <Badge variant="destructive">Annulé</Badge>;
      case "I":
        return <Badge variant="outline">Importé</Badge>;
      default:
        return <Badge variant="outline">{statut || "N/A"}</Badge>;
    }
  };

  // Colonnes pour les candidats
  const candidatsColumns: TableColumnsType<any> = [
    {
      title: "Rang",
      dataIndex: "classement",
      key: "classement",
      width: 80,
      align: "center",
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      width: 200,
    },
    {
      title: "Parti",
      dataIndex: "parti",
      key: "parti",
      width: 150,
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: 120,
      align: "center",
      render: (value: number) => formatNumber(value),
    },
    {
      title: "Pourcentage",
      dataIndex: "pourcentage",
      key: "pourcentage",
      width: 120,
      align: "center",
      render: (value: number) => (
        <span className="font-medium text-green-600">{formatPercentage(value)}</span>
      ),
    },
  ];

  // Colonnes pour les CELs
  const celsColumns: TableColumnsType<any> = [
    {
      title: "Code CEL",
      dataIndex: "codeCel",
      key: "codeCel",
      width: 100,
    },
    {
      title: "Libellé CEL",
      dataIndex: "libelleCel",
      key: "libelleCel",
      width: 200,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      width: 120,
      render: (statut: string) => getStatutBadge(statut),
    },
    {
      title: "Bureaux",
      dataIndex: "nombreBureaux",
      key: "nombreBureaux",
      width: 100,
      align: "center",
      render: (value: number) => formatNumber(value),
    },
    {
      title: "Taux Saisie",
      dataIndex: "tauxSaisie",
      key: "tauxSaisie",
      width: 120,
      align: "center",
      render: (value: number) => formatPercentage(value),
    },
  ];

  // Colonnes pour l'historique
  const historiqueColumns: TableColumnsType<any> = [
    {
      title: "Date",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string) => formatDate(timestamp),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (action: string) => {
        switch (action) {
          case "PUBLISH":
            return <Badge className="bg-green-600">Publication</Badge>;
          case "CANCEL":
            return <Badge variant="destructive">Annulation</Badge>;
          default:
            return <Badge variant="outline">{action}</Badge>;
        }
      },
    },
    {
      title: "Détails",
      dataIndex: "details",
      key: "details",
      ellipsis: true,
      render: (details: string | null) => details || "-",
    },
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-xl font-bold">
                {data?.circonscription.libelleCirconscription || "Circonscription"}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                Code: {codeCirconscription}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Détails de supervision de la circonscription
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Chargement des données...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations de la Circonscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Statut Publication</p>
                    <div className="mt-1">{getStatutBadge(data.circonscription.statutPublication)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre de Sièges</p>
                    <p className="text-xl font-bold">{data.circonscription.nombreSieges}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métriques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métriques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Inscrits</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(data.metriques.inscrits)}</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Vote className="h-4 w-4" />
                      <span>Votants</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(data.metriques.votants)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Participation</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(data.metriques.participation)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Suffrage Exprimé</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(data.metriques.suffrageExprime)}</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      <span>Bulletins Nuls</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatNumber(data.metriques.bulletinsNuls)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Bulletins Blancs</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(data.metriques.bulletinsBlancs)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidats */}
            {data.candidats && data.candidats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Candidats</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table
                    columns={candidatsColumns}
                    dataSource={data.candidats}
                    rowKey="numeroDossier"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </CardContent>
              </Card>
            )}

            {/* CELs */}
            {data.cels && data.cels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>CELLs ({data.cels.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table
                    columns={celsColumns}
                    dataSource={data.cels}
                    rowKey="codeCel"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </CardContent>
              </Card>
            )}

            {/* Historique */}
            {data.historique && data.historique.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historique des Publications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table
                    columns={historiqueColumns}
                    dataSource={data.historique}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </CardContent>
              </Card>
            )}

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






