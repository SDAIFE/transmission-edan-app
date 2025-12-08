"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { getCelData } from "@/lib/api/upload";
import type { CelDataResponse, CelData, ImportData } from "@/types/upload";

// Styles personnalisés pour le tableau
const tableStyles = `
  .cel-results-table .ant-table-thead > tr > th {
    background-color: #6FDD6F !important;
    border: 1px solid #d1d5db !important;
    font-weight: bold !important;
    text-align: center !important;
    padding: 8px 4px !important;
    font-size: 11px !important;
  }
  
  .cel-results-table .ant-table-thead > tr:first-child > th {
    background-color: #F49F60 !important;
    font-weight: bold !important;
  }
  
  .cel-results-table .ant-table-tbody > tr > td {
    border: 1px solid #d1d5db !important;
    padding: 6px 4px !important;
    font-size: 11px !important;
  }
  
  .cel-results-table .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #f9fafb !important;
  }
  
  .cel-results-table .ant-table-tbody > tr:hover > td {
    background-color: #f3f4f6 !important;
  }
  
  .cel-results-table .ant-table-thead > tr > th[data-index*="score"] {
    background-color: #dcfce7 !important;
    color: #166534 !important;
  }
  
  .cel-results-table .ant-table-tbody > tr > td[data-index*="score"] {
    background-color: #f0fdf4 !important;
    text-align: center !important;
  }
  
  /* Styles pour la ligne de totaux */
  .cel-results-table .ant-table-tbody > tr[data-row-key="totals"] {
    background-color: #22c55e !important;
  }
  
  .cel-results-table .ant-table-tbody > tr[data-row-key="totals"] > td {
    background-color: #22c55e !important;
    color: white !important;
    font-weight: bold !important;
    border: 2px solid #16a34a !important;
  }
  
  .cel-results-table .ant-table-tbody > tr[data-row-key="totals"]:hover {
    background-color: #16a34a !important;
  }
  
  .cel-results-table .ant-table-tbody > tr[data-row-key="totals"]:hover > td {
    background-color: #16a34a !important;
  }
  
  .cel-results-table .ant-table-tbody > tr[data-row-key="totals"] > td[data-index*="score"] {
    background-color: #22c55e !important;
    color: white !important;
  }
  
  .cel-results-table .ant-table-tbody > tr[data-row-key="totals"]:hover > td[data-index*="score"] {
    background-color: #16a34a !important;
  }
`;

interface CelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  importData: ImportData | null;
}

export function CelDetailsModal({
  isOpen,
  onClose,
  importData,
}: CelDetailsModalProps) {
  const [celData, setCelData] = useState<CelDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // États pour l'upload de fichier signé
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // Fonction pour charger les données CEL
  const loadCelData = async () => {
    if (!importData) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCelData(importData.codeCellule);
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("🔍 [CEL Details Modal] Données CEL chargées:", data);
      }
      setCelData(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des données";
      console.error("Erreur lors du chargement des données CEL:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && importData) {
      loadCelData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, importData]);

  useEffect(() => {
    if (celData) {
      // Mettre à jour la largeur de la barre de progression
      const progressBar = document.querySelector("[data-width]") as HTMLElement;
      if (progressBar) {
        const width = progressBar.getAttribute("data-width");
        if (width) {
          progressBar.style.width = `${width}%`;
        }
      }
    }
  }, [celData]);

  // Injecter les styles CSS
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = tableStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // ✅ Extraire les colonnes de candidats dynamiquement selon la documentation
  const candidateColumns = useMemo(() => {
    if (!celData?.data || celData.data.length === 0) return [];

    // Extraire les clés qui correspondent aux NUM_DOS des candidats
    // Format: "U-02108", "U-02122", etc. ou "XX-XXXXX" (selon la doc)
    const firstRow = celData.data[0];
    return Object.keys(firstRow).filter(
      (key) => key.startsWith("U-") || key.match(/^\d{2}-\d{5}$/) !== null
    );
  }, [celData]);

  // ✅ Calculer les vainqueurs et égalités à partir de la ligne de totaux
  const winnersAndTies = useMemo(() => {
    if (!celData?.data || celData.data.length === 0 || candidateColumns.length === 0) {
      return { winners: [], isTie: false };
    }

    // Calculer les totaux des scores de chaque candidat
    const candidateTotals = new Map<string, number>();
    
    celData.data.forEach((item) => {
      candidateColumns.forEach((numDos) => {
        const value = item[numDos];
        const numValue =
          typeof value === "number"
            ? value
            : parseFloat(String(value || 0)) || 0;
        candidateTotals.set(
          numDos,
          (candidateTotals.get(numDos) || 0) + numValue
        );
      });
    });

    // Construire la liste des candidats avec leurs scores totaux
    const candidates = Array.from(candidateTotals.entries())
      .map(([numDos, score]) => ({
        numDos,
        score,
      }))
      .filter((c) => c.score > 0); // Filtrer les candidats avec score > 0

    if (candidates.length === 0) {
      return { winners: [], isTie: false };
    }

    // Déterminer le score maximum
    const maxScore = Math.max(...candidates.map((c) => c.score));
    const winners = candidates.filter((c) => c.score === maxScore);

    return {
      winners: winners.map((w) => w.numDos),
      isTie: winners.length > 1,
    };
  }, [celData, candidateColumns]);

  const formatNumber = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) || 0 : value;
    return num.toLocaleString("fr-FR");
  };

  const formatNumberForPDF = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) || 0 : value;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const formatPercentage = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) || 0 : value;
    return num.toFixed(2).includes("%") ? num.toString() : `${num.toFixed(2)}%`;
  };

  // Gestion de l'upload de fichier signé
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

  // ✅ Validation du fichier avant upload (selon la documentation)
  const validateFile = (
    file: File,
    codeCel: string
  ): { valid: boolean; error?: string } => {
    // Vérifier le code CEL
    if (!codeCel || codeCel.trim() === "") {
      return { valid: false, error: "Le code CEL est requis" };
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Type de fichier invalide. Types autorisés : PDF, JPG, PNG",
      };
    }

    // Vérifier l'extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error:
          "Extension de fichier invalide. Extensions autorisées : pdf, jpg, jpeg, png",
      };
    }

    // Vérifier la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximale : 10MB. Taille actuelle : ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`,
      };
    }

    return { valid: true };
  };

  // ✅ Upload de fichier signé selon la documentation
  const handleFileUpload = async () => {
    if (!selectedFile || !importData || uploadLoading) return;

    try {
      setUploadLoading(true);
      setUploadMessage({ type: null, text: "" });

      // ✅ Validation du fichier avant upload
      const validation = validateFile(selectedFile, importData.codeCellule);
      if (!validation.valid) {
        setUploadMessage({
          type: "error",
          text: validation.error || "Erreur de validation",
        });
        toast.error("Erreur de validation", {
          description: validation.error,
          duration: 5000,
        });
        setUploadLoading(false);
        return;
      }

      // ✅ SÉCURITÉ : Vérifier le token avant l'upload
      const { ensureValidToken } = await import("@/lib/utils/session-helper");
      const tokenCheck = await ensureValidToken();

      if (!tokenCheck.isValid) {
        toast.error(
          tokenCheck.message || "Session expirée. Veuillez vous reconnecter."
        );
        setTimeout(() => {
          window.location.href =
            "/auth/login?redirect=/upload&reason=session_expired";
        }, 2000);
        return;
      }

      // ✅ Construire FormData selon la documentation
      const formData = new FormData();
      formData.append("signedFile", selectedFile); // ✅ Nom correct selon la doc
      formData.append("codeCel", importData.codeCellule); // ✅ Nom correct selon la doc

      // ✅ Ajouter codCe (code circonscription) si disponible
      if (importData.codeCirconscription) {
        formData.append("codCe", importData.codeCirconscription);
      }

      // ✅ Ajouter importId si disponible (optionnel)
      if (importData.id) {
        formData.append("importId", importData.id.toString());
      }

      // ✅ Ajouter description optionnelle
      const description = `Procès-verbal signé de la CEL ${importData.codeCellule}`;
      formData.append("description", description);

      // ✅ Envoyer directement au backend NestJS
      const { uploadClient } = await import("@/lib/api/client");
      const response = await uploadClient.post(
        "legislatives/upload/signed-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Réponse selon la documentation : SignedFileUploadResponse
      const result = response.data as {
        id: number;
        codeCel: string;
        codCe: string;
        signedFilePath: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        uploadedBy: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
        uploadedAt: string;
        downloadUrl: string;
      };

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("✅ Fichier CEL signé uploadé avec succès:", {
          file: selectedFile.name,
          cel: importData.codeCellule,
          size: selectedFile.size,
          result,
          downloadUrl: result.downloadUrl,
          uploadedAt: result.uploadedAt,
        });
      }

      // Message de succès avec informations de la réponse
      const uploadedDate = new Date(result.uploadedAt).toLocaleString("fr-FR");
      setUploadMessage({
        type: "success",
        text: `Fichier "${
          result.fileName || selectedFile.name
        }" uploadé avec succès pour la CEL ${
          importData.libelleCellule
        } le ${uploadedDate}`,
      });

      // Afficher le toast de succès
      toast.success("Fichier CEL signé uploadé avec succès", {
        description: `Le fichier "${result.fileName || selectedFile.name}" (${(
          result.fileSize /
          1024 /
          1024
        ).toFixed(2)} MB) a été uploadé pour la CEL ${
          importData.libelleCellule
        }`,
        duration: 5000,
      });

      // Fermer le dialog après un délai
      setTimeout(() => {
        setShowUploadDialog(false);
        setSelectedFile(null);
        setUploadMessage({ type: null, text: "" });
      }, 2000);
    } catch (error: any) {
      console.error("❌ Erreur lors de l'upload:", error);

      // ✅ Gestion détaillée des erreurs selon la documentation
      let errorMessage = "Une erreur inattendue s'est produite";
      let errorTitle = "Erreur lors de l'upload";

      if (error?.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "Erreur inconnue";

        switch (status) {
          case 400:
            // Fichier invalide ou données manquantes
            errorTitle = "Erreur de validation";
            errorMessage = `Erreur de validation : ${message}`;
            break;

          case 401:
            // Token expiré
            errorTitle = "Session expirée";
            errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
            toast.error(errorTitle, {
              description: errorMessage,
              duration: 5000,
            });
            setTimeout(() => {
              window.location.href =
                "/auth/login?redirect=/upload&reason=session_expired";
            }, 2000);
            setUploadLoading(false);
            return;

          case 403:
            // Accès refusé à la CEL
            errorTitle = "Accès interdit";
            errorMessage = "Vous n'avez pas accès à cette cellule électorale.";
            break;

          case 404:
            // CEL ou import non trouvé
            errorTitle = "Ressource non trouvée";
            errorMessage = `Ressource non trouvée : ${message}`;
            break;

          default:
            // Erreur serveur ou réseau
            errorTitle = "Erreur serveur";
            errorMessage = `Erreur lors de l'upload. Veuillez réessayer. (${message})`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Message d'erreur
      setUploadMessage({
        type: "error",
        text: `${errorTitle}: ${errorMessage}`,
      });

      // Afficher le toast d'erreur
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Configuration des colonnes Ant Design avec en-têtes multi-niveaux
  const columns: TableColumnsType<CelData> = useMemo(() => {
    const baseColumns: TableColumnsType<CelData> = [
      {
        title: "ORD",
        dataIndex: "ordre",
        key: "ordre",
        width: 60,
        align: "center",
        render: (value: number | string, record: CelData) =>
          String(record.id) === "totals" ? (
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
        title: "LIEU DE VOTE",
        dataIndex: "libelleLieuVote",
        key: "libelleLieuVote",
        width: 200,
        render: (value: string, record: CelData) =>
          String(record.id) === "totals" ? (
            <div className="font-bold text-sm ">{value}</div>
          ) : (
            <div>
              <div className="font-medium text-sm">{value}</div>
              <div className="text-sm text-muted-foreground">
                Ref: {record.referenceLieuVote}
              </div>
            </div>
          ),
        onCell: (record: CelData) => {
          if (String(record.id) === "totals") {
            return {
              colSpan: 1,
            };
          }
          return {};
        },
      },
      {
        title: "BV",
        dataIndex: "numeroBureauVote",
        key: "numeroBureauVote",
        width: 80,
        align: "center",
        render: (value: string, record: CelData) =>
          String(record.id) === "totals" ? (
            <Badge variant="default" className="text-sm bg-green-600 font-bold">
              {celData?.totalBureaux || 0}
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
            width: 80,
            align: "center",
            render: (value: number | string, record: CelData) => (
              <div
                className={`text-sm ${
                  String(record.id) === "totals" ? " font-bold" : ""
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
            width: 80,
            align: "center",
            render: (value: number | string, record: CelData) => (
              <div
                className={`text-sm ${
                  String(record.id) === "totals" ? " font-bold" : ""
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
            width: 80,
            align: "center",
            render: (value: number | string, record: CelData) => (
              <div
                className={`font-bold text-sm ${
                  String(record.id) === "totals" ? " font-bold" : ""
                }`}
              >
                {formatNumber(value)}
              </div>
            ),
          },
        ],
      },
      {
        title: "VOTANTS",
        children: [
          {
            title: "HOMMES",
            dataIndex: "votantsHommes",
            key: "votantsHommes",
            width: 80,
            align: "center",
            render: (value: number | string, record: CelData) => (
              <div
                className={`text-sm ${
                  String(record.id) === "totals" ? " font-bold" : ""
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
            width: 80,
            align: "center",
            render: (value: number | string, record: CelData) => (
              <div
                className={`text-sm ${
                  String(record.id) === "totals" ? " font-bold" : ""
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
            width: 80,
            align: "center",
            render: (value: number | string, record: CelData) => (
              <div
                className={`font-bold text-sm ${
                  String(record.id) === "totals" ? " font-bold" : ""
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
        render: (value: number | string, record: CelData) => (
          <div
            className={`text-sm font-medium ${
              String(record.id) === "totals" ? " font-bold" : ""
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
        render: (value: number | string, record: CelData) => (
          <div
            className={`text-sm ${
              String(record.id) === "totals" ? " font-bold" : ""
            }`}
          >
            {formatNumber(value)}
          </div>
        ),
      },
      {
        title: "SUFFR. EXPRIMES",
        dataIndex: "suffrageExprime",
        key: "suffrageExprime",
        width: 120,
        align: "center",
        render: (value: number | string, record: CelData) => (
          <div
            className={`text-sm ${
              String(record.id) === "totals" ? " font-bold" : ""
            }`}
          >
            <div
              className={`font-medium ${
                String(record.id) === "totals" ? "" : ""
              }`}
            >
              {formatNumber(value)}
            </div>
            {String(record.id) !== "totals" &&
              (typeof record.bulletinsBlancs === "number"
                ? record.bulletinsBlancs
                : parseFloat(String(record.bulletinsBlancs || 0))) > 0 && (
                <div className="text-xs text-muted-foreground">
                  Blancs: {formatNumber(record.bulletinsBlancs)}
                </div>
              )}
            {String(record.id) !== "totals" &&
              (typeof record.bulletinsNuls === "number"
                ? record.bulletinsNuls
                : parseFloat(String(record.bulletinsNuls || 0))) > 0 && (
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
        render: (value: number | string, record: CelData) => (
          <div
            className={`text-sm ${
              String(record.id) === "totals" ? " font-bold" : ""
            }`}
          >
            {formatNumber(value)}
          </div>
        ),
      },
      // ✅ Colonnes dynamiques pour les candidats avec badges ELU/EGALITE
      ...candidateColumns.map((numDos) => {
        const isWinner = winnersAndTies.winners.includes(numDos);
        const isTie = winnersAndTies.isTie;
        
        return {
          title: (
            <div className="flex flex-col items-center gap-1">
              {isWinner && !isTie && (
                <Badge className="bg-green-600 text-white font-bold text-xs mb-1">
                  ELU
                </Badge>
              )}
              {isWinner && isTie && (
                <Badge className="bg-yellow-600 text-white font-bold text-xs mb-1">
                  EGALITE
                </Badge>
              )}
              <span className="text-xs font-semibold">{numDos}</span>
            </div>
          ),
          dataIndex: numDos,
          key: numDos,
          width: 100,
          align: "center" as const,
          render: (
            value: number | string | null | undefined,
            record: CelData
          ) => {
            const numValue =
              typeof value === "number"
                ? value
                : parseFloat(String(value || 0)) || 0;
            return (
              <div
                className={`text-sm font-medium ${
                  String(record.id) === "totals" ? " font-bold" : ""
                }`}
                data-index={`score-${numDos}`}
              >
                {numValue > 0 ? formatNumber(numValue) : "0"}
              </div>
            );
          },
        };
      }),
    ];

    return baseColumns;
  }, [celData, candidateColumns, winnersAndTies]);

  // Fonction pour calculer les totaux avec colonnes dynamiques
  const calculateTotals = (data: CelData[]): CelData => {
    // Initialiser les totaux de base
    const baseTotals = {
      populationHommes: 0,
      populationFemmes: 0,
      populationTotale: 0,
      votantsHommes: 0,
      votantsFemmes: 0,
      totalVotants: 0,
      bulletinsNuls: 0,
      suffrageExprime: 0,
      bulletinsBlancs: 0,
    };

    // Map pour stocker les totaux des candidats (colonnes dynamiques)
    const candidateTotals = new Map<string, number>();

    // Calculer les totaux
    const totals = data.reduce(
      (acc, item) => {
        acc.populationHommes += parseInt(String(item.populationHommes)) || 0;
        acc.populationFemmes += parseInt(String(item.populationFemmes)) || 0;
        acc.populationTotale += parseInt(String(item.populationTotale)) || 0;
        acc.votantsHommes += parseInt(String(item.votantsHommes)) || 0;
        acc.votantsFemmes += parseInt(String(item.votantsFemmes)) || 0;
        acc.totalVotants += parseInt(String(item.totalVotants)) || 0;
        acc.bulletinsNuls += parseInt(String(item.bulletinsNuls)) || 0;
        acc.suffrageExprime += parseInt(String(item.suffrageExprime)) || 0;
        acc.bulletinsBlancs += parseInt(String(item.bulletinsBlancs)) || 0;

        // Calculer les totaux pour chaque colonne de candidat (dynamique)
        candidateColumns.forEach((numDos) => {
          const value = item[numDos];
          const numValue =
            typeof value === "number"
              ? value
              : parseFloat(String(value || 0)) || 0;
          candidateTotals.set(
            numDos,
            (candidateTotals.get(numDos) || 0) + numValue
          );
        });

        return acc;
      },
      { ...baseTotals }
    );

    // Calculer le taux de participation global
    const tauxParticipation =
      totals.populationTotale > 0
        ? ((totals.totalVotants / totals.populationTotale) * 100).toFixed(2)
        : "0.00";

    // Construire l'objet de totaux avec les colonnes dynamiques
    // Note: Les types dans CelData sont number, mais on doit gérer les strings aussi
    const totalsRow: any = {
      id: "totals" as any,
      codeCellule: "",
      ordre: 0,
      referenceLieuVote: "",
      libelleLieuVote: "TOTAL GÉNÉRAL",
      numeroBureauVote: "",
      populationHommes: totals.populationHommes,
      populationFemmes: totals.populationFemmes,
      populationTotale: totals.populationTotale,
      votantsHommes: totals.votantsHommes,
      votantsFemmes: totals.votantsFemmes,
      totalVotants: totals.totalVotants,
      tauxParticipation: parseFloat(tauxParticipation),
      bulletinsNuls: totals.bulletinsNuls,
      suffrageExprime: totals.suffrageExprime,
      bulletinsBlancs: totals.bulletinsBlancs,
      statutSuppressionBv: null,
    };

    // Ajouter les totaux des candidats (colonnes dynamiques)
    candidateTotals.forEach((total, numDos) => {
      totalsRow[numDos] = total;
    });

    return totalsRow as CelData;
  };

  // Données filtrées pour la recherche avec ligne de totaux
  const filteredData = useMemo(() => {
    if (!celData?.data) return [];

    let data = celData.data.sort(
      (a, b) =>
        (typeof a.ordre === "number"
          ? a.ordre
          : parseInt(String(a.ordre || 0))) -
        (typeof b.ordre === "number" ? b.ordre : parseInt(String(b.ordre || 0)))
    );

    if (searchText) {
      data = data.filter(
        (item) =>
          item.libelleLieuVote
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          item.numeroBureauVote
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          item.referenceLieuVote
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Ajouter la ligne de totaux au début
    const totalsRow = calculateTotals(data);
    return [totalsRow, ...data];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celData?.data, searchText, candidateColumns]);

  const exportToPDFWithImages = async () => {
    if (!celData || !importData || pdfLoading) return;

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
        `SOUS-PREFECTURE / COUMMUNE - ${importData.codeCellule} ${importData.nomFichier}`,
        60,
        38
      );

      // Calculer les totaux
      const totalsRow = calculateTotals(celData.data);

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
        formatNumberForPDF(celData.metrics.inscrits.total),
        18,
        startY + 18
      );

      // Carte Votants
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(105, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("VOTANTS", 109, startY + 8);
      doc.setFontSize(16);
      doc.text(
        formatNumberForPDF(celData.metrics.votants.total),
        109,
        startY + 18
      );

      // Carte Participation
      doc.setFillColor(168, 85, 247); // Violet
      doc.rect(196, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TAUX DE", 200, startY + 6);
      doc.text("PARTICIPATION", 200, startY + 12);
      doc.setFontSize(16);
      doc.text(
        `${celData.metrics.tauxParticipation.toFixed(2)}%`,
        200,
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

      // Calculer les pourcentages et déterminer le vainqueur avec colonnes dynamiques
      const totalSuffrages = parseInt(String(totalsRow.suffrageExprime)) || 0;

      // Construire la liste des candidats dynamiquement à partir des colonnes
      const candidates = candidateColumns
        .map((numDos) => {
          const value = totalsRow[numDos];
          const score =
            typeof value === "number"
              ? value
              : parseFloat(String(value || 0)) || 0;
          return {
            numDos,
            score,
            percentage:
              totalSuffrages > 0
                ? ((score / totalSuffrages) * 100).toFixed(2)
                : "0.00",
          };
        })
        .filter((c) => c.score > 0); // Filtrer les candidats avec score > 0

      // Déterminer le vainqueur ou égalité
      const maxScore =
        candidates.length > 0 ? Math.max(...candidates.map((c) => c.score)) : 0;
      const winners = candidates.filter(
        (c) => c.score === maxScore && c.score > 0
      );
      const isTie = winners.length > 1;

      // Calculer la largeur et l'espacement dynamiques selon le nombre de candidats
      const pageWidth = 420; // Largeur A3 en paysage (mm)
      const marginLeft = 14;
      const marginRight = 14;
      const availableWidth = pageWidth - marginLeft - marginRight;
      const minCandidateWidth = 60;
      const maxCandidatesPerRow = Math.floor(
        availableWidth / minCandidateWidth
      );

      // Adapter la largeur et l'espacement selon le nombre de candidats
      let candidateWidth: number;
      let candidateSpacing: number;

      if (candidates.length <= maxCandidatesPerRow) {
        // Tous les candidats sur une seule ligne
        candidateWidth = Math.min(
          70,
          (availableWidth - (candidates.length - 1) * 5) / candidates.length
        );
        candidateSpacing = candidateWidth + 5;
      } else {
        // Plusieurs lignes nécessaires
        candidateWidth = minCandidateWidth;
        candidateSpacing = candidateWidth + 5;
      }

      // Dessiner les cartes des candidats (version simplifiée avec NUM_DOS uniquement)
      let currentRow = 0;
      let currentCol = 0;
      const candidatesPerRow = Math.min(candidates.length, maxCandidatesPerRow);

      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];

        // Calculer la position (gérer les retours à la ligne)
        if (i > 0 && i % candidatesPerRow === 0) {
          currentRow++;
          currentCol = 0;
        } else if (i > 0) {
          currentCol++;
        }

        const x = marginLeft + currentCol * candidateSpacing;
        const y = startY + currentRow * 60; // 60mm d'espacement vertical entre les lignes

        // Carte du candidat
        doc.setFillColor(255, 255, 255); // Blanc
        doc.rect(x, y, candidateWidth, 50, "F");
        doc.setDrawColor(0, 0, 0); // Bordure noire
        doc.rect(x, y, candidateWidth, 50, "S");

        // NUM_DOS du candidat
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const numDosLines = doc.splitTextToSize(
          candidate.numDos,
          candidateWidth - 4
        );
        doc.text(numDosLines, x + 2, y + 8);

        // Score et pourcentage
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(formatNumberForPDF(candidate.score), x + 2, y + 25);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("VOIX", x + 2, y + 30);

        // Pourcentage
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${candidate.percentage}%`, x + 2, y + 38);

        // Indicateur vainqueur/égalité
        const isWinner = winners.some(
          (w) => w.numDos === candidate.numDos && w.score === candidate.score
        );
        if (isWinner) {
          if (isTie) {
            // Égalité - bordure dorée
            doc.setDrawColor(255, 215, 0);
            doc.setLineWidth(3);
            doc.rect(x, y, candidateWidth, 50, "S");
            doc.setFontSize(6);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 215, 0);
            doc.text("ÉGALITÉ", x + 2, y - 2);
          } else {
            // Vainqueur - bordure verte
            doc.setDrawColor(34, 197, 94);
            doc.setLineWidth(3);
            doc.rect(x, y, candidateWidth, 50, "S");
            doc.setFontSize(6);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(34, 197, 94);
            doc.text("VAINQUEUR", x + 2, y - 2);
          }
        }

        // Réinitialiser les styles
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.setTextColor(0, 0, 0);
      }

      // Sauvegarder le PDF
      doc.save(
        `CEL_${importData.codeCellule}_${importData.nomFichier}_AVEC_IMAGES_${
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
    if (!celData || !importData || pdfLoading) return;

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
      doc.text(`ELECTION LEGISLATIVES 2025`, 60, 20);
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(`SCRUTIN DU 27 DECEMBRE 2025`, 60, 28);

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(
        `SOUS-PREFECTURE / COUMMUNE - ${importData.codeCellule} ${importData.nomFichier}`,
        60,
        38
      );

      // doc.setFontSize(12);
      // doc.setFont('helvetica', 'normal');
      // doc.text(`Code CEL: ${importData.codeCellule}`, 60, 38);
      // doc.text(`Statut: ${importData.statutImport}`, 60, 35);
      // doc.text(`Date d'export: ${new Date().toLocaleString('fr-FR')}`, 60, 40);

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
        `Hommes: ${formatNumberForPDF(celData.metrics.inscrits.hommes)}`,
        18,
        startY + 10
      );
      doc.text(
        `Femmes: ${formatNumberForPDF(celData.metrics.inscrits.femmes)}`,
        18,
        startY + 14
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total: ${formatNumberForPDF(celData.metrics.inscrits.total)}`,
        18,
        startY + 21
      );

      // Carte Votants
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(105, startY, 85, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("VOTANTS", 109, startY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Hommes: ${formatNumberForPDF(celData.metrics.votants.hommes)}`,
        109,
        startY + 10
      );
      doc.text(
        `Femmes: ${formatNumberForPDF(celData.metrics.votants.femmes)}`,
        109,
        startY + 14
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total: ${formatNumberForPDF(celData.metrics.votants.total)}`,
        109,
        startY + 21
      );

      // Carte Participation
      doc.setFillColor(168, 85, 247); // Violet
      doc.rect(196, startY, 85, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TAUX DE PARTICIPATION", 200, startY + 6);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${celData.metrics.tauxParticipation.toFixed(2)}%`,
        200,
        startY + 16
      );

      // Réinitialiser la couleur du texte pour la suite
      doc.setTextColor(0, 0, 0);

      // Tableau détaillé des bureaux avec jsPDF AutoTable (design optimisé)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Détail par Bureau de Vote", 14, 95);

      const sortedData = celData.data.sort(
        (a, b) =>
          (typeof a.ordre === "number"
            ? a.ordre
            : parseInt(String(a.ordre || 0))) -
          (typeof b.ordre === "number"
            ? b.ordre
            : parseInt(String(b.ordre || 0)))
      );
      const totalsRow = calculateTotals(sortedData);

      // Construire les données du tableau avec colonnes dynamiques
      const tableData = [totalsRow, ...sortedData].map((bureau) => {
        const baseRow = [
          bureau.ordre || "",
          bureau.libelleLieuVote,
          String(bureau.id) === "totals"
            ? celData?.totalBureaux || 0
            : bureau.numeroBureauVote,
          formatNumberForPDF(bureau.populationHommes),
          formatNumberForPDF(bureau.populationFemmes),
          formatNumberForPDF(bureau.populationTotale),
          formatNumberForPDF(bureau.votantsHommes),
          formatNumberForPDF(bureau.votantsFemmes),
          formatNumberForPDF(bureau.totalVotants),
          formatPercentage(bureau.tauxParticipation),
          formatNumberForPDF(bureau.bulletinsNuls),
          formatNumberForPDF(bureau.suffrageExprime),
          formatNumberForPDF(bureau.bulletinsBlancs),
        ];

        // Ajouter les colonnes dynamiques des candidats
        candidateColumns.forEach((numDos) => {
          const value = bureau[numDos];
          const numValue =
            typeof value === "number"
              ? value
              : parseFloat(String(value || 0)) || 0;
          baseRow.push(numValue > 0 ? formatNumberForPDF(numValue) : "0");
        });

        return baseRow;
      });

      // Construire les en-têtes dynamiques pour les candidats
      const candidateHeaders = candidateColumns.map((numDos) => ({
        content: numDos,
        rowSpan: 2,
        styles: { halign: "center" as const, valign: "middle" as const },
      }));

      // Calculer la largeur des colonnes en fonction du nombre de candidats
      const baseColumnsCount = 13; // Nombre de colonnes fixes
      const totalColumns = baseColumnsCount + candidateColumns.length;
      const pageWidth = 420; // Largeur A3 en paysage (mm)
      const fixedColumnsWidth =
        15 + 40 + 15 + 20 + 20 + 20 + 20 + 20 + 20 + 20 + 18 + 20 + 20; // Total des colonnes fixes
      const availableWidthForCandidates = pageWidth - fixedColumnsWidth - 20; // -20 pour marges
      const candidateColumnWidth =
        candidateColumns.length > 0
          ? Math.min(
              20,
              Math.max(
                15,
                availableWidthForCandidates / candidateColumns.length
              )
            )
          : 20;

      // Ajuster la taille de police selon le nombre de colonnes
      const fontSize = totalColumns > 20 ? 6 : totalColumns > 15 ? 7 : 8;
      const cellPadding = totalColumns > 20 ? 1 : 2;

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
              content: "LIEU DE VOTE",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "BV",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "POPULATION ELECTORALE",
              colSpan: 3,
              styles: { halign: "center", fillColor: [111, 221, 111] },
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
              content: "SUFFR. EXPRIMES",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "BULLETINS BLANCS",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            // Ajouter les en-têtes dynamiques des candidats
            ...candidateHeaders,
          ],
          ["HOMMES", "FEMMES", "TOTAL", "HOMMES", "FEMMES", "TOTAL"],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [111, 221, 111],
          textColor: [0, 0, 0],
          fontSize: fontSize,
          halign: "center",
          fontStyle: "bold",
        },
        styles: {
          fontSize: fontSize - 1,
          cellPadding: cellPadding,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 15 }, // ORD
          1: { cellWidth: 40, halign: "left" }, // LIEU DE VOTE
          2: { cellWidth: 15 }, // BV
          3: { cellWidth: 20 }, // POPULATION HOMMES
          4: { cellWidth: 20 }, // POPULATION FEMMES
          5: { cellWidth: 20 }, // POPULATION TOTAL
          6: { cellWidth: 20 }, // VOTANTS HOMMES
          7: { cellWidth: 20 }, // VOTANTS FEMMES
          8: { cellWidth: 20 }, // VOTANTS TOTAL
          9: { cellWidth: 20 }, // TAUX PARTICIPATION
          10: { cellWidth: 18 }, // BULLETINS NULS
          11: { cellWidth: 20 }, // SUFFR. EXPRIMES
          12: { cellWidth: 20 }, // BULLETINS BLANCS
          // Styles dynamiques pour les colonnes de candidats (largeur adaptative)
          ...Object.fromEntries(
            candidateColumns.map((_, index) => [
              13 + index,
              { cellWidth: candidateColumnWidth },
            ])
          ),
        },
        didParseCell: (data: any) => {
          // Mettre en gras et en vert la première ligne (totaux)
          if (
            data.row.index === 0 &&
            data.section === "body" &&
            data.row.raw &&
            Array.isArray(data.row.raw) &&
            String(data.row.raw[0]) === "totals"
          ) {
            data.cell.styles.fillColor = [34, 197, 94]; // Vert #22c55e
            data.cell.styles.textColor = [255, 255, 255]; // Blanc
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      // Sauvegarder le PDF
      doc.save(
        `CEL_${importData.codeCellule}_${importData.nomFichier}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  if (!importData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Nom de la CEL */}
              <DialogTitle className="flex items-center gap-2 text-2xl mb-2">
                <Building2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="uppercase font-light">
                  Commission Électorale Locale :{" "}
                </span>
                <span className="font-black text-green-600">
                  {importData.libelleCellule}
                </span>
              </DialogTitle>

              {/* Circonscription - alignée avec le texte */}
              {(celData?.libelleCirconscription ||
                importData.libelleCirconscription) && (
                <div className="flex items-center gap-2 text-lg text-gray-600 mb-2 ml-8">
                  <span className="font-medium">Circonscription :</span>
                  <span className="font-semibold text-blue-600">
                    {celData?.codeCirconscription ||
                      importData.codeCirconscription}{" "}
                    -{" "}
                    {celData?.libelleCirconscription ||
                      importData.libelleCirconscription}
                  </span>
                </div>
              )}

              {/* Code CEL et Total bureaux - alignés */}
              <DialogDescription className="flex items-center gap-6 text-base ml-8">
                <span className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Code CEL :</span>
                  <span className="font-semibold text-orange-600">
                    {importData.codeCellule}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Bureaux de vote:</span>
                  <span className="font-semibold text-green-600">
                    {celData?.totalBureaux || importData.nombreBureauxVote}
                  </span>
                </span>
              </DialogDescription>
            </div>
            {celData && !loading && (
              <div className="flex gap-2">
                {/* Bouton d'upload de fichier signé */}

                {/* <Button
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
                </Button> */}
              </div>
            )}
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
                  onClick={loadCelData}
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          )}

          {celData && !loading && (
            <>
              {/* Métriques globales - Version compacte */}
              {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Inscrits</div>
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(celData.metrics.inscrits.total)}</div>
                      </div>
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-2">
                      <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                        <span className="font-semibold text-blue-800">H:</span>
                        <span className="font-bold text-blue-900">{formatNumber(celData.metrics.inscrits.hommes)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-pink-100 px-2 py-1 rounded">
                        <span className="font-semibold text-pink-800">F:</span>
                        <span className="font-bold text-pink-900">{formatNumber(celData.metrics.inscrits.femmes)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Votants</div>
                        <div className="text-2xl font-bold text-green-600">{formatNumber(celData.metrics.votants.total)}</div>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-2">
                      <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                        <span className="font-semibold text-green-800">H:</span>
                        <span className="font-bold text-green-900">{formatNumber(celData.metrics.votants.hommes)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded">
                        <span className="font-semibold text-purple-800">F:</span>
                        <span className="font-bold text-purple-900">{formatNumber(celData.metrics.votants.femmes)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Participation</div>
                        <div className="text-2xl font-bold text-purple-600">{celData.metrics.tauxParticipation.toFixed(2)}%</div>
                      </div>
                      <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" 
                        data-width={Math.min(celData.metrics.tauxParticipation, 100)}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Bureaux</div>
                        <div className="text-2xl font-bold text-orange-600">{celData.totalBureaux}</div>
                      </div>
                      <Hash className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {celData.data.length} importés
                    </div>
                  </CardContent>
                </Card>
              </div> */}

              {/* Tableau des bureaux avec TanStack Table */}
              <Card className="border-none shadow-none pt-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base font-semibold text-gray-900 uppercase">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      Compilation des résultats par bureau de vote
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {celData.data.length} bureaux
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
                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    scroll={{ x: 1500, y: 400 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} sur ${total} résultats`,
                    }}
                    size="small"
                    bordered
                    className="cel-results-table"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t bg-gray-50 px-6 py-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total des bureaux:</span>{" "}
            {celData?.data.length || 0} bureaux importés
          </div>
          <div className="flex gap-2">
            {celData && (
              <>
                <Button
                  onClick={handleUploadClick}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer fichier signé
                </Button>

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
                {/* <Button
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
                </Button> */}
              </>
            )}
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>

        {/* Dialog d'upload de fichier signé */}
        <AlertDialog
          open={showUploadDialog}
          onOpenChange={handleCloseUploadDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Importer fichier CEL signé
              </AlertDialogTitle>
              <AlertDialogDescription>
                Téléchargez le fichier de la CEL signé par le superviseur pour{" "}
                <strong>{importData?.nomFichier}</strong>.
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
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && importData) {
                          // ✅ Validation immédiate lors de la sélection
                          const validation = validateFile(
                            file,
                            importData.codeCellule
                          );
                          if (!validation.valid) {
                            setUploadMessage({
                              type: "error",
                              text: validation.error || "Erreur de validation",
                            });
                            toast.error("Fichier invalide", {
                              description: validation.error,
                              duration: 5000,
                            });
                            // Réinitialiser l'input
                            e.target.value = "";
                            setSelectedFile(null);
                            return;
                          }
                          setUploadMessage({ type: null, text: "" });
                        }
                        setSelectedFile(file);
                      }}
                      className="hidden"
                      id="cel-file"
                      disabled={uploadLoading}
                    />
                    <label
                      htmlFor="cel-file"
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
