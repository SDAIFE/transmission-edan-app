"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  FileSpreadsheet,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  FileText,
  Search,
  Upload,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { publicationsApi } from "@/lib/api/publications";
import type {
  DepartmentAggregatedData,
  CelAggregatedData,
  DepartmentDetailsModalProps,
} from "@/types/publications";

// Styles personnalisés pour le tableau des départements
const tableStyles = `
  .dept-results-table .ant-table-thead > tr > th {
    background-color: #6FDD6F !important;
    border: 1px solid #d1d5db !important;
    font-weight: bold !important;
    text-align: center !important;
    padding: 8px 4px !important;
    font-size: 11px !important;
  }
  
  .dept-results-table .ant-table-thead > tr:first-child > th {
    background-color: #F49F60 !important;
    font-weight: bold !important;
  }
  
  .dept-results-table .ant-table-tbody > tr > td {
    border: 1px solid #d1d5db !important;
    padding: 6px 4px !important;
    font-size: 11px !important;
  }
  
  .dept-results-table .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #f9fafb !important;
  }
  
  .dept-results-table .ant-table-tbody > tr:hover > td {
    background-color: #f3f4f6 !important;
  }
  
  .dept-results-table .ant-table-thead > tr > th[data-index*="score"] {
    background-color: #dcfce7 !important;
    color: #166534 !important;
  }
  
  .dept-results-table .ant-table-tbody > tr > td[data-index*="score"] {
    background-color: #f0fdf4 !important;
    text-align: center !important;
  }
  
  /* Styles pour la ligne de totaux */
  .dept-results-table .ant-table-tbody > tr[data-row-key="TOTAL"] {
    background-color: #22c55e !important;
  }
  
  .dept-results-table .ant-table-tbody > tr[data-row-key="TOTAL"] > td {
    background-color: #22c55e !important;
    color: white !important;
    font-weight: bold !important;
    border: 2px solid #16a34a !important;
  }
  
  .dept-results-table .ant-table-tbody > tr[data-row-key="TOTAL"]:hover {
    background-color: #16a34a !important;
  }
  
  .dept-results-table .ant-table-tbody > tr[data-row-key="TOTAL"]:hover > td {
    background-color: #16a34a !important;
  }
  
  .dept-results-table .ant-table-tbody > tr[data-row-key="TOTAL"] > td[data-index*="score"] {
    background-color: #22c55e !important;
    color: white !important;
  }
  
  .dept-results-table .ant-table-tbody > tr[data-row-key="TOTAL"]:hover > td[data-index*="score"] {
    background-color: #16a34a !important;
  }
`;

export function DepartmentDetailsModal({
  isOpen,
  onClose,
  departmentData,
  onPublish,
  onCancel,
  isUser = false,
}: DepartmentDetailsModalProps) {
  const [departmentAggregatedData, setDepartmentAggregatedData] =
    useState<DepartmentAggregatedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // États pour les actions de publication/consolidation
  const [showPublishAlert, setShowPublishAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const loadDepartmentData = useCallback(async () => {
    if (!departmentData) {
      console.warn("⚠️ [DepartmentDetailsModal] Pas de departmentData fourni");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.warn(
        "🔄 [DepartmentDetailsModal] Chargement des données pour:",
        departmentData.codeDepartement
      );

      const data = await publicationsApi.getDepartmentData(
        departmentData.codeDepartement
      );
      console.warn("📥 [DepartmentDetailsModal] Données reçues:", data);

      // ✅ CORRECTION : Support des communes (entities) et départements (departments)
      const entityData = data?.entities?.[0] || data?.departments?.[0];

      if (entityData) {
        setDepartmentAggregatedData(entityData);
      } else {
        console.error(
          "❌ [DepartmentDetailsModal] Aucune donnée trouvée dans la réponse:",
          data
        );
        setError("Aucune donnée trouvée pour ce département");
      }
    } catch (err: unknown) {
      console.error(
        "❌ [DepartmentDetailsModal] Erreur lors du chargement:",
        err
      );
      console.error("❌ [DepartmentDetailsModal] Détails de l'erreur:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        (err as Error)?.message || "Erreur lors du chargement des données"
      );
    } finally {
      setLoading(false);
    }
  }, [departmentData]);

  useEffect(() => {
    if (isOpen && departmentData) {
      loadDepartmentData();
    } else {
      console.warn("⚠️ [DepartmentDetailsModal] Conditions non remplies:", {
        isOpen,
        hasDepartmentData: !!departmentData,
      });
    }
  }, [isOpen, departmentData, loadDepartmentData]);

  useEffect(() => {
    if (departmentAggregatedData) {
      // Mettre à jour la largeur de la barre de progression
      const progressBar = document.querySelector("[data-width]") as HTMLElement;
      if (progressBar) {
        const width = progressBar.getAttribute("data-width");
        if (width) {
          progressBar.style.width = `${width}%`;
        }
      }
    }
  }, [departmentAggregatedData]);

  // Injecter les styles CSS
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = tableStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const formatNumber = (value: string | number): string => {
    const num = typeof value === "string" ? parseInt(value) || 0 : value;
    return num.toLocaleString("fr-FR");
  };

  const formatPercentage = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) || 0 : value;
    return `${num.toFixed(2)}%`;
  };

  // Adaptation des termes selon le rôle
  const publishAction = isUser ? "Consolider" : "Publier";
  const publishActionLower = isUser ? "consolider" : "publier";
  const _publishActionPast = isUser ? "consolidé" : "publié";
  const publishActionPastFeminine = isUser ? "consolidée" : "publiée";
  const publishActionGerund = isUser ? "consolidation" : "publication";

  // Vérifier si un département peut être publié/consolidé
  const canPublishDepartment = () => {
    if (!departmentData || departmentData.publicationStatus === "PUBLISHED") {
      return false;
    }

    // ✅ EXCEPTION : Pour le département 999 (DIASPORA), permettre la publication si 18 CELs sont importées
    // (car 2 CELs n'ont pas de résultats)
    const codeDept = String(departmentData.codeDepartement).trim();
    const isDiaspora =
      codeDept === "999" || codeDept === "999.0" || parseInt(codeDept) === 999;

    if (isDiaspora) {
      const canPublish = departmentData.importedCels >= 18;
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "🔍 [DepartmentDetailsModal] Département 999 (DIASPORA):",
          {
            codeDepartement: departmentData.codeDepartement,
            importedCels: departmentData.importedCels,
            pendingCels: departmentData.pendingCels,
            totalCels: departmentData.totalCels,
            canPublish,
          }
        );
      }
      return canPublish;
    }

    // Pour les autres départements, exiger que toutes les CELs soient importées
    return departmentData.pendingCels === 0;
  };

  // Vérifier si l'importation de fichier consolidé est disponible
  const canImportConsolidatedFile = () => {
    return departmentData && departmentData.pendingCels === 0;
  };

  // Gestion des actions
  const handlePublishClick = () => {
    setShowPublishAlert(true);
  };

  const handleCancelClick = () => {
    setShowCancelAlert(true);
  };

  const handleUploadClick = () => {
    setShowUploadDialog(true);
    setUploadMessage({ type: null, text: "" });
    setSelectedFile(null);
  };

  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setUploadMessage({ type: null, text: "" });
    setSelectedFile(null);
  };

  const confirmPublish = async () => {
    if (departmentData && onPublish) {
      await onPublish(departmentData);
      setShowPublishAlert(false);
      onClose();
    }
  };

  const confirmCancel = async () => {
    if (departmentData && onCancel) {
      await onCancel(departmentData);
      setShowCancelAlert(false);
      onClose();
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !departmentData || uploadLoading) return;

    try {
      setUploadLoading(true);
      setUploadMessage({ type: null, text: "" });

      // ✅ SÉCURITÉ : Vérifier le token avant l'upload
      const { ensureValidToken } = await import("@/lib/utils/session-helper");
      const tokenCheck = await ensureValidToken();

      if (!tokenCheck.isValid) {
        toast.error(
          tokenCheck.message || "Session expirée. Veuillez vous reconnecter."
        );
        setTimeout(() => {
          window.location.href =
            "/auth/login?redirect=/publications&reason=session_expired";
        }, 2000);
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("reference", departmentData.id);

      // ✅ Envoyer directement au backend NestJS
      const { uploadClient } = await import("@/lib/api/client");
      const response = await uploadClient.post(
        "/upload/consolidation",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      console.warn("✅ Fichier consolidé uploadé avec succès:", {
        file: selectedFile.name,
        department: departmentData.libelleDepartement,
        size: selectedFile.size,
        result,
      });

      // Message de succès
      setUploadMessage({
        type: "success",
        text: `Fichier "${selectedFile.name}" uploadé avec succès pour le département ${departmentData.libelleDepartement}`,
      });

      // Afficher le toast de succès
      toast.success("Fichier consolidé uploadé avec succès", {
        description: `Le fichier "${selectedFile.name}" a été uploadé pour le département ${departmentData.libelleDepartement}`,
        duration: 5000,
      });

      // Fermer le dialog après un délai
      setTimeout(() => {
        setShowUploadDialog(false);
        setSelectedFile(null);
        setUploadMessage({ type: null, text: "" });
        onClose();
      }, 2000);
    } catch (error: unknown) {
      console.error("❌ Erreur lors de l'upload:", error);

      let errorMessage = "Une erreur inattendue s'est produite";

      if (error.response) {
        // Erreur de réponse du serveur
        const errorResponse = error as {
          response?: {
            data?: { message?: string; error?: string };
            status?: number;
          };
        };
        errorMessage =
          errorResponse.response?.data?.message ||
          errorResponse.response?.data?.error ||
          `Erreur serveur (${errorResponse.response?.status})`;
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage = "Pas de réponse du serveur. Vérifiez votre connexion.";
      } else {
        // Autre erreur
        errorMessage = (error as Error)?.message || errorMessage;
      }

      // Message d'erreur
      setUploadMessage({
        type: "error",
        text: `Erreur lors de l'upload: ${errorMessage}`,
      });

      // Afficher le toast d'erreur
      toast.error("Erreur lors de l'upload", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const formatNumberForPDF = (value: string | number): string => {
    const num = typeof value === "string" ? parseInt(value) || 0 : value;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Fonction pour calculer les totaux des CELs
  const calculateTotals = (data: CelAggregatedData[]): CelAggregatedData => {
    const totals = data.reduce(
      (acc, item) => {
        acc.populationHommes += item.populationHommes || 0;
        acc.populationFemmes += item.populationFemmes || 0;
        acc.populationTotale += item.populationTotale || 0;
        acc.personnesAstreintes += item.personnesAstreintes || 0;
        acc.votantsHommes += item.votantsHommes || 0;
        acc.votantsFemmes += item.votantsFemmes || 0;
        acc.totalVotants += item.totalVotants || 0;
        acc.bulletinsNuls += item.bulletinsNuls || 0;
        acc.suffrageExprime += item.suffrageExprime || 0;
        acc.bulletinsBlancs += item.bulletinsBlancs || 0;
        acc.score1 += item.score1 || 0;
        acc.score2 += item.score2 || 0;
        acc.score3 += item.score3 || 0;
        acc.score4 += item.score4 || 0;
        acc.score5 += item.score5 || 0;
        acc.nombreBureaux += item.nombreBureaux || 0;

        return acc;
      },
      {
        populationHommes: 0,
        populationFemmes: 0,
        populationTotale: 0,
        personnesAstreintes: 0,
        votantsHommes: 0,
        votantsFemmes: 0,
        totalVotants: 0,
        bulletinsNuls: 0,
        suffrageExprime: 0,
        bulletinsBlancs: 0,
        score1: 0,
        score2: 0,
        score3: 0,
        score4: 0,
        score5: 0,
        nombreBureaux: 0,
      }
    );

    // Calculer le taux de participation global
    const tauxParticipation =
      totals.populationTotale > 0
        ? (totals.totalVotants / totals.populationTotale) * 100
        : 0;

    return {
      codeCellule: "TOTAL",
      libelleCellule: "TOTAL GÉNÉRAL",
      populationHommes: totals.populationHommes,
      populationFemmes: totals.populationFemmes,
      populationTotale: totals.populationTotale,
      personnesAstreintes: totals.personnesAstreintes,
      votantsHommes: totals.votantsHommes,
      votantsFemmes: totals.votantsFemmes,
      totalVotants: totals.totalVotants,
      tauxParticipation: tauxParticipation,
      bulletinsNuls: totals.bulletinsNuls,
      suffrageExprime: totals.suffrageExprime,
      bulletinsBlancs: totals.bulletinsBlancs,
      score1: totals.score1,
      score2: totals.score2,
      score3: totals.score3,
      score4: totals.score4,
      score5: totals.score5,
      nombreBureaux: totals.nombreBureaux,
    };
  };

  // Configuration des colonnes Ant Design avec en-têtes multi-niveaux
  const columns: TableColumnsType<CelAggregatedData> = useMemo(
    () => [
      {
        title: "ORD",
        dataIndex: "codeCellule",
        key: "codeCellule",
        width: 80,
        align: "center",
        render: (value: string, record: CelAggregatedData) =>
          record.codeCellule === "TOTAL" ? (
            <Badge variant="default" className="text-sm bg-green-600 font-bold">
              {value}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-sm">
              {value}
            </Badge>
          ),
      },
      {
        title: "COMMISSION LOCALE",
        dataIndex: "libelleCellule",
        key: "libelleCellule",
        width: 250,
        render: (value: string, record: CelAggregatedData) =>
          record.codeCellule === "TOTAL" ? (
            <div className="font-bold text-sm text-white">{value}</div>
          ) : (
            <div className="font-medium text-sm">{value}</div>
          ),
      },
      {
        title: "NB BV",
        dataIndex: "nombreBureaux",
        key: "nombreBureaux",
        width: 80,
        align: "center",
        render: (value: number, record: CelAggregatedData) =>
          record.codeCellule === "TOTAL" ? (
            <Badge variant="default" className="text-sm bg-green-600 font-bold">
              {value}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-sm">
              {value}
            </Badge>
          ),
      },
      {
        title: "POPULATION ELECTORALE",
        children: [
          {
            title: "HOMMES",
            dataIndex: "populationHommes",
            key: "populationHommes",
            width: 100,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {formatNumber(value)}
              </div>
            ),
          },
          {
            title: "FEMMES",
            dataIndex: "populationFemmes",
            key: "populationFemmes",
            width: 100,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {formatNumber(value)}
              </div>
            ),
          },
          {
            title: "TOTAL",
            dataIndex: "populationTotale",
            key: "populationTotale",
            width: 100,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`font-bold text-sm ${
                  record.codeCellule === "TOTAL" ? "text-white" : ""
                }`}
              >
                {formatNumber(value)}
              </div>
            ),
          },
        ],
      },
      {
        title: "PERS. ASTREINTE",
        dataIndex: "personnesAstreintes",
        key: "personnesAstreintes",
        width: 120,
        align: "center",
        render: (value: number, record: CelAggregatedData) => (
          <div
            className={`text-sm ${
              record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
            }`}
          >
            {formatNumber(value || 0)}
          </div>
        ),
      },
      {
        title: "VOTANTS",
        children: [
          {
            title: "HOMMES",
            dataIndex: "votantsHommes",
            key: "votantsHommes",
            width: 100,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {formatNumber(value)}
              </div>
            ),
          },
          {
            title: "FEMMES",
            dataIndex: "votantsFemmes",
            key: "votantsFemmes",
            width: 100,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {formatNumber(value)}
              </div>
            ),
          },
          {
            title: "TOTAL",
            dataIndex: "totalVotants",
            key: "totalVotants",
            width: 100,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`font-bold text-sm ${
                  record.codeCellule === "TOTAL" ? "text-white" : ""
                }`}
              >
                {formatNumber(value)}
              </div>
            ),
          },
        ],
      },
      {
        title: "TAUX DE PARTICIPATION",
        dataIndex: "tauxParticipation",
        key: "tauxParticipation",
        width: 120,
        align: "center",
        render: (value: number, record: CelAggregatedData) => (
          <div
            className={`text-sm font-medium ${
              record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
            }`}
          >
            {formatPercentage(value)}
          </div>
        ),
      },
      {
        title: "BULLETINS NULS",
        dataIndex: "bulletinsNuls",
        key: "bulletinsNuls",
        width: 100,
        align: "center",
        render: (value: number, record: CelAggregatedData) => (
          <div
            className={`text-sm ${
              record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
            }`}
          >
            {formatNumber(value)}
          </div>
        ),
      },
      {
        title: "SUFFRAGES EXPRIMES",
        dataIndex: "suffrageExprime",
        key: "suffrageExprime",
        width: 120,
        align: "center",
        render: (value: number, record: CelAggregatedData) => (
          <div
            className={`text-sm ${
              record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
            }`}
          >
            <div
              className={`font-medium ${
                record.codeCellule === "TOTAL" ? "text-white" : ""
              }`}
            >
              {formatNumber(value)}
            </div>
            {record.codeCellule !== "TOTAL" && record.bulletinsBlancs > 0 && (
              <div className="text-xs text-muted-foreground">
                Blancs: {formatNumber(record.bulletinsBlancs)}
              </div>
            )}
            {record.codeCellule !== "TOTAL" && record.bulletinsNuls > 0 && (
              <div className="text-xs text-red-600">
                Nuls: {formatNumber(record.bulletinsNuls)}
              </div>
            )}
          </div>
        ),
      },
      {
        title: "BULLETINS BLANCS",
        dataIndex: "bulletinsBlancs",
        key: "bulletinsBlancs",
        width: 100,
        align: "center",
        render: (value: number, record: CelAggregatedData) => (
          <div
            className={`text-sm ${
              record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
            }`}
          >
            {formatNumber(value)}
          </div>
        ),
      },
      {
        title: "RHDP",
        children: [
          {
            title: "ALASSANE OUATTARA",
            dataIndex: "score1",
            key: "score1",
            width: 120,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm font-medium ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {value > 0 ? formatNumber(value) : "0"}
              </div>
            ),
          },
        ],
      },
      {
        title: "MGC",
        children: [
          {
            title: "EHIVET SIMONE épouse GBAGBO",
            dataIndex: "score2",
            key: "score2",
            width: 120,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm font-medium ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {value > 0 ? formatNumber(value) : "0"}
              </div>
            ),
          },
        ],
      },
      {
        title: "GP-PAIX",
        children: [
          {
            title: "LAGOU ADJOUA HENRIETTE",
            dataIndex: "score3",
            key: "score3",
            width: 120,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm font-medium ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {value > 0 ? formatNumber(value) : "0"}
              </div>
            ),
          },
        ],
      },
      {
        title: "CODE",
        children: [
          {
            title: "BILLON JEAN-LOUIS EUGENE",
            dataIndex: "score4",
            key: "score4",
            width: 120,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm font-medium ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {value > 0 ? formatNumber(value) : "0"}
              </div>
            ),
          },
        ],
      },
      {
        title: "INDEPENDANT",
        children: [
          {
            title: "DON-MELLO SENIN AHOUA JACOB",
            dataIndex: "score5",
            key: "score5",
            width: 120,
            align: "center",
            render: (value: number, record: CelAggregatedData) => (
              <div
                className={`text-sm font-medium ${
                  record.codeCellule === "TOTAL" ? "text-white font-bold" : ""
                }`}
              >
                {value > 0 ? formatNumber(value) : "0"}
              </div>
            ),
          },
        ],
      },
    ],
    []
  );

  // Données filtrées pour la recherche avec ligne de totaux
  const filteredData = useMemo(() => {
    if (!departmentAggregatedData?.cels) return [];

    let data = departmentAggregatedData.cels;

    if (searchText) {
      data = data.filter(
        (item) =>
          item.codeCellule.toLowerCase().includes(searchText.toLowerCase()) ||
          item.libelleCellule.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Ajouter la ligne de totaux au début
    const totalsRow = calculateTotals(data);
    return [totalsRow, ...data];
  }, [departmentAggregatedData?.cels, searchText]);

  const exportToPDFWithImages = async () => {
    if (!departmentAggregatedData || !departmentData || pdfLoading) return;

    try {
      setPdfLoading(true);
      // Import dynamique de jsPDF
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF("landscape", "mm", "a3");

      // Ajouter le logo CEI (à gauche)
      try {
        const logoResponse = await fetch("/images/logos/logocei2.webp");
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });

        // Ajouter l'image du logo (position: x=14, y=10, taille: 40x30)
        doc.addImage(logoDataUrl, "WEBP", 14, 10, 30, 30);
      } catch (error) {
        console.warn("Impossible de charger le logo CEI:", error);
      }

      // En-tête du document (décalé à droite pour laisser place au logo)
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(`ELECTION DU PRESIDENT DE LA REPUBLIQUE`, 60, 20);
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(`SCRUTIN DU 25 OCTOBRE 2025`, 60, 28);

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(
        `DEPARTEMENT - ${departmentData.codeDepartement} ${departmentData.libelleDepartement}`,
        60,
        38
      );

      // Calculer les totaux
      const totalsRow = calculateTotals(departmentAggregatedData.cels);

      // Titre Section 1: Statistiques principales
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("STATISTIQUES PRINCIPALES", 14, 50);

      // Section 1: Statistiques principales
      let startY = 60;

      // Carte Inscrits
      doc.setFillColor(59, 130, 246); // Bleu
      doc.rect(14, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INSCRITS", 18, startY + 8);
      doc.setFontSize(16);
      doc.text(
        formatNumberForPDF(departmentAggregatedData.inscrits),
        18,
        startY + 18
      );

      // Carte Personnel d'astreinte
      doc.setFillColor(251, 146, 60); // Orange
      doc.rect(105, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PERSONNEL", 109, startY + 6);
      doc.text("D'ASTREINTE", 109, startY + 12);
      doc.setFontSize(16);
      doc.text(
        formatNumberForPDF(totalsRow.personnesAstreintes || 0),
        109,
        startY + 22
      );

      // Carte Votants
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(196, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("VOTANTS", 200, startY + 8);
      doc.setFontSize(16);
      doc.text(
        formatNumberForPDF(departmentAggregatedData.votants),
        200,
        startY + 18
      );

      // Carte Participation
      doc.setFillColor(168, 85, 247); // Violet
      doc.rect(287, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TAUX DE", 291, startY + 6);
      doc.text("PARTICIPATION", 291, startY + 12);
      doc.setFontSize(16);
      doc.text(
        `${departmentAggregatedData.participation.toFixed(2)}%`,
        291,
        startY + 22
      );

      // Titre Section 2: Bulletins
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETINS DE VOTE", 14, 100);

      // Section 2: Bulletins
      startY = 105;

      // Carte Bulletins Nuls
      doc.setFillColor(239, 68, 68); // Rouge
      doc.rect(14, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETINS", 18, startY + 6);
      doc.text("NULS", 18, startY + 12);
      doc.setFontSize(16);
      doc.text(formatNumberForPDF(totalsRow.bulletinsNuls), 18, startY + 22);

      // Carte Suffrages Exprimés
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(105, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SUFFRAGES", 109, startY + 6);
      doc.text("EXPRIMÉS", 109, startY + 12);
      doc.setFontSize(16);
      doc.text(formatNumberForPDF(totalsRow.suffrageExprime), 109, startY + 22);

      // Carte Bulletins Blancs
      doc.setFillColor(107, 114, 128); // Gris
      doc.rect(196, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETINS", 200, startY + 6);
      doc.text("BLANCS", 200, startY + 12);
      doc.setFontSize(16);
      doc.text(formatNumberForPDF(totalsRow.bulletinsBlancs), 200, startY + 22);

      // Titre Section 3: Candidats
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RÉSULTATS", 14, 145);

      // Section 3: Candidats
      startY = 155;
      const candidateWidth = 70;
      const candidateSpacing = 75;

      // Calculer les pourcentages et déterminer le vainqueur
      const totalSuffrages = totalsRow.suffrageExprime;
      const candidates = [
        {
          name: "ALASSANE OUATTARA",
          party: "RHDP",
          logo: "/images/candidates/logo-alassane.jpg",
          photo: "/images/candidates/photo-alassane.jpg",
          score: totalsRow.score1,
          percentage:
            totalSuffrages > 0
              ? ((totalsRow.score1 / totalSuffrages) * 100).toFixed(2)
              : "0.00",
        },
        {
          name: "EHIVET SIMONE épouse GBAGBO",
          party: "MGC",
          logo: "/images/candidates/logo-simone.png",
          photo: "/images/candidates/photo-simone.jpg",
          score: totalsRow.score2,
          percentage:
            totalSuffrages > 0
              ? ((totalsRow.score2 / totalSuffrages) * 100).toFixed(2)
              : "0.00",
        },
        {
          name: "LAGOU ADJOUA HENRIETTE",
          party: "GP-PAIX",
          logo: "/images/candidates/logo-henriette.jpg",
          photo: "/images/candidates/photo-henriette.jpg",
          score: totalsRow.score3,
          percentage:
            totalSuffrages > 0
              ? ((totalsRow.score3 / totalSuffrages) * 100).toFixed(2)
              : "0.00",
        },
        {
          name: "BILLON JEAN-LOUIS EUGENE",
          party: "CODE",
          logo: "/images/candidates/logo-jean-louis.JPG",
          photo: "/images/candidates/photo-jean-louis.jpg",
          score: totalsRow.score4,
          percentage:
            totalSuffrages > 0
              ? ((totalsRow.score4 / totalSuffrages) * 100).toFixed(2)
              : "0.00",
        },
        {
          name: "DON-MELLO SENIN AHOUA JACOB",
          party: "INDEPENDANT",
          logo: "/images/candidates/logo-ahoua.JPG",
          photo: "/images/candidates/photo-ahoua.jpg",
          score: totalsRow.score5,
          percentage:
            totalSuffrages > 0
              ? ((totalsRow.score5 / totalSuffrages) * 100).toFixed(2)
              : "0.00",
        },
      ];

      // Déterminer le vainqueur ou égalité
      const maxScore = Math.max(...candidates.map((c) => c.score));
      const winners = candidates.filter(
        (c) => c.score === maxScore && c.score > 0
      );
      const isTie = winners.length > 1;

      // Dessiner les cartes des candidats
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const x = 14 + i * candidateSpacing;

        // Carte du candidat
        doc.setFillColor(255, 255, 255); // Blanc
        doc.rect(x, startY, candidateWidth, 50, "F");
        doc.setDrawColor(0, 0, 0); // Bordure noire
        doc.rect(x, startY, candidateWidth, 50, "S");

        // Logo du candidat
        try {
          const logoResponse = await fetch(candidate.logo);
          const logoBlob = await logoResponse.blob();
          const logoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });

          const logoExtension =
            candidate.logo.split(".").pop()?.toUpperCase() || "JPG";
          doc.addImage(
            logoDataUrl,
            logoExtension as "JPG" | "PNG" | "WEBP",
            x + 2,
            startY + 2,
            15,
            15
          );
        } catch (error) {
          console.warn(
            `Impossible de charger le logo de ${candidate.name}:`,
            error
          );
        }

        // Photo du candidat
        try {
          const photoResponse = await fetch(candidate.photo);
          const photoBlob = await photoResponse.blob();
          const photoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(photoBlob);
          });

          const photoExtension =
            candidate.photo.split(".").pop()?.toUpperCase() || "JPG";
          doc.addImage(
            photoDataUrl,
            photoExtension as "JPG" | "PNG" | "WEBP",
            x + 2,
            startY + 18,
            25,
            30
          );
        } catch (error) {
          console.warn(
            `Impossible de charger la photo de ${candidate.name}:`,
            error
          );
        }

        // Nom du candidat et parti
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(candidate.party, x + 30, startY + 8);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const nameLines = doc.splitTextToSize(
          candidate.name,
          candidateWidth - 35
        );
        doc.text(nameLines, x + 30, startY + 12);

        // Score et pourcentage
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(formatNumberForPDF(candidate.score), x + 30, startY + 25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("VOIX", x + 30, startY + 30);

        // Pourcentage
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${candidate.percentage}%`, x + 30, startY + 38);

        // Indicateur vainqueur/égalité
        const isWinner = winners.some(
          (w) => w.name === candidate.name && w.score === candidate.score
        );
        if (isWinner) {
          if (isTie) {
            // Égalité - bordure dorée
            doc.setDrawColor(255, 215, 0);
            doc.setLineWidth(3);
            doc.rect(x, startY, candidateWidth, 50, "S");
            doc.setFontSize(6);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 215, 0);
            doc.text("ÉGALITÉ", x + 2, startY - 2);
          } else {
            // Vainqueur - bordure verte
            doc.setDrawColor(34, 197, 94);
            doc.setLineWidth(3);
            doc.rect(x, startY, candidateWidth, 50, "S");
            doc.setFontSize(6);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(34, 197, 94);
            doc.text("VAINQUEUR", x + 2, startY - 2);
          }
        }

        // Réinitialiser les styles
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.setTextColor(0, 0, 0);
      }

      // Sauvegarder le PDF
      doc.save(
        `DEPARTEMENT_${departmentData.libelleDepartement}_AVEC_IMAGES_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF avec images:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!departmentAggregatedData || !departmentData || pdfLoading) return;

    try {
      setPdfLoading(true);
      // Import dynamique de jsPDF
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF("landscape", "mm", "a3");

      // Ajouter le logo (à gauche)
      try {
        const logoResponse = await fetch("/images/logos/logocei2.webp");
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });

        // Ajouter l'image du logo (position: x=14, y=10, taille: 40x30)
        doc.addImage(logoDataUrl, "WEBP", 14, 10, 30, 30);
      } catch (error) {
        console.warn("Impossible de charger le logo:", error);
      }

      // En-tête du document (décalé à droite pour laisser place au logo)
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(`ELECTION DU PRESIDENT DE LA REPUBLIQUE`, 60, 20);
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(`SCRUTIN DU 25 OCTOBRE 2025`, 60, 28);

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(
        `DEPARTEMENT - ${departmentData.codeDepartement} ${departmentData.libelleDepartement}`,
        60,
        38
      );

      // Calculer les totaux par sexe à partir des CELs
      const totalsBySex = departmentAggregatedData.cels.reduce(
        (acc, cel) => {
          acc.inscritsHommes += cel.populationHommes || 0;
          acc.inscritsFemmes += cel.populationFemmes || 0;
          acc.votantsHommes += cel.votantsHommes || 0;
          acc.votantsFemmes += cel.votantsFemmes || 0;
          return acc;
        },
        {
          inscritsHommes: 0,
          inscritsFemmes: 0,
          votantsHommes: 0,
          votantsFemmes: 0,
        }
      );

      // Statistiques globales - Disposition en cartes
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Statistiques Globales", 14, 55);

      // Position de départ
      const startY = 65;

      // Carte Inscrits
      doc.setFillColor(59, 130, 246); // Bleu
      doc.rect(14, startY, 85, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("INSCRITS", 18, startY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Hommes: ${formatNumberForPDF(totalsBySex.inscritsHommes)}`,
        18,
        startY + 10
      );
      doc.text(
        `Femmes: ${formatNumberForPDF(totalsBySex.inscritsFemmes)}`,
        18,
        startY + 14
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total: ${formatNumberForPDF(departmentAggregatedData.inscrits)}`,
        18,
        startY + 21
      );

      // Carte Personnel d'astreinte
      doc.setFillColor(251, 146, 60); // Orange
      doc.rect(105, startY, 85, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("PERSONNEL D'ASTREINTE", 109, startY + 6);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const totalPersonnelAstreinte = departmentAggregatedData.cels.reduce(
        (acc, cel) => acc + (cel.personnesAstreintes || 0),
        0
      );
      doc.text(totalPersonnelAstreinte.toString(), 109, startY + 16);

      // Carte Votants
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(196, startY, 85, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("VOTANTS", 200, startY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Hommes: ${formatNumberForPDF(totalsBySex.votantsHommes)}`,
        200,
        startY + 10
      );
      doc.text(
        `Femmes: ${formatNumberForPDF(totalsBySex.votantsFemmes)}`,
        200,
        startY + 14
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total: ${formatNumberForPDF(departmentAggregatedData.votants)}`,
        200,
        startY + 21
      );

      // Carte Participation
      doc.setFillColor(168, 85, 247); // Violet
      doc.rect(287, startY, 85, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TAUX DE PARTICIPATION", 291, startY + 6);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${departmentAggregatedData.participation.toFixed(2)}%`,
        291,
        startY + 16
      );

      // Réinitialiser la couleur du texte pour la suite
      doc.setTextColor(0, 0, 0);

      // Tableau détaillé des CELs avec jsPDF AutoTable (design optimisé)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Détail par Commission Électorale Locale", 14, 95);

      const totalsRow = calculateTotals(departmentAggregatedData.cels);
      const tableData = [totalsRow, ...departmentAggregatedData.cels].map(
        (cel) => [
          cel.codeCellule,
          cel.libelleCellule,
          cel.nombreBureaux,
          formatNumberForPDF(cel.populationHommes),
          formatNumberForPDF(cel.populationFemmes),
          formatNumberForPDF(cel.populationTotale),
          formatNumberForPDF(cel.personnesAstreintes || 0),
          formatNumberForPDF(cel.votantsHommes),
          formatNumberForPDF(cel.votantsFemmes),
          formatNumberForPDF(cel.totalVotants),
          formatPercentage(cel.tauxParticipation),
          formatNumberForPDF(cel.bulletinsNuls),
          formatNumberForPDF(cel.suffrageExprime),
          formatNumberForPDF(cel.bulletinsBlancs),
          cel.score1 > 0 ? formatNumberForPDF(cel.score1) : "0",
          cel.score2 > 0 ? formatNumberForPDF(cel.score2) : "0",
          cel.score3 > 0 ? formatNumberForPDF(cel.score3) : "0",
          cel.score4 > 0 ? formatNumberForPDF(cel.score4) : "0",
          cel.score5 > 0 ? formatNumberForPDF(cel.score5) : "0",
        ]
      );

      autoTable(doc, {
        startY: 100,
        head: [
          [
            {
              content: "ORD",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "COMMISSION LOCALE",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "NB BV",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "POPULATION ELECTORALE",
              colSpan: 3,
              styles: { halign: "center", fillColor: [111, 221, 111] },
            },
            {
              content: "PERS. ASTREINTE",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "VOTANTS",
              colSpan: 3,
              styles: { halign: "center", fillColor: [111, 221, 111] },
            },
            {
              content: "TAUX PARTICIPATION",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "BULLETINS NULS",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "SUFFRAGES EXPRIMES",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "BULLETINS BLANCS",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "RHDP",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "MGC",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "GP-PAIX",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "CODE",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "INDEPENDANT",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
          ],
          ["HOMMES", "FEMMES", "TOTAL", "HOMMES", "FEMMES", "TOTAL"],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [111, 221, 111],
          textColor: [0, 0, 0],
          fontSize: 8,
          halign: "center",
          fontStyle: "bold",
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 15 }, // ORD
          1: { cellWidth: 40, halign: "left" }, // COMMISSION LOCALE
          2: { cellWidth: 15 }, // NB BV
          3: { cellWidth: 20 }, // POPULATION HOMMES
          4: { cellWidth: 20 }, // POPULATION FEMMES
          5: { cellWidth: 20 }, // POPULATION TOTAL
          6: { cellWidth: 20 }, // PERS. ASTREINTE
          7: { cellWidth: 20 }, // VOTANTS HOMMES
          8: { cellWidth: 20 }, // VOTANTS FEMMES
          9: { cellWidth: 20 }, // VOTANTS TOTAL
          10: { cellWidth: 20 }, // TAUX PARTICIPATION
          11: { cellWidth: 18 }, // BULLETINS NULS
          12: { cellWidth: 22 }, // SUFFRAGES EXPRIMES
          13: { cellWidth: 20 }, // BULLETINS BLANCS
          14: { cellWidth: 20 }, // RHDP
          15: { cellWidth: 20 }, // MGC
          16: { cellWidth: 20 }, // GP-PAIX
          17: { cellWidth: 20 }, // CODE
          18: { cellWidth: 20 }, // INDEPENDANT
        },
        didParseCell: (data) => {
          // Mettre en gras et en vert la première ligne (totaux)
          if (data.row.index === 0 && data.section === "body") {
            data.cell.styles.fillColor = [34, 197, 94]; // Vert #22c55e
            data.cell.styles.textColor = [255, 255, 255]; // Blanc
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      // Sauvegarder le PDF
      doc.save(
        `DEPARTEMENT_${departmentData.libelleDepartement}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  if (!departmentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building2 className="h-6 w-6 text-green-600" />
                <span className="uppercase font-light">Département : </span>
                <span className="font-black text-green-600">
                  {departmentData.libelleDepartement}{" "}
                </span>
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                <span className="inline-flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    Code:{" "}
                    <span className="font-semibold text-green-600">
                      {departmentData.codeDepartement}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Statut:{" "}
                    <span className="font-semibold text-green-600">
                      {departmentData.publicationStatus}
                    </span>
                  </span>
                </span>
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Bouton fermer toujours visible */}
              <Button variant="outline" onClick={onClose} size="sm">
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>

              {/* Autres boutons seulement si données chargées */}
              {departmentAggregatedData && !loading && (
                <>
                  {/* Actions de publication/consolidation */}
                  {(() => {
                    const canPublish = canPublishDepartment();
                    if (process.env.NODE_ENV === "development") {
                      console.warn(
                        "🔍 [DepartmentDetailsModal] Conditions bouton Publier:",
                        {
                          isUser,
                          canPublish,
                          hasOnPublish: !!onPublish,
                          departmentData: departmentData
                            ? {
                                code: departmentData.codeDepartement,
                                status: departmentData.publicationStatus,
                                importedCels: departmentData.importedCels,
                                pendingCels: departmentData.pendingCels,
                                totalCels: departmentData.totalCels,
                              }
                            : null,
                        }
                      );
                    }
                    return !isUser && canPublish && onPublish;
                  })() && (
                    <Button
                      onClick={handlePublishClick}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {publishAction}
                    </Button>
                  )}

                  {!isUser &&
                    departmentData?.publicationStatus === "PUBLISHED" &&
                    onCancel && (
                      <Button
                        onClick={handleCancelClick}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                    )}

                  {/* Importation de fichier consolidé signé */}
                  {canImportConsolidatedFile() && (
                    <Button
                      onClick={handleUploadClick}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUser
                        ? "Importer fichier signé"
                        : "Importer consolidation signée"}
                    </Button>
                  )}

                  {/* Boutons d'export PDF */}
                  <Button
                    onClick={exportToPDFWithImages}
                    disabled={pdfLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    size="sm"
                  >
                    {pdfLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {pdfLoading ? "Génération..." : "Export PDF avec images"}
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    disabled={pdfLoading}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    size="sm"
                  >
                    {pdfLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {pdfLoading ? "Génération..." : "Exporter PDF"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto h-full ">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des données...</span>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erreur</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDepartmentData}
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Message de debug si pas de données */}
          {!loading && !error && !departmentAggregatedData && (
            <Card className="border-yellow-200 bg-yellow-50 m-4">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Aucune donnée chargée</span>
                </div>
                <p className="text-yellow-700 mt-2">
                  Les données du département n&apos;ont pas été chargées.
                  Vérifiez la console pour plus de détails.
                </p>
                <div className="mt-3 text-sm text-yellow-600">
                  <strong>Département :</strong>{" "}
                  {departmentData?.libelleDepartement} (
                  {departmentData?.codeDepartement})
                </div>
              </CardContent>
            </Card>
          )}

          {departmentAggregatedData && !loading && (
            <>
              {/* Tableau des CELs avec Ant Design Table */}
              <Card className="border-none shadow-none m-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                      Consolidation des résultats par CEL
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {departmentAggregatedData.cels?.length || 0} CELs
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="pl-10 w-56 h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {filteredData && filteredData.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={filteredData}
                      rowKey="codeCellule"
                      scroll={{ x: 2500, y: 400 }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} sur ${total} résultats`,
                      }}
                      size="small"
                      bordered
                      className="dept-results-table"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune donnée à afficher pour ce département</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t bg-gray-50 px-6 py-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total des CELs:</span>{" "}
            {departmentAggregatedData?.cels.length || 0} CELs
          </div>
          <div className="flex gap-2">
            {departmentAggregatedData && (
              <>
                <Button
                  onClick={exportToPDFWithImages}
                  disabled={pdfLoading}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                  size="sm"
                >
                  {pdfLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {pdfLoading ? "Génération..." : "Export PDF avec images"}
                </Button>
                <Button
                  onClick={exportToPDF}
                  disabled={pdfLoading}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50"
                  size="sm"
                >
                  {pdfLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {pdfLoading ? "Génération..." : "Exporter PDF"}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>

        {/* Alerte de confirmation pour la publication/consolidation */}
        <AlertDialog open={showPublishAlert} onOpenChange={setShowPublishAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Confirmer la {publishActionGerund}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir {publishActionLower} les résultats du
                département{" "}
                <strong>{departmentData?.libelleDepartement}</strong> ?
                <br />
                <br />
                {isUser
                  ? "Cette action consolidera les résultats et ne pourra pas être annulée facilement."
                  : "Cette action rendra les résultats publics et ne pourra pas être annulée facilement."}
                <br />
                <br />
                <span className="text-sm text-muted-foreground">
                  • {departmentData?.totalCels} CEL(s) au total
                  <br />• {departmentData?.importedCels} CEL(s) importées
                  <br />• {departmentData?.pendingCels} CEL(s) en attente
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmPublish}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer la {publishActionGerund}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Alerte de confirmation pour l'annulation */}
        <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirmer l&apos;annulation
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir annuler la {publishActionGerund} des
                résultats du département{" "}
                <strong>{departmentData?.libelleDepartement}</strong> ?
                <br />
                <br />
                {isUser
                  ? "Cette action annulera la consolidation des résultats."
                  : "Cette action retirera les résultats de la publication publique."}
                <br />
                <br />
                <span className="text-sm text-muted-foreground">
                  • {departmentData?.totalCels} CEL(s) au total
                  <br />• {departmentData?.importedCels} CEL(s) importées
                  <br />• Statut actuel : {publishActionPastFeminine}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Confirmer l&apos;annulation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog d'upload de fichier consolidé */}
        <AlertDialog
          open={showUploadDialog}
          onOpenChange={handleCloseUploadDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                {isUser
                  ? "Importer fichier consolidé signé"
                  : "Importer consolidation signée"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Téléchargez le fichier de consolidation signé par le superviseur
                pour le département{" "}
                <strong>{departmentData?.libelleDepartement}</strong>.
                <br />
                <br />
                <span className="text-sm text-muted-foreground">
                  • Formats acceptés : PDF, JPG, PNG
                  <br />• Taille maximale : 10 MB
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              {/* Loader pendant l'upload */}
              {uploadLoading && (
                <div className="flex items-center justify-center py-8 bg-blue-50 rounded-lg mb-4">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">
                      Upload en cours...
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Veuillez patienter pendant le téléchargement
                    </p>
                  </div>
                </div>
              )}

              {/* Message de feedback */}
              {uploadMessage.type && (
                <div
                  className={`rounded-lg p-4 mb-4 ${
                    uploadMessage.type === "success"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    {uploadMessage.type === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <p
                      className={`text-sm font-medium ${
                        uploadMessage.type === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {uploadMessage.text}
                    </p>
                  </div>
                </div>
              )}

              {!uploadLoading && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id="consolidation-file"
                      disabled={uploadLoading}
                    />
                    <label
                      htmlFor="consolidation-file"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        uploadLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </label>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          <strong>Fichier sélectionné :</strong>{" "}
                          {selectedFile.name}
                        </p>
                        <p>
                          <strong>Taille :</strong>{" "}
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={uploadLoading}
                onClick={handleCloseUploadDialog}
              >
                {uploadLoading ? "Fermer" : "Annuler"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFileUpload}
                disabled={!selectedFile || uploadLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {uploadLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploadLoading ? "Upload en cours..." : "Uploader le fichier"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
