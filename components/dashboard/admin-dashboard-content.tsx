"use client";

import { DashboardHeader } from "./dashboard-header";
import { DashboardActions } from "./dashboard-actions";
import { RealtimeMetrics } from "./realtime-metrics";
import { MetricsDashboard } from "./metrics-dashboard";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import type { UserResponseDto } from "@/types/auth";

interface AdminDashboardContentProps {
  user: UserResponseDto;
}

export function AdminDashboardContent({ user }: AdminDashboardContentProps) {
  const userRole = user?.role?.code;
  const { loading, error, refreshMetrics } = useDashboardMetrics();

  // Données spécifiques pour les administrateurs (toutes les données)
  // const adminStats = adminMetrics ? [
  //   {
  //     label: 'Nombre Total de CELs',
  //     value: adminMetrics.totalCels,
  //     icon: Building2,
  //     color: 'text-primary'
  //   },
  //   {
  //     label: 'CELs avec Import',
  //     value: adminMetrics.celsAvecImport,
  //     icon: CheckCircle,
  //     color: 'text-green-600',
  //     subtitle: `Taux: ${adminMetrics.tauxProgression.toFixed(1)}%`
  //   },
  //   {
  //     label: 'CELs sans Import',
  //     value: adminMetrics.celsSansImport,
  //     icon: Clock,
  //     color: 'text-yellow-600'
  //   },
  //   {
  //     label: 'Nombre d\'Erreurs',
  //     value: adminMetrics.nombreErreurs,
  //     icon: Users,
  //     color: 'text-red-600',
  //     subtitle: 'Imports en erreur'
  //   }
  // ] : [];

  // Stats supplémentaires pour SADMIN
  // const sadminStats = adminMetrics && isSadminMetrics(adminMetrics) ? [
  //   {
  //     label: 'Total Régions',
  //     value: adminMetrics.totalRegions,
  //     icon: MapPin,
  //     color: 'text-blue-600'
  //   },
  //   {
  //     label: 'Total Départements',
  //     value: adminMetrics.totalDepartements,
  //     icon: Building2,
  //     color: 'text-indigo-600'
  //   },
  //   {
  //     label: 'Total Utilisateurs',
  //     value: adminMetrics.totalUtilisateurs,
  //     icon: UserCheck,
  //     color: 'text-purple-600'
  //   },
  //   {
  //     label: 'Imports (7j)',
  //     value: adminMetrics.importsParJour.reduce((sum, day) => sum + day.nombreImports, 0),
  //     icon: BarChart3,
  //     color: 'text-green-600',
  //     subtitle: 'Dernière semaine'
  //   }
  // ] : [];

  const getTitle = () => {
    switch (userRole) {
      case "ADMIN":
        return "Gestion des Circonscriptions";
      case "SADMIN":
        return "Vue Globale du Système";
      default:
        return "Tableau de Bord Administrateur";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <DashboardHeader user={user} title={getTitle()} />
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <DashboardHeader user={user} title={getTitle()} />
        <div className="text-center py-8">
          <p className="text-red-600">
            Erreur lors du chargement des métriques
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={refreshMetrics}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader user={user} title={getTitle()} />

      {/* 📊 NOUVEAU : Métriques des circonscriptions pour SADMIN et ADMIN */}
      {["SADMIN", "ADMIN"].includes(userRole || "") && (
        <MetricsDashboard
          autoRefresh={true}
          refreshInterval={60000} // 1 minute
          showRefreshButton={true}
          className="mb-8"
        />
      )}

      {/* Métriques temps réel pour les administrateurs */}
      <RealtimeMetrics
        enabled={true}
        refreshInterval={60000} // 60 secondes (1 minute) - réduit pour éviter la surcharge
      />

      <DashboardActions user={user} />
    </div>
  );
}
