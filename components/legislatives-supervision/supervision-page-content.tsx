"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { legislativesSupervisionApi } from "@/lib/api/legislatives-supervision";
import type {
  SupervisionDashboardResponse,
  Alerte,
} from "@/types/legislatives-supervision";
import { SupervisionDashboard } from "./supervision-dashboard";
import { SupervisionCirconscriptionDetailsModal } from "./supervision-circonscription-details-modal";

// Durée de cache en millisecondes (45 secondes)
const CACHE_DURATION = 45 * 1000;
// Intervalle de rafraîchissement automatique en millisecondes
const AUTO_REFRESH_INTERVAL_DASHBOARD = 2 * 60 * 1000; // 2 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function SupervisionPageContent() {
  const [dashboardData, setDashboardData] =
    useState<SupervisionDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCirconscription, setSelectedCirconscription] = useState<
    string | null
  >(null);
  const [showCirconscriptionModal, setShowCirconscriptionModal] =
    useState(false);

  // Cache pour les données
  const dashboardCache =
    useRef<CachedData<SupervisionDashboardResponse> | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    // Vérifier le cache si pas de rafraîchissement forcé
    if (!forceRefresh && dashboardCache.current) {
      const cacheAge = Date.now() - dashboardCache.current.timestamp;
      if (cacheAge < CACHE_DURATION) {
        setDashboardData(dashboardCache.current.data);
        setLoading(false);
        return;
      }
    }

    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await legislativesSupervisionApi.getDashboard();
      setDashboardData(data);
      dashboardCache.current = { data, timestamp: Date.now() };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du tableau de bord";
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  // Charger les données au montage
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Rafraîchissement automatique
  useEffect(() => {
    // Nettoyer l'intervalle précédent
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Définir l'intervalle pour le dashboard
    refreshIntervalRef.current = setInterval(() => {
      loadDashboard(true);
    }, AUTO_REFRESH_INTERVAL_DASHBOARD);

    // Nettoyer l'intervalle au démontage
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadDashboard]);

  const handleCirconscriptionClick = (codeCirconscription: string) => {
    setSelectedCirconscription(codeCirconscription);
    setShowCirconscriptionModal(true);
  };

  const handleAlerteClick = (alerte: Alerte) => {
    if (alerte.codeCirconscription) {
      handleCirconscriptionClick(alerte.codeCirconscription);
    } else {
      toast.info("Alerte", {
        description: alerte.message,
      });
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Rafraîchissement..." : "Rafraîchir"}
        </Button>
      </div>

      {dashboardData ? (
        <SupervisionDashboard
          data={dashboardData}
          onCirconscriptionClick={handleCirconscriptionClick}
          onAlerteClick={handleAlerteClick}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Aucune donnée disponible
        </div>
      )}

      {/* Modal de détails de circonscription */}
      {selectedCirconscription && (
        <SupervisionCirconscriptionDetailsModal
          codeCirconscription={selectedCirconscription}
          isOpen={showCirconscriptionModal}
          onClose={() => {
            setShowCirconscriptionModal(false);
            setSelectedCirconscription(null);
          }}
        />
      )}
    </div>
  );
}
