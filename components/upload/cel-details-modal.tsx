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
  Users,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
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
import type {
  CelDataResponse,
  CelData,
  CelMetrics,
  ImportData,
} from "@/types/upload";

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
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const loadCelData = async () => {
    if (!importData) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCelData(importData.codeCellule);
      console.log('🔍 [CEL Details Modal] Données CEL chargées:', data);
      setCelData(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données CEL:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && importData) {
      loadCelData();
    }
  }, [isOpen, importData]); // Supprimé loadCelData des dépendances

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

  const formatNumber = (value: string | number): string => {
    const num = typeof value === "string" ? parseInt(value) || 0 : value;
    return num.toLocaleString("fr-FR");
  };

  const formatNumberForPDF = (value: string | number): string => {
    const num = typeof value === "string" ? parseInt(value) || 0 : value;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const formatPercentage = (value: string): string => {
    return value.includes("%") ? value : `${value}%`;
  };

  // Gestion de l'upload de fichier signé
  const handleUploadClick = () => {
    setShowUploadDialog(true);
    setUploadMessage({ type: null, text: '' });
    setSelectedFile(null);
  };

  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setUploadMessage({ type: null, text: '' });
    setSelectedFile(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !importData || uploadLoading) return;

    try {
      setUploadLoading(true);
      setUploadMessage({ type: null, text: '' });
      
      // ✅ SÉCURITÉ : Vérifier le token avant l'upload
      const { ensureValidToken } = await import('@/lib/utils/session-helper');
      const tokenCheck = await ensureValidToken();
      
      if (!tokenCheck.isValid) {
        toast.error(tokenCheck.message || 'Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          window.location.href = '/auth/login?redirect=/upload&reason=session_expired';
        }, 2000);
        return;
      }
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('celId', importData.codeCellule);
      formData.append('celCode', importData.codeCellule);

      // ✅ Envoyer directement au backend NestJS (au lieu de l'API Next.js locale)
      const { uploadClient } = await import('@/lib/api/client');
      const response = await uploadClient.post('/upload/cels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      
      console.log('✅ Fichier CEL signé uploadé avec succès:', {
        file: selectedFile.name,
        cel: importData.nomFichier,
        size: selectedFile.size,
        result
      });

      // Message de succès
      setUploadMessage({ 
        type: 'success', 
        text: `Fichier "${selectedFile.name}" uploadé avec succès pour la CEL ${importData.nomFichier}` 
      });

      // Afficher le toast de succès
      toast.success('Fichier CEL signé uploadé avec succès', {
        description: `Le fichier "${selectedFile.name}" a été uploadé pour la CEL ${importData.nomFichier}`,
        duration: 5000,
      });

      // Fermer le dialog après un délai
      setTimeout(() => {
        setShowUploadDialog(false);
        setSelectedFile(null);
        setUploadMessage({ type: null, text: '' });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite';
      
      // Message d'erreur
      setUploadMessage({ 
        type: 'error', 
        text: `Erreur lors de l'upload: ${errorMessage}` 
      });

      // Afficher le toast d'erreur
      toast.error('Erreur lors de l\'upload', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Configuration des colonnes Ant Design avec en-têtes multi-niveaux
  const columns: TableColumnsType<CelData> = useMemo(
    () => [
      {
        title: "ORD",
        dataIndex: "ordre",
        key: "ordre",
        width: 60,
        align: "center",
        render: (value: string, record: CelData) =>
          record.id === "totals" ? (
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
          record.id === "totals" ? (
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
          if (record.id === "totals") {
            return {
              colSpan: 1, // Ne s'étend plus, affiche seulement le lieu de vote
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
          record.id === "totals" ? (
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
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm ${
                  record.id === "totals" ? " font-bold" : ""
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
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm ${
                  record.id === "totals" ? " font-bold" : ""
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
            render: (value: string, record: CelData) => (
              <div
                className={`font-bold text-sm ${
                  record.id === "totals" ? " font-bold" : ""
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
        render: (value: string, record: CelData) => (
          <div
            className={`text-sm ${record.id === "totals" ? " font-bold" : ""}`}
          >
            {formatNumber(value || "0")}
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
            width: 80,
            align: "center",
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm ${
                  record.id === "totals" ? " font-bold" : ""
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
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm ${
                  record.id === "totals" ? " font-bold" : ""
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
            render: (value: string, record: CelData) => (
              <div
                className={`font-bold text-sm ${
                  record.id === "totals" ? " font-bold" : ""
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
        render: (value: string, record: CelData) => (
          <div
            className={`text-sm font-medium ${
              record.id === "totals" ? " font-bold" : ""
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
        render: (value: string, record: CelData) => (
          <div
            className={`text-sm ${record.id === "totals" ? " font-bold" : ""}`}
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
        render: (value: string, record: CelData) => (
          <div
            className={`text-sm ${record.id === "totals" ? " font-bold" : ""}`}
          >
            <div className={`font-medium ${record.id === "totals" ? "" : ""}`}>
              {formatNumber(value)}
            </div>
            {record.id !== "totals" && parseInt(record.bulletinsBlancs) > 0 && (
              <div className="text-xs text-muted-foreground">
                Blancs: {formatNumber(record.bulletinsBlancs)}
              </div>
            )}
            {record.id !== "totals" && parseInt(record.bulletinsNuls) > 0 && (
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
        render: (value: string, record: CelData) => (
          <div
            className={`text-sm ${record.id === "totals" ? " font-bold" : ""}`}
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
            width: 100,
            align: "center",
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm font-medium ${
                  record.id === "totals" ? " font-bold" : ""
                }`}
              >
                {parseInt(value) > 0 ? formatNumber(value) : "0"}
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
            width: 100,
            align: "center",
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm font-medium ${
                  record.id === "totals" ? " font-bold" : ""
                }`}
              >
                {parseInt(value) > 0 ? formatNumber(value) : "0"}
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
            width: 100,
            align: "center",
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm font-medium ${
                  record.id === "totals" ? " font-bold" : ""
                }`}
              >
                {parseInt(value) > 0 ? formatNumber(value) : "0"}
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
            width: 100,
            align: "center",
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm font-medium ${
                  record.id === "totals" ? " font-bold" : ""
                }`}
              >
                {parseInt(value) > 0 ? formatNumber(value) : "0"}
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
            width: 100,
            align: "center",
            render: (value: string, record: CelData) => (
              <div
                className={`text-sm font-medium ${
                  record.id === "totals" ? " font-bold" : ""
                }`}
              >
                {parseInt(value) > 0 ? formatNumber(value) : "0"}
              </div>
            ),
          },
        ],
      },
    ],
    [celData]
  );

  // Fonction pour calculer les totaux
  const calculateTotals = (data: CelData[]): CelData => {
    const totals = data.reduce(
      (acc, item) => {
        acc.populationHommes += parseInt(item.populationHommes) || 0;
        acc.populationFemmes += parseInt(item.populationFemmes) || 0;
        acc.populationTotale += parseInt(item.populationTotale) || 0;
        acc.personnelAstreinte += parseInt(item.personnesAstreintes) || 0;
        acc.votantsHommes += parseInt(item.votantsHommes) || 0;
        acc.votantsFemmes += parseInt(item.votantsFemmes) || 0;
        acc.totalVotants += parseInt(item.totalVotants) || 0;
        acc.bulletinsNuls += parseInt(item.bulletinsNuls) || 0;
        acc.suffrageExprime += parseInt(item.suffrageExprime) || 0;
        acc.bulletinsBlancs += parseInt(item.bulletinsBlancs) || 0;
        acc.score1 += parseInt(item.score1) || 0;
        acc.score2 += parseInt(item.score2) || 0;
        acc.score3 += parseInt(item.score3) || 0;
        acc.score4 += parseInt(item.score4) || 0;
        acc.score5 += parseInt(item.score5) || 0;
        return acc;
      },
      {
        populationHommes: 0,
        populationFemmes: 0,
        populationTotale: 0,
        personnelAstreinte: 0,
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
      }
    );

    // Calculer le taux de participation global
    const tauxParticipation =
      totals.populationTotale > 0
        ? ((totals.totalVotants / totals.populationTotale) * 100).toFixed(2)
        : "0.00";

    return {
      id: "totals",
      codeCellule: "",
      ordre: "",
      referenceLieuVote: "",
      libelleLieuVote: "TOTAL GÉNÉRAL",
      numeroBureauVote: "",
      populationHommes: totals.populationHommes.toString(),
      populationFemmes: totals.populationFemmes.toString(),
      populationTotale: totals.populationTotale.toString(),
      personnesAstreintes: totals.personnelAstreinte.toString(),
      votantsHommes: totals.votantsHommes.toString(),
      votantsFemmes: totals.votantsFemmes.toString(),
      totalVotants: totals.totalVotants.toString(),
      tauxParticipation: tauxParticipation,
      bulletinsNuls: totals.bulletinsNuls.toString(),
      suffrageExprime: totals.suffrageExprime.toString(),
      bulletinsBlancs: totals.bulletinsBlancs.toString(),
      score1: totals.score1.toString(),
      score2: totals.score2.toString(),
      score3: totals.score3.toString(),
      score4: totals.score4.toString(),
      score5: totals.score5.toString(),
    };
  };

  // Données filtrées pour la recherche avec ligne de totaux
  const filteredData = useMemo(() => {
    if (!celData?.data) return [];

    let data = celData.data.sort(
      (a, b) => parseInt(a.ordre) - parseInt(b.ordre)
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
  }, [celData?.data, searchText]);

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
      doc.setFont('helvetica', 'bold');
      doc.text('STATISTIQUES PRINCIPALES', 14, 50);
      
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
      doc.text(formatNumberForPDF(celData.metrics.inscrits.total), 18, startY + 18);
      
      // Carte Personnel d'astreinte
      doc.setFillColor(251, 146, 60); // Orange
      doc.rect(105, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PERSONNEL", 109, startY + 6);
      doc.text("D'ASTREINTE", 109, startY + 12);
      doc.setFontSize(16);
      doc.text(formatNumberForPDF(totalsRow.personnesAstreintes), 109, startY + 22);
      
      // Carte Votants
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(196, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("VOTANTS", 200, startY + 8);
      doc.setFontSize(16);
      doc.text(formatNumberForPDF(celData.metrics.votants.total), 200, startY + 18);
      
      // Carte Participation
      doc.setFillColor(168, 85, 247); // Violet
      doc.rect(287, startY, 85, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TAUX DE", 291, startY + 6);
      doc.text("PARTICIPATION", 291, startY + 12);
      doc.setFontSize(16);
      doc.text(`${celData.metrics.tauxParticipation.toFixed(2)}%`, 291, startY + 22);

      // Titre Section 2: Bulletins
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('BULLETINS DE VOTE', 14, 100);
      
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
      doc.setFont('helvetica', 'bold');
      doc.text('RÉSULTATS', 14, 145);
      
      // Section 3: Candidats
      startY = 155;
      const candidateWidth = 70;
      const candidateSpacing = 75;
      
      // Calculer les pourcentages et déterminer le vainqueur
      const totalSuffrages = parseInt(totalsRow.suffrageExprime);
      const candidates = [
        {
          name: "ALASSANE OUATTARA",
          party: "RHDP",
          logo: "/images/candidates/logo-alassane.jpg",
          photo: "/images/candidates/photo-alassane.jpg",
          score: parseInt(totalsRow.score1),
          percentage: totalSuffrages > 0 ? ((parseInt(totalsRow.score1) / totalSuffrages) * 100).toFixed(2) : '0.00'
        },
        {
          name: "EHIVET SIMONE épouse GBAGBO",
          party: "MGC",
          logo: "/images/candidates/logo-simone.png",
          photo: "/images/candidates/photo-simone.jpg",
          score: parseInt(totalsRow.score2),
          percentage: totalSuffrages > 0 ? ((parseInt(totalsRow.score2) / totalSuffrages) * 100).toFixed(2) : '0.00'
        },
        {
          name: "LAGOU ADJOUA HENRIETTE",
          party: "GP-PAIX",
          logo: "/images/candidates/logo-henriette.jpg",
          photo: "/images/candidates/photo-henriette.jpg",
          score: parseInt(totalsRow.score3),
          percentage: totalSuffrages > 0 ? ((parseInt(totalsRow.score3) / totalSuffrages) * 100).toFixed(2) : '0.00'
        },
        {
          name: "BILLON JEAN-LOUIS EUGENE",
          party: "CODE",
          logo: "/images/candidates/logo-jean-louis.JPG",
          photo: "/images/candidates/photo-jean-louis.jpg",
          score: parseInt(totalsRow.score4),
          percentage: totalSuffrages > 0 ? ((parseInt(totalsRow.score4) / totalSuffrages) * 100).toFixed(2) : '0.00'
        },
        {
          name: "DON-MELLO SENIN AHOUA JACOB",
          party: "INDEPENDANT",
          logo: "/images/candidates/logo-ahoua.JPG",
          photo: "/images/candidates/photo-ahoua.jpg",
          score: parseInt(totalsRow.score5),
          percentage: totalSuffrages > 0 ? ((parseInt(totalsRow.score5) / totalSuffrages) * 100).toFixed(2) : '0.00'
        }
      ];

      // Déterminer le vainqueur ou égalité
      const maxScore = Math.max(...candidates.map(c => c.score));
      const winners = candidates.filter(c => c.score === maxScore && c.score > 0);
      const isTie = winners.length > 1;

      // Dessiner les cartes des candidats
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const x = 14 + (i * candidateSpacing);
        
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
          
          const logoExtension = candidate.logo.split('.').pop()?.toUpperCase() || 'JPG';
          doc.addImage(logoDataUrl, logoExtension as any, x + 2, startY + 2, 15, 15);
        } catch (error) {
          console.warn(`Impossible de charger le logo de ${candidate.name}:`, error);
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
          
          const photoExtension = candidate.photo.split('.').pop()?.toUpperCase() || 'JPG';
          doc.addImage(photoDataUrl, photoExtension as any, x + 2, startY + 18, 25, 30);
        } catch (error) {
          console.warn(`Impossible de charger la photo de ${candidate.name}:`, error);
        }
        
        // Nom du candidat et parti
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(candidate.party, x + 30, startY + 8);
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        const nameLines = doc.splitTextToSize(candidate.name, candidateWidth - 35);
        doc.text(nameLines, x + 30, startY + 12);
        
        // Score et pourcentage
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(formatNumberForPDF(candidate.score), x + 30, startY + 25);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("VOIX", x + 30, startY + 30);
        
        // Pourcentage
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${candidate.percentage}%`, x + 30, startY + 38);
        
        // Indicateur vainqueur/égalité
        const isWinner = winners.some(w => w.name === candidate.name && w.score === candidate.score);
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

       // Carte Personnel d'astreinte
       doc.setFillColor(251, 146, 60); // Orange
       doc.rect(105, startY, 85, 22, "F");
       doc.setTextColor(255, 255, 255);
       doc.setFontSize(10);
       doc.setFont("helvetica", "bold");
       doc.text("PERSONNEL D'ASTREINTE", 109, startY + 6);
       doc.setFontSize(16);
       doc.setFont("helvetica", "bold");
       const totalPersonnelAstreinte = celData.data.reduce(
         (acc, bureau) => acc + (parseInt(bureau.personnesAstreintes) || 0),
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
        `Hommes: ${formatNumberForPDF(celData.metrics.votants.hommes)}`,
        200,
        startY + 10
      );
      doc.text(
        `Femmes: ${formatNumberForPDF(celData.metrics.votants.femmes)}`,
        200,
        startY + 14
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total: ${formatNumberForPDF(celData.metrics.votants.total)}`,
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
        `${celData.metrics.tauxParticipation.toFixed(2)}%`,
        291,
        startY + 16
      );

      // Réinitialiser la couleur du texte pour la suite
      doc.setTextColor(0, 0, 0);

      // Tableau détaillé des bureaux avec jsPDF AutoTable (design optimisé)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Détail par Bureau de Vote", 14, 95);

      const sortedData = celData.data.sort(
        (a, b) => parseInt(a.ordre) - parseInt(b.ordre)
      );
      const totalsRow = calculateTotals(sortedData);

      const tableData = [totalsRow, ...sortedData].map((bureau) => [
        bureau.ordre || "",
        bureau.libelleLieuVote,
        bureau.id === "totals"
          ? celData?.totalBureaux || 0
          : bureau.numeroBureauVote,
        formatNumberForPDF(bureau.populationHommes),
        formatNumberForPDF(bureau.populationFemmes),
        formatNumberForPDF(bureau.populationTotale),
        formatNumberForPDF(bureau.personnesAstreintes || "0"),
        formatNumberForPDF(bureau.votantsHommes),
        formatNumberForPDF(bureau.votantsFemmes),
        formatNumberForPDF(bureau.totalVotants),
        formatPercentage(bureau.tauxParticipation),
        formatNumberForPDF(bureau.bulletinsNuls),
        formatNumberForPDF(bureau.suffrageExprime),
        formatNumberForPDF(bureau.bulletinsBlancs),
        parseInt(bureau.score1) > 0 ? formatNumberForPDF(bureau.score1) : "0",
        parseInt(bureau.score2) > 0 ? formatNumberForPDF(bureau.score2) : "0",
        parseInt(bureau.score3) > 0 ? formatNumberForPDF(bureau.score3) : "0",
        parseInt(bureau.score4) > 0 ? formatNumberForPDF(bureau.score4) : "0",
        parseInt(bureau.score5) > 0 ? formatNumberForPDF(bureau.score5) : "0",
      ]);

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
              content: "SUFFR. EXPRIMES",
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
          1: { cellWidth: 40, halign: "left" }, // LIEU DE VOTE
          2: { cellWidth: 15 }, // BV
          3: { cellWidth: 20 }, // POPULATION HOMMES
          4: { cellWidth: 20 }, // POPULATION FEMMES
          5: { cellWidth: 20 }, // POPULATION TOTAL
          6: { cellWidth: 20 }, // PERS. ASTREINTE
          7: { cellWidth: 20 }, // VOTANTS HOMMES
          8: { cellWidth: 20 }, // VOTANTS FEMMES
          9: { cellWidth: 20 }, // VOTANTS TOTAL
          10: { cellWidth: 20 }, // TAUX PARTICIPATION
          11: { cellWidth: 18 }, // BULLETINS NULS
          12: { cellWidth: 20 }, // SUFFR. EXPRIMES
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
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6 text-green-600" />
                <span className="uppercase font-light">
                  Commission Électorale Locale :{" "}
                </span>
                <span className="font-black text-green-600">
                  {importData.nomFichier}
                </span>
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                <span className="inline-flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    Code:{" "}
                    <span className="font-semibold text-orange-600">
                      {importData.codeCellule}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Statut:{" "}
                    <span className="font-semibold text-green-600">
                      {importData.statutImport}
                    </span>
                  </span>
                </span>
              </DialogDescription>
            </div>
            {celData && !loading && (
              <div className="flex gap-2">
                {/* Bouton d'upload de fichier signé */}
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

        {/* Dialog d'upload de fichier signé */}
        <AlertDialog open={showUploadDialog} onOpenChange={handleCloseUploadDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Importer fichier CEL signé
              </AlertDialogTitle>
              <AlertDialogDescription>
                Téléchargez le fichier de la CEL signé par le superviseur pour{' '}
                <strong>{importData?.nomFichier}</strong>.
                <br />
                <br />
                <span className="text-sm text-muted-foreground">
                  • Formats acceptés : PDF, JPG, PNG
                  <br />
                  • Taille maximale : 10 MB
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              {/* Loader pendant l'upload */}
              {uploadLoading && (
                <div className="flex items-center justify-center py-8 bg-blue-50 rounded-lg mb-4">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">Upload en cours...</p>
                    <p className="text-xs text-blue-500 mt-1">Veuillez patienter pendant le téléchargement</p>
                  </div>
                </div>
              )}

              {/* Message de feedback */}
              {uploadMessage.type && (
                <div className={`rounded-lg p-4 mb-4 ${
                  uploadMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {uploadMessage.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <p className={`text-sm font-medium ${
                      uploadMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
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
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="cel-file"
                      disabled={uploadLoading}
                    />
                    <label
                      htmlFor="cel-file"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        uploadLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </label>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p><strong>Fichier sélectionné :</strong> {selectedFile.name}</p>
                        <p><strong>Taille :</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={uploadLoading} onClick={handleCloseUploadDialog}>
                {uploadLoading ? 'Fermer' : 'Annuler'}
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
                {uploadLoading ? 'Upload en cours...' : 'Uploader le fichier'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
