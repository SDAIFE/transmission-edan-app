"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { legislativesSupervisionApi } from "@/lib/api/legislatives-supervision";
import type {
  SupervisionDashboardResponse,
  SupervisionStatsResponse,
  Alerte,
} from "@/types/legislatives-supervision";
import { SupervisionDashboard } from "./supervision-dashboard";
import { SupervisionStats } from "./supervision-stats";
import { SupervisionCirconscriptionDetailsModal } from "./supervision-circonscription-details-modal";

export function SupervisionPageContent() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "stats">("dashboard");
  const [dashboardData, setDashboardData] = useState<SupervisionDashboardResponse | null>(null);
  const [statsData, setStatsData] = useState<SupervisionStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCirconscription, setSelectedCirconscription] = useState<string | null>(null);
  const [showCirconscriptionModal, setShowCirconscriptionModal] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await legislativesSupervisionApi.getDashboard();
      setDashboardData(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du chargement du tableau de bord";
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await legislativesSupervisionApi.getStats();
      setStatsData(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du chargement des statistiques";
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadDashboard();
    } else {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  if (loading && !dashboardData && !statsData) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }

  if (error && !dashboardData && !statsData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "dashboard" | "stats")}>
        <TabsList>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="stats">Statistiques avancées</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
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
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          {statsData ? (
            <SupervisionStats data={statsData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </TabsContent>
      </Tabs>

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






