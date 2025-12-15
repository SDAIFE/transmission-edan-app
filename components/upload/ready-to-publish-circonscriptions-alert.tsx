"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
} from "lucide-react";
import type { ReadyToPublishCirconscription } from "@/types/upload";

interface ReadyToPublishCirconscriptionsAlertProps {
  circonscriptions: ReadyToPublishCirconscription[];
  loading?: boolean;
  onViewDetails?: (codeCirconscription: string) => void;
  isUser?: boolean;
}

/**
 * Composant d'alerte pour les circonscriptions prêtes à être publiées
 *
 * Une circonscription est considérée comme "prête" quand :
 * - Toutes ses CELs ont été importées (importedCels === totalCels)
 * - Elle n'est pas encore publiée (STAT_PUB != '1')
 */
export function ReadyToPublishCirconscriptionsAlert({
  circonscriptions,
  loading = false,
  onViewDetails,
  isUser = false,
}: ReadyToPublishCirconscriptionsAlertProps) {
  // Calculer les statistiques
  const stats = {
    total: circonscriptions.length,
    totalImportedCels: circonscriptions.reduce(
      (sum, circ) => sum + circ.importedCels,
      0
    ),
    totalPendingCels: circonscriptions.reduce(
      (sum, circ) => sum + circ.pendingCels,
      0
    ),
  };

  // Fonction pour gérer le clic sur une circonscription
  const handleCirconscriptionClick = (codeCirconscription: string) => {
    if (onViewDetails) {
      onViewDetails(codeCirconscription);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Ne pas afficher l'alerte s'il n'y a pas de circonscriptions prêtes
  if (loading || circonscriptions.length === 0) {
    return null;
  }

  // Pour les utilisateurs USER, afficher une version plus compacte
  if (isUser) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <AlertTitle className="text-green-900">
              {stats.total} circonscription{stats.total > 1 ? "s" : ""} prête
              {stats.total > 1 ? "s" : ""} pour consolidation
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {stats.totalImportedCels} CELs importées sur{" "}
              {stats.totalImportedCels + stats.totalPendingCels}
            </AlertDescription>
            {/* Liste cliquable des circonscriptions pour USER */}
            <div className="flex flex-wrap gap-2 mt-2">
              {circonscriptions.map((circ) => (
                <button
                  key={circ.codeCirconscription}
                  onClick={() =>
                    handleCirconscriptionClick(circ.codeCirconscription)
                  }
                  className="text-xs px-2 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                >
                  <MapPin className="h-3 w-3" />
                  {circ.libelleCirconscription || circ.codeCirconscription}
                </button>
              ))}
            </div>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            {stats.total} prête{stats.total > 1 ? "s" : ""}
          </Badge>
        </div>
      </Alert>
    );
  }

  const actionText = isUser ? "consolidation" : "publication";

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle className="text-blue-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {stats.total} circonscription{stats.total > 1 ? "s" : ""} prête
              {stats.total > 1 ? "s" : ""} pour la {actionText}
            </AlertTitle>
            <AlertDescription className="text-blue-700 mt-1">
              {stats.total > 1
                ? `Ces circonscriptions ont toutes leurs CELs importées et peuvent être ${
                    isUser ? "consolidées" : "publiées"
                  }.`
                : `Cette circonscription a toutes ses CELs importées et peut être ${
                    isUser ? "consolidée" : "publiée"
                  }.`}
            </AlertDescription>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">
                <strong>{stats.total}</strong> circonscription
                {stats.total > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-blue-700">
                <strong>{stats.totalImportedCels}</strong> CELs importées
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-blue-700">
                <strong>100%</strong> complété
              </span>
            </div>
          </div>

          {/* Liste des circonscriptions prêtes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-900">
              Circonscriptions prêtes :
            </h4>
            <div className="flex flex-wrap gap-2">
              {circonscriptions.map((circ) => (
                <Card
                  key={circ.codeCirconscription}
                  className="p-3 border transition-colors cursor-pointer hover:shadow-sm bg-white border-blue-200 hover:border-blue-300"
                  onClick={() =>
                    handleCirconscriptionClick(circ.codeCirconscription)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-blue-700 border-blue-300"
                        >
                          {circ.codeCirconscription}
                        </Badge>
                        <span className="text-sm font-medium text-blue-900 truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {circ.libelleCirconscription || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-blue-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {circ.importedCels}/{circ.totalCels} CELs importées
                        </span>
                        {circ.lastImportDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(circ.lastImportDate)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        Cliquez pour voir les détails
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
}
