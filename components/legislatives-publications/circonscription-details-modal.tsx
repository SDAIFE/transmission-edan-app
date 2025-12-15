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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableColumnsType } from "antd";
import {
  X,
  Building2,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Users,
  Vote,
  TrendingUp,
  FileText,
} from "lucide-react";
import { legislativesPublicationsApi } from "@/lib/api/legislatives-publications";
import type {
  CirconscriptionDetailsModalProps,
  CirconscriptionDataResponse,
} from "@/types/legislatives-publications";

// Type pour les lignes du tableau des CELs
interface CelTableRow {
  key: string;
  codeCel: string;
  libelleCel: string | null;
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  isTotal: boolean;
  [key: `candidate_${string}`]: number; // Colonnes dynamiques pour les candidats
}

// Styles personnalisés pour le tableau
const tableStyles = `
  .circonscription-results-table .ant-table-thead > tr > th {
    background-color: #6FDD6F !important;
    border: 1px solid #d1d5db !important;
    font-weight: bold !important;
    text-align: center !important;
    padding: 8px 4px !important;
    font-size: 11px !important;
  }
  
  .circonscription-results-table .ant-table-thead > tr:first-child > th {
    background-color: #F49F60 !important;
    font-weight: bold !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr > td {
    border: 1px solid #d1d5db !important;
    padding: 6px 4px !important;
    font-size: 11px !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #f9fafb !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr:hover > td {
    background-color: #f3f4f6 !important;
  }
  
  .circonscription-results-table .ant-table-thead > tr > th[data-index*="candidate"] {
    background-color: #dcfce7 !important;
    color: #166534 !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr > td[data-index*="candidate"] {
    background-color: #f0fdf4 !important;
    text-align: center !important;
  }
  
  /* Styles pour la ligne de totaux */
  .circonscription-results-table .ant-table-tbody > tr[data-row-key="totals"] {
    background-color: #22c55e !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr[data-row-key="totals"] > td {
    background-color: #22c55e !important;
    color: white !important;
    font-weight: bold !important;
    border: 2px solid #16a34a !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr[data-row-key="totals"]:hover > td {
    background-color: #16a34a !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr[data-row-key="totals"] > td[data-index*="candidate"] {
    background-color: #22c55e !important;
    color: white !important;
  }
  
  .circonscription-results-table .ant-table-tbody > tr[data-row-key="totals"]:hover > td[data-index*="candidate"] {
    background-color: #16a34a !important;
  }
`;

export function CirconscriptionDetailsModal({
  isOpen,
  onClose,
  codeCirconscription,
  isUser = false,
  publicationStatus,
  onPublish,
  onCancel,
}: CirconscriptionDetailsModalProps) {
  const [data, setData] = useState<CirconscriptionDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // États pour les actions
  const [showPublishAlert, setShowPublishAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const loadData = async () => {
    if (!codeCirconscription) {
      console.warn(
        "⚠️ [CirconscriptionDetailsModal] Pas de codeCirconscription fourni"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(
          "🔄 [CirconscriptionDetailsModal] Chargement des données pour:",
          codeCirconscription
        );
      }

      const response = await legislativesPublicationsApi.getCirconscriptionData(
        codeCirconscription
      );

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(
          "📥 [CirconscriptionDetailsModal] Données reçues:",
          response
        );
      }

      setData(response);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des données";
      console.error(
        "❌ [CirconscriptionDetailsModal] Erreur lors du chargement:",
        err
      );
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
      setSearchText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, codeCirconscription]);

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

  // Extraire les candidats uniques depuis toutes les CELs
  const candidateColumns = useMemo(() => {
    if (!data || !data.cels || data.cels.length === 0) {
      return [];
    }

    // Récupérer tous les numéroDossier uniques depuis les candidats de toutes les CELs
    const allCandidates = new Set<string>();
    data.cels.forEach((cel) => {
      cel.candidats?.forEach((candidat) => {
        if (candidat.numeroDossier) {
          allCandidates.add(candidat.numeroDossier);
        }
      });
    });

    // Ajouter aussi les candidats au niveau circonscription
    data.candidats?.forEach((candidat) => {
      if (candidat.numeroDossier) {
        allCandidates.add(candidat.numeroDossier);
      }
    });

    return Array.from(allCandidates).sort();
  }, [data]);

  // Préparer les données pour le tableau des CELs avec ligne de totaux
  const celsTableData = useMemo(() => {
    if (!data || !data.cels) return [];

    // Créer la ligne de totaux agrégés (première ligne)
    const totalsRow: CelTableRow = {
      key: "totals",
      codeCel: "TOTAL",
      libelleCel: "RÉSULTATS AGRÉGÉS",
      inscrits: data.inscrits,
      votants: data.votants,
      participation: data.participation,
      nombreBureaux: data.nombreBureaux,
      isTotal: true, // Flag pour identifier la ligne de totaux
    };

    // Ajouter les scores totaux des candidats depuis data.candidats
    candidateColumns.forEach((numDos) => {
      const candidat = data.candidats?.find((c) => c.numeroDossier === numDos);
      totalsRow[`candidate_${numDos}`] = candidat?.score || 0;
    });

    // Créer les lignes pour chaque CEL
    const celsRows = data.cels.map((cel, index) => {
      const row: CelTableRow = {
        key: cel.codeCel || `cel-${index}`,
        codeCel: cel.codeCel,
        libelleCel: cel.libelleCel,
        inscrits: cel.inscrits,
        votants: cel.votants,
        participation: cel.participation,
        nombreBureaux: cel.nombreBureaux,
        isTotal: false,
      };

      // Ajouter les scores des candidats comme colonnes dynamiques
      candidateColumns.forEach((numDos) => {
        const candidat = cel.candidats?.find((c) => c.numeroDossier === numDos);
        row[`candidate_${numDos}`] = candidat?.score || 0;
      });

      return row;
    });

    // Retourner la ligne de totaux en premier, suivie des CELs
    return [totalsRow, ...celsRows];
  }, [data, candidateColumns]);

  // Colonnes du tableau des CELs
  const celsColumns: TableColumnsType<CelTableRow> = useMemo(() => {
    // Fonction helper pour déterminer les gagnants/égalités dans une ligne
    // Retourne un seul vainqueur uniquement s'il n'y a pas d'égalité
    const getWinners = (
      record: CelTableRow
    ): { winners: string[]; isTie: boolean; singleWinner: string | null } => {
      const scores: { numDos: string; score: number }[] = [];

      candidateColumns.forEach((numDos) => {
        const score = record[`candidate_${numDos}`] || 0;
        if (score > 0) {
          scores.push({ numDos, score });
        }
      });

      if (scores.length === 0) {
        return { winners: [], isTie: false, singleWinner: null };
      }

      const maxScore = Math.max(...scores.map((s) => s.score));
      const winners = scores
        .filter((s) => s.score === maxScore)
        .map((s) => s.numDos);

      // Il n'y a qu'un seul vainqueur si winners.length === 1
      const isTie = winners.length > 1;
      const singleWinner = winners.length === 1 ? winners[0] : null;

      return {
        winners,
        isTie,
        singleWinner,
      };
    };
    const baseColumns: TableColumnsType<CelTableRow> = [
      {
        title: "Code CEL",
        dataIndex: "codeCel",
        key: "codeCel",
        width: 100,
        fixed: "left",
        render: (value: string, record: CelTableRow) => (
          <div
            className={`font-medium text-sm ${
              record.isTotal ? "font-bold text-white bg-green-500" : ""
            }`}
          >
            {value}
          </div>
        ),
      },
      {
        title: "Libellé CEL",
        dataIndex: "libelleCel",
        key: "libelleCel",
        width: 200,
        fixed: "left",
        render: (value: string | null, record: CelTableRow) => (
          <div
            className={`text-sm ${
              record.isTotal ? "font-bold text-white bg-green-500" : ""
            }`}
          >
            {value || "Sans libellé"}
          </div>
        ),
      },
      {
        title: "Bureaux",
        dataIndex: "nombreBureaux",
        key: "nombreBureaux",
        width: 80,
        align: "center",
        render: (value: number, record: CelTableRow) => (
          <div
            className={`text-sm ${
              record.isTotal ? "font-bold text-white bg-green-500" : ""
            }`}
          >
            {formatNumber(value)}
          </div>
        ),
      },
      {
        title: "Inscrits",
        dataIndex: "inscrits",
        key: "inscrits",
        width: 100,
        align: "center",
        render: (value: number, record: CelTableRow) => (
          <div
            className={`text-sm font-medium ${
              record.isTotal ? "font-bold text-white bg-green-500" : ""
            }`}
          >
            {formatNumber(value)}
          </div>
        ),
      },
      {
        title: "Votants",
        dataIndex: "votants",
        key: "votants",
        width: 100,
        align: "center",
        render: (value: number, record: CelTableRow) => (
          <div
            className={`text-sm font-medium ${
              record.isTotal
                ? "font-bold text-white bg-green-500"
                : "text-blue-600"
            }`}
          >
            {formatNumber(value)}
          </div>
        ),
      },
      {
        title: "Participation",
        dataIndex: "participation",
        key: "participation",
        width: 100,
        align: "center",
        render: (value: number, record: CelTableRow) => (
          <div
            className={`text-sm font-medium ${
              record.isTotal
                ? "font-bold text-white bg-green-500"
                : "text-green-600"
            }`}
          >
            {formatPercentage(value)}
          </div>
        ),
      },
    ];

    // Colonnes dynamiques pour les candidats
    const candidateCols = candidateColumns.map((numDos) => {
      // Trouver le nom du candidat depuis les données globales
      const candidat = data?.candidats?.find((c) => c.numeroDossier === numDos);
      const candidatName = candidat?.nom || numDos;

      return {
        title: (
          <div className="text-center">
            <div className="font-bold text-xs">{candidatName}</div>
          </div>
        ),
        dataIndex: `candidate_${numDos}`,
        key: `candidate_${numDos}`,
        width: 100,
        align: "center" as const,
        render: (value: number, record: CelTableRow) => {
          const { winners, isTie, singleWinner } = getWinners(record);

          // Afficher "Victoire" uniquement s'il y a un seul vainqueur
          // Afficher "Égalité" s'il y a plusieurs candidats avec le même score maximum
          const isSingleWinner = singleWinner === numDos;
          const isInTie = isTie && winners.includes(numDos);

          return (
            <div
              className={`text-sm font-medium flex flex-col items-center gap-1 ${
                record.isTotal ? "font-bold text-white bg-green-500" : ""
              }`}
              data-index={`candidate-${numDos}`}
            >
              <div>{value > 0 ? formatNumber(value) : "0"}</div>
              {value > 0 && !record.isTotal && (
                <>
                  {isSingleWinner && (
                    <Badge
                      variant="default"
                      className="text-xs bg-green-100 text-green-800 border-green-300"
                    >
                      Victoire
                    </Badge>
                  )}
                  {isInTie && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                    >
                      Égalité
                    </Badge>
                  )}
                </>
              )}
            </div>
          );
        },
      };
    });

    return [...baseColumns, ...candidateCols];
  }, [candidateColumns, data]);

  // Filtrer les CELs selon la recherche (exclure la ligne "RÉSULTATS AGRÉGÉS")
  const filteredCels = useMemo(() => {
    if (!searchText.trim()) return celsTableData;

    const searchLower = searchText.toLowerCase();
    return celsTableData.filter(
      (cel) =>
        cel.codeCel?.toLowerCase().includes(searchLower) ||
        cel.libelleCel?.toLowerCase().includes(searchLower)
    );
  }, [celsTableData, searchText]);

  // Compter uniquement les CELs (exclure la ligne "RÉSULTATS AGRÉGÉS" du comptage)
  const celsCount = useMemo(() => {
    return filteredCels.filter((cel) => !cel.isTotal).length;
  }, [filteredCels]);

  // Gestion des actions
  const handlePublishClick = () => setShowPublishAlert(true);
  const handleCancelClick = () => setShowCancelAlert(true);

  const confirmPublish = async () => {
    if (codeCirconscription && onPublish) {
      await onPublish(codeCirconscription);
      setShowPublishAlert(false);
      onClose();
    }
  };

  const confirmCancel = async () => {
    if (codeCirconscription && onCancel) {
      await onCancel(codeCirconscription);
      setShowCancelAlert(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xl font-bold">
                  {data?.libelleCirconscription || "Circonscription"}
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  Code: {codeCirconscription}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Détails de la circonscription avec données agrégées par CELs
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
              {/* Métriques globales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Métriques Globales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Inscrits</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatNumber(data.inscrits)}
                      </div>
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
                      <div className="text-2xl font-bold">
                        {formatNumber(data.nombreBureaux)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tableau des candidats */}
              {/* {data.candidats && data.candidats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Candidats - Scores Globaux</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Rang</th>
                            <th className="border p-2 text-left">Nom</th>
                            <th className="border p-2 text-left">Parti</th>
                            <th className="border p-2 text-center">Score</th>
                            <th className="border p-2 text-center">
                              Pourcentage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.candidats
                            .sort((a, b) => b.score - a.score)
                            .map((candidat, index) => (
                              <tr
                                key={candidat.numeroDossier}
                                className="hover:bg-gray-50"
                              >
                                <td className="border p-2">
                                  <Badge variant="outline">{index + 1}</Badge>
                                </td>
                                <td className="border p-2 font-medium">
                                  {candidat.nom}
                                </td>
                                <td className="border p-2">{candidat.parti}</td>
                                <td className="border p-2 text-center font-medium">
                                  {formatNumber(candidat.score)}
                                </td>
                                <td className="border p-2 text-center font-medium text-green-600">
                                  {formatPercentage(candidat.pourcentage)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )} */}

              {/* Tableau des CELs avec données agrégées */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Données par CEL ({celsCount} CEL
                      {celsCount > 1 ? "s" : ""})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher une CEL..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table
                      className="circonscription-results-table"
                      columns={celsColumns}
                      dataSource={filteredCels}
                      scroll={{ x: "max-content" }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total: ${total} CELs`,
                      }}
                      size="small"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions (ADMIN/SADMIN uniquement) */}
              {!isUser && (
                <div className="flex items-center justify-end gap-2">
                  {onPublish && (
                    <Button
                      onClick={handlePublishClick}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publier
                    </Button>
                  )}
                  {/* Afficher le bouton "Annuler la publication" uniquement si la circonscription est publiée */}
                  {onCancel && publicationStatus === "1" && (
                    <Button
                      onClick={handleCancelClick}
                      variant="destructive"
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Annuler la publication
                    </Button>
                  )}
                  <Button variant="outline" onClick={onClose}>
                    <X className="h-4 w-4 mr-2" />
                    Fermer
                  </Button>
                </div>
              )}

              {isUser && (
                <div className="flex items-center justify-end">
                  <Button variant="outline" onClick={onClose}>
                    <X className="h-4 w-4 mr-2" />
                    Fermer
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alertes de confirmation */}
      <AlertDialog open={showPublishAlert} onOpenChange={setShowPublishAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la publication</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir publier la circonscription{" "}
              {codeCirconscription} ? Cette action rendra les résultats publics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPublish}
              className="bg-green-600 hover:bg-green-700"
            >
              Publier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l&apos;annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler la publication de la
              circonscription {codeCirconscription} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Annuler la publication
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
