"use client";

import { DashboardHeader } from "./dashboard-header";
import { DashboardStatsCards } from "./dashboard-stats-cards";
import { DashboardActions } from "./dashboard-actions";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { Building2, CheckCircle, Clock, FileText } from "lucide-react";
import type { UserResponseDto } from "@/types/auth";

interface UserDashboardContentProps {
  user: UserResponseDto;
}

export function UserDashboardContent({ user }: UserDashboardContentProps) {
  const { userMetrics, loading, error } = useDashboardMetrics();

  // Données spécifiques pour les utilisateurs USER (données restreintes)
  // ✅ CORRECTION : Ajout de vérifications de sécurité pour éviter les erreurs si les valeurs sont undefined
  const userStats = userMetrics
    ? [
        {
          label: "Nombre Total de CELs",
          value: userMetrics.totalCels ?? 0,
          icon: Building2,
          color: "text-primary",
        },
        {
          label: "CELs avec Import",
          value: userMetrics.celsAvecImport ?? 0,
          icon: CheckCircle,
          color: "text-green-600",
          subtitle: `Taux: ${(userMetrics.tauxProgression ?? 0).toFixed(1)}%`,
        },
        {
          label: "CELs sans Import",
          value: userMetrics.celsSansImport ?? 0,
          icon: Clock,
          color: "text-yellow-600",
        },
        {
          label: "CELs Assignées",
          value: userMetrics.celsAssignees ?? 0,
          icon: FileText,
          color: "text-purple-600",
          subtitle: `Progression: ${(
            userMetrics.tauxProgressionPersonnel ?? 0
          ).toFixed(1)}%`,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-8">
        <DashboardHeader user={user} title="Mes CELs Assignées" />
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <DashboardHeader user={user} title="Mes CELs Assignées" />
        <div className="text-center py-8">
          <p className="text-red-600">
            Erreur lors du chargement des métriques
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader user={user} title="Mes CELs Assignées" />

      {/* Composant de debug temporaire */}
      {/* <DashboardDebug /> */}

      <DashboardStatsCards stats={userStats} />

      <DashboardActions user={user} />
    </div>
  );
}
