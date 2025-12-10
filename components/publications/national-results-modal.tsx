"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { CardHeader } from '@/components/ui/card'; // ❌ NON UTILISÉ
// import { Badge } from '@/components/ui/badge'; // ❌ NON UTILISÉ
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  Loader2,
  Printer,
  FileText,
  AlertTriangle,
  // CheckCircle, // ❌ NON UTILISÉ
  Trophy,
  Users,
  Vote,
  BarChart3,
} from "lucide-react";
import { publicationsApi } from "@/lib/api/publications";

// Types locaux pour les résultats nationaux
interface NationalCandidate {
  numeroOrdre?: number;
  parti?: string;
  nom?: string;
  score?: number;
  pourcentage?: number;
  photo?: string;
}

interface BulletinsInfo {
  nombre?: number;
  pourcentage?: number;
}

interface NationalResultsResponse {
  inscrits?: number;
  votants?: number;
  tauxParticipation?: number;
  nombreBureauxVote?: number;
  bulletinsNuls?: BulletinsInfo;
  suffrageExprime?: number;
  bulletinsBlancs?: BulletinsInfo;
  candidats?: NationalCandidate[];
}

interface NationalResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Styles CSS pour l'impression et l'affichage - Respectant exactement l'image
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .national-results-print, .national-results-print * {
      visibility: visible;
    }
    .national-results-print {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      background: white;
    }
    .no-print {
      display: none !important;
    }
  }
  
  .national-results-table {
    border-collapse: collapse;
    width: 100%;
    font-family: Arial, Helvetica, sans-serif;
    margin-bottom: 24px;
    font-size: 14px;
  }
  
  .national-results-table th,
  .national-results-table td {
    border: 2px solid #1a1a1a;
    padding: 12px 14px;
    line-height: 1.5;
  }
  
  /* Styles pour le tableau des statistiques (Tableau 1) */
  .stats-table th {
    background-color: #d4d4d8;
    font-weight: 700;
    text-align: center;
    border: 2px solid #1a1a1a;
    padding: 10px 14px;
    font-size: 14px;
    text-transform: capitalize;
  }
  
  .stats-table .stats-row-green {
    background-color: #d1fae5;
  }
  
  .stats-table .stats-row-white {
    background-color: #ffffff;
  }
  
  .stats-table td {
    text-align: left;
    border: 2px solid #1a1a1a;
    padding: 12px 14px;
    font-size: 14px;
  }
  
  .stats-table td:nth-child(2),
  .stats-table td:nth-child(3) {
    text-align: right;
    padding-right: 18px;
  }
  
  /* Styles pour le tableau des candidats (Tableau 2) */
  .candidates-table th {
    background-color: #d4d4d8;
    font-weight: 700;
    text-align: center;
    border: 2px solid #1a1a1a;
    padding: 10px 14px;
    font-size: 14px;
    text-transform: uppercase;
  }
  
  .candidates-table .candidate-row {
    background-color: #d1fae5;
  }
  
  .candidates-table .bulletins-blancs-row {
    background-color: #d1fae5;
  }
  
  .candidates-table td {
    text-align: left;
    border: 2px solid #1a1a1a;
    padding: 12px 14px;
    font-size: 14px;
  }
  
  .candidates-table td:nth-child(3),
  .candidates-table td:nth-child(4),
  .candidates-table td:nth-child(5) {
    text-align: right;
    padding-right: 18px;
  }
  
  /* Styles pour les badges des partis */
  .party-badge {
    display: inline-block;
    padding: 4px 10px;
    background-color: transparent;
    border: none;
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  /* Styles pour les photos des candidats */
  .candidate-photo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #d1d5db;
    margin-right: 10px;
  }
  
  /* Styles pour les colonnes des tableaux */
  .col-15 { width: 15%; }
  .col-20 { width: 20%; }
  .col-25 { width: 25%; }
  .col-40 { width: 40%; }
  
  /* Ajustements pour les cellules fusionnées */
  .stats-table td:first-child { width: 40%; }
  .stats-table td:nth-child(2) { width: 25%; }
  .stats-table td:nth-child(3) { width: 35%; }
  
  /* Ajustements pour le tableau des candidats */
  .candidates-table thead th:first-child { width: 40%; }
  .candidates-table thead th:nth-child(2) { width: 40%; }
  .candidates-table thead th:nth-child(3) { width: 20%; }
  
  .candidates-table tbody td:nth-child(1) { width: 15%; }
  .candidates-table tbody td:nth-child(2) { width: 25%; }
  .candidates-table tbody td:nth-child(3) { width: 20%; }
  .candidates-table tbody td:nth-child(4) { width: 20%; }
  .candidates-table tbody td:nth-child(5) { width: 20%; }
  
  /* Styles pour les éléments flex */
  .candidate-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .candidate-name {
    font-weight: 500;
    font-size: 13px;
  }
  
  .bulletins-blancs-label {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 13px;
  }
  
  /* Valeurs en gras dans les tableaux */
  .stats-table td strong,
  .candidates-table td strong {
    font-weight: bold;
  }
  
  /* Espacement entre les tableaux */
  .results-section {
    margin-top: 32px;
  }
  
  /* Suppression des marges pour les titres en impression */
  @media print {
    .no-print {
      display: none !important;
    }
    .national-results-table {
      page-break-inside: avoid;
    }
  }
  
  /* Amélioration de la lisibilité */
  .national-results-table tbody tr:hover {
    background-color: inherit !important;
  }
`;

export function NationalResultsModal({
  isOpen,
  onClose,
}: NationalResultsModalProps) {
  const [nationalResults, setNationalResults] =
    useState<NationalResultsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Charger les données nationales
  const loadNationalResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: NationalResultsResponse =
        await publicationsApi.getNationalResults();

      if (response) {
        setNationalResults(response);
      } else {
        throw new Error("Aucune donnée valide reçue du backend");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des résultats nationaux";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (isOpen) {
      loadNationalResults();
    }
  }, [isOpen]);

  // Injecter les styles CSS
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fonction d'impression avec jsPDF (inspirée de department-details-modal)
  const handlePrint = async () => {
    if (!nationalResults) {
      toast.error("Aucune donnée à imprimer");
      return;
    }

    try {
      setGeneratingPDF(true);

      // Import dynamique de jsPDF
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF("landscape", "mm", "a4");

      // Ajouter le logo CEI (à gauche)
      try {
        const logoResponse = await fetch("/images/logos/logocei2.webp");
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });

        // Ajouter l'image du logo (position: x=14, y=10, taille: 30x25)
        doc.addImage(logoDataUrl, "WEBP", 14, 10, 25, 25);
      } catch {
        // console.warn('Impossible de charger le logo CEI:', error);
      }

      // En-tête du document
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(`ÉLECTION DU PRÉSIDENT DE LA RÉPUBLIQUE`, 50, 20);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`RÉSULTATS NATIONAUX - PRÉLIMINAIRES`, 50, 28);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Date d'édition : ${new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        50,
        35
      );

      // Titre Section 1: Statistiques principales
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("STATISTIQUES GÉNÉRALES", 14, 45);

      // Section 1: Statistiques principales
      let startY = 55;
      const cardWidth = 65; // Largeur réduite des cartes
      const cardSpacing = 70; // Espacement entre les cartes

      // Carte Nombre de bureaux
      doc.setFillColor(59, 130, 246); // Bleu
      doc.rect(14, startY, cardWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("NOMBRE DE", 18, startY + 6);
      doc.text("BUREAUX DE VOTE", 18, startY + 12);
      doc.setFontSize(14);
      doc.text(
        formatNumberForPDF(nationalResults.nombreBureauxVote || 0),
        18,
        startY + 20
      );

      // Carte Inscrits
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(14 + cardSpacing, startY, cardWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("INSCRITS", 18 + cardSpacing, startY + 8);
      doc.setFontSize(14);
      doc.text(
        formatNumberForPDF(nationalResults.inscrits || 0),
        18 + cardSpacing,
        startY + 18
      );

      // Carte Votants
      doc.setFillColor(168, 85, 247); // Violet
      doc.rect(14 + cardSpacing * 2, startY, cardWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("VOTANTS", 18 + cardSpacing * 2, startY + 8);
      doc.setFontSize(14);
      doc.text(
        formatNumberForPDF(nationalResults.votants || 0),
        18 + cardSpacing * 2,
        startY + 18
      );

      // Carte Participation
      doc.setFillColor(251, 146, 60); // Orange
      doc.rect(14 + cardSpacing * 3, startY, cardWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TAUX DE", 18 + cardSpacing * 3, startY + 6);
      doc.text("PARTICIPATION", 18 + cardSpacing * 3, startY + 12);
      doc.setFontSize(14);
      doc.text(
        `${formatPercentage(nationalResults.tauxParticipation || 0)}`,
        18 + cardSpacing * 3,
        startY + 20
      );

      // Titre Section 2: Bulletins
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETINS DE VOTE", 14, 90);

      // Section 2: Bulletins
      startY = 100;

      // Carte Bulletins Nuls
      doc.setFillColor(239, 68, 68); // Rouge
      doc.rect(14, startY, cardWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETINS", 18, startY + 6);
      doc.text("NULS", 18, startY + 12);
      doc.setFontSize(14);
      doc.text(
        formatNumberForPDF(nationalResults.bulletinsNuls?.nombre || 0),
        18,
        startY + 20
      );

      // Carte Suffrages Exprimés
      doc.setFillColor(34, 197, 94); // Vert
      doc.rect(14 + cardSpacing, startY, cardWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("SUFFRAGES", 18 + cardSpacing, startY + 6);
      doc.text("EXPRIMÉS", 18 + cardSpacing, startY + 12);
      doc.setFontSize(14);
      doc.text(
        formatNumberForPDF(nationalResults.suffrageExprime || 0),
        18 + cardSpacing,
        startY + 20
      );

      // Carte Bulletins Blancs
      doc.setFillColor(107, 114, 128); // Gris
      doc.rect(14 + cardSpacing * 2, startY, cardWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETINS", 18 + cardSpacing * 2, startY + 6);
      doc.text("BLANCS", 18 + cardSpacing * 2, startY + 12);
      doc.setFontSize(14);
      doc.text(
        formatNumberForPDF(nationalResults.bulletinsBlancs?.nombre || 0),
        18 + cardSpacing * 2,
        startY + 20
      );

      // Titre Section 3: Tableau détaillé
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RÉSULTATS PAR CANDIDAT", 14, 135);

      // Tableau des candidats avec autoTable
      const candidatesData =
        nationalResults.candidats?.map((candidate: NationalCandidate) => [
          candidate.parti || "N/A",
          candidate.nom || "N/A",
          formatNumberForPDF(candidate.score || 0),
          numberToWords(candidate.score || 0),
          formatPercentage(candidate.pourcentage || 0),
        ]) || [];

      // Ajouter les bulletins blancs si disponibles
      if (nationalResults.bulletinsBlancs) {
        candidatesData.push([
          "",
          "BULLETINS BLANCS",
          formatNumberForPDF(nationalResults.bulletinsBlancs.nombre || 0),
          numberToWords(nationalResults.bulletinsBlancs.nombre || 0),
          formatPercentage(nationalResults.bulletinsBlancs.pourcentage || 0),
        ]);
      }

      autoTable(doc, {
        startY: 145,
        head: [
          [
            {
              content: "PARTI",
              styles: { halign: "center", fillColor: [111, 221, 111] },
            },
            {
              content: "CANDIDAT",
              styles: { halign: "center", fillColor: [111, 221, 111] },
            },
            {
              content: "SCORE (CHIFFRES)",
              styles: { halign: "center", fillColor: [111, 221, 111] },
            },
            {
              content: "SCORE (LETTRES)",
              styles: { halign: "center", fillColor: [111, 221, 111] },
            },
            {
              content: "POURCENTAGE",
              styles: { halign: "center", fillColor: [111, 221, 111] },
            },
          ],
        ],
        body: candidatesData,
        theme: "grid",
        headStyles: {
          fillColor: [111, 221, 111],
          textColor: [0, 0, 0],
          fontSize: 10,
          halign: "center",
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 40, halign: "center" }, // PARTI
          1: { cellWidth: 80, halign: "left" }, // CANDIDAT
          2: { cellWidth: 50, halign: "center" }, // SCORE CHIFFRES
          3: { cellWidth: 70, halign: "center" }, // SCORE LETTRES
          4: { cellWidth: 40, halign: "center" }, // POURCENTAGE
        },
      });

      // Sauvegarder le PDF
      doc.save(
        `RESULTATS_NATIONAUX_${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast.success("PDF généré avec succès", {
        description: "Le fichier PDF des résultats nationaux a été téléchargé",
        duration: 3000,
      });
    } catch {
      // console.error('Erreur lors de la génération PDF:', error);
      toast.error("Erreur lors de la génération PDF", {
        description: "Impossible de générer le PDF",
        duration: 3000,
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Formater les nombres
  const formatNumber = (value: number): string => {
    return value.toLocaleString("fr-FR");
  };

  // Formater les nombres pour PDF (avec espaces au lieu de virgules)
  const formatNumberForPDF = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Formater les pourcentages
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Convertir nombre en lettres françaises (version complète et précise)
  const numberToWords = (num: number): string => {
    if (num === 0) return "ZÉRO";

    const units = [
      "",
      "UN",
      "DEUX",
      "TROIS",
      "QUATRE",
      "CINQ",
      "SIX",
      "SEPT",
      "HUIT",
      "NEUF",
    ];
    const teens = [
      "DIX",
      "ONZE",
      "DOUZE",
      "TREIZE",
      "QUATORZE",
      "QUINZE",
      "SEIZE",
      "DIX-SEPT",
      "DIX-HUIT",
      "DIX-NEUF",
    ];
    const tens = [
      "",
      "",
      "VINGT",
      "TRENTE",
      "QUARANTE",
      "CINQUANTE",
      "SOIXANTE",
      "SOIXANTE-DIX",
      "QUATRE-VINGT",
      "QUATRE-VINGT-DIX",
    ];

    const convertUnder100 = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];

      const ten = Math.floor(n / 10);
      const unit = n % 10;

      if (ten === 7) {
        // Soixante-dix, soixante-et-onze, etc.
        if (unit === 1) return "SOIXANTE-ET-ONZE";
        if (unit === 0) return "SOIXANTE-DIX";
        if (unit >= 2) {
          // Pour 72-79, on utilise soixante + (10 + unit)
          const teenValue = 10 + unit;
          return `SOIXANTE-${teens[teenValue - 10]}`;
        }
        return "SOIXANTE-DIX";
      }

      if (ten === 9) {
        // Quatre-vingt-dix, quatre-vingt-onze, etc.
        if (unit === 1) return "QUATRE-VINGT-ONZE";
        if (unit === 0) return "QUATRE-VINGT-DIX";
        if (unit >= 2) {
          // Pour 92-99, on utilise quatre-vingt + (10 + unit)
          const teenValue = 10 + unit;
          return `QUATRE-VINGT-${teens[teenValue - 10]}`;
        }
        return "QUATRE-VINGT-DIX";
      }

      if (ten === 8) {
        // Quatre-vingt
        if (unit === 0) return "QUATRE-VINGT";
        return `QUATRE-VINGT-${units[unit]}`;
      }

      if (ten === 2 && unit === 1) {
        return "VINGT-ET-UN";
      }

      if (unit === 0) {
        return tens[ten];
      }

      return `${tens[ten]}-${units[unit]}`;
    };

    const convertUnder1000 = (n: number): string => {
      if (n === 0) return "";
      if (n < 100) return convertUnder100(n);

      const hundred = Math.floor(n / 100);
      const remainder = n % 100;

      let result = "";

      if (hundred === 1) {
        result = "CENT";
      } else {
        result = `${units[hundred]} CENT`;
      }

      if (remainder === 0) {
        return result;
      }

      if (remainder < 100) {
        return `${result} ${convertUnder100(remainder)}`;
      }

      return `${result} ${convertUnder100(remainder)}`;
    };

    const convertUnder1000000 = (n: number): string => {
      if (n === 0) return "";
      if (n < 1000) return convertUnder1000(n);

      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;

      let result = "";

      if (thousand === 1) {
        result = "MILLE";
      } else {
        result = `${convertUnder1000(thousand)} MILLE`;
      }

      if (remainder === 0) {
        return result;
      }

      return `${result} ${convertUnder1000(remainder)}`;
    };

    const convertUnder1000000000 = (n: number): string => {
      if (n === 0) return "";
      if (n < 1000000) return convertUnder1000000(n);

      const million = Math.floor(n / 1000000);
      const remainder = n % 1000000;

      let result = "";

      if (million === 1) {
        result = "UN MILLION";
      } else {
        result = `${convertUnder1000000(million)} MILLIONS`;
      }

      if (remainder === 0) {
        return result;
      }

      return `${result} ${convertUnder1000000(remainder)}`;
    };

    // Traitement principal
    if (num < 1000000000) {
      return convertUnder1000000000(num);
    }

    // Pour les milliards (si nécessaire)
    const billion = Math.floor(num / 1000000000);
    const remainder = num % 1000000000;

    let result = "";
    if (billion === 1) {
      result = "UN MILLIARD";
    } else {
      result = `${convertUnder1000000000(billion)} MILLIARDS`;
    }

    if (remainder === 0) {
      return result;
    }

    return `${result} ${convertUnder1000000000(remainder)}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span className="uppercase font-light">
                  Résultats Nationaux
                </span>
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                <span className="inline-flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Élections Présidentielles
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Préliminaires
                  </span>
                </span>
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={onClose}
                size="sm"
                className="no-print"
              >
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>

              {nationalResults && !loading && (
                <Button
                  onClick={handlePrint}
                  disabled={generatingPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white no-print disabled:opacity-50"
                  size="sm"
                >
                  {generatingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4 mr-2" />
                  )}
                  {generatingPDF ? "Génération..." : "Imprimer"}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto h-full p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">
                Chargement des résultats nationaux...
              </span>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Erreur</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadNationalResults}
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          )}

          {nationalResults && !loading && (
            <div ref={printRef} className="national-results-print">
              {/* Tableau 1: Statistiques Générales */}
              {nationalResults && (
                <div className="mb-8">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold flex items-center gap-2 no-print">
                      <Vote className="h-5 w-5 text-green-600" />
                      Statistiques Générales
                    </h3>
                  </div>
                  <div>
                    <table className="national-results-table stats-table">
                      <thead>
                        <tr>
                          {/* <th>Libellé</th>
                          <th>Sous-libellé</th>
                          <th>Valeur numérique</th>
                          <th>Valeur en lettres</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="stats-row-green">
                          <td>
                            <strong>Nombre de bureaux de vote</strong>
                          </td>
                          <td>
                            {formatNumber(
                              nationalResults.nombreBureauxVote || 0
                            )}
                          </td>
                          <td>
                            {numberToWords(
                              nationalResults.nombreBureauxVote || 0
                            )}
                          </td>
                        </tr>
                        <tr className="stats-row-green">
                          <td>
                            <strong>Inscrits</strong>
                          </td>
                          <td>{formatNumber(nationalResults.inscrits || 0)}</td>
                          <td>
                            {numberToWords(nationalResults.inscrits || 0)}
                          </td>
                        </tr>
                        <tr className="stats-row-green">
                          <td>
                            <strong>Votants</strong>
                          </td>
                          <td>{formatNumber(nationalResults.votants || 0)}</td>
                          <td>{numberToWords(nationalResults.votants || 0)}</td>
                        </tr>
                        <tr className="stats-row-white">
                          <td>
                            <strong>Taux de participation</strong>
                          </td>
                          <td>
                            {formatPercentage(
                              nationalResults.tauxParticipation || 0
                            )}
                          </td>
                          <td></td>
                        </tr>
                        <tr className="stats-row-white">
                          <td>
                            <strong>Bulletins nuls</strong>
                          </td>
                          <td>
                            {formatNumber(
                              nationalResults.bulletinsNuls?.nombre || 0
                            )}{" "}
                            (
                            {formatPercentage(
                              nationalResults.bulletinsNuls?.pourcentage || 0
                            )}
                            )
                          </td>
                          <td>
                            {numberToWords(
                              nationalResults.bulletinsNuls?.nombre || 0
                            )}
                          </td>
                        </tr>
                        <tr className="stats-row-green">
                          <td>
                            <strong>Suffrages exprimés</strong>
                          </td>
                          <td>
                            {formatNumber(nationalResults.suffrageExprime || 0)}
                          </td>
                          <td>
                            {numberToWords(
                              nationalResults.suffrageExprime || 0
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tableau 2: Résultats par Candidat */}
              {nationalResults.candidats &&
                nationalResults.candidats.length > 0 && (
                  <div className="mb-8 results-section">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold flex items-center gap-2 no-print">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        Résultats par Candidat
                      </h3>
                    </div>
                    <div>
                      <table className="national-results-table candidates-table">
                        <thead>
                          <tr>
                            <th colSpan={2}>CANDIDATS</th>
                            <th colSpan={2}>SCORE (chiffres / lettres)</th>
                            <th>POURCENTAGE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nationalResults.candidats.map(
                            (candidate: NationalCandidate, index: number) => {
                              return (
                                <tr
                                  key={candidate.numeroOrdre || index}
                                  className="candidate-row"
                                >
                                  <td>
                                    <span className="party-badge">
                                      {candidate.parti || "N/A"}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="candidate-info">
                                      {candidate.photo && (
                                        <img
                                          src={candidate.photo}
                                          alt={candidate.nom}
                                          className="candidate-photo"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      )}
                                      <span className="candidate-name">
                                        {candidate.nom || "N/A"}
                                      </span>
                                    </div>
                                  </td>
                                  <td>{formatNumber(candidate.score || 0)}</td>
                                  <td>{numberToWords(candidate.score || 0)}</td>
                                  <td>
                                    {formatPercentage(
                                      candidate.pourcentage || 0
                                    )}
                                  </td>
                                </tr>
                              );
                            }
                          )}

                          {/* Bulletins blancs */}
                          {nationalResults.bulletinsBlancs && (
                            <tr className="bulletins-blancs-row">
                              <td colSpan={2}>
                                <span className="bulletins-blancs-label">
                                  BULLETINS BLANCS
                                </span>
                              </td>
                              <td>
                                {formatNumber(
                                  nationalResults.bulletinsBlancs.nombre || 0
                                )}
                              </td>
                              <td>
                                {numberToWords(
                                  nationalResults.bulletinsBlancs.nombre || 0
                                )}
                              </td>
                              <td>
                                {formatPercentage(
                                  nationalResults.bulletinsBlancs.pourcentage ||
                                    0
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Informations supplémentaires */}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t bg-gray-50 px-6 py-4 no-print">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Statut :</span> Préliminaires
            {nationalResults?.candidats && (
              <span className="ml-4">
                <span className="font-medium">Candidats :</span>{" "}
                {nationalResults.candidats.length}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
