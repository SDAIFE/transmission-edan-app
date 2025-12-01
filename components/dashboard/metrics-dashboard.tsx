"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  BarChart3,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useCirconscriptionMetrics } from "@/hooks/useCirconscriptionMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Props pour le composant
interface MetricsDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showRefreshButton?: boolean;
}

/**
 * Composant de tableau de bord des métriques des circonscriptions
 *
 * Caractéristiques :
 * - Vérification automatique des permissions (SADMIN/ADMIN)
 * - États de chargement et d'erreur gérés
 * - Interface utilisateur moderne avec shadcn/ui
 * - Rafraîchissement manuel et automatique
 * - Responsive design
 * - Accessibilité intégrée
 */
export function MetricsDashboard({
  className,
  autoRefresh = false,
  refreshInterval = 30000,
  showRefreshButton = true,
}: MetricsDashboardProps) {
  const { user, isAuthenticated } = useAuth();
  const { metrics, loading, error, refetch, lastFetch } =
    useCirconscriptionMetrics({
      autoRefresh,
      refreshInterval,
      enabled: true,
    });

  // ✅ PERMISSIONS : Vérification côté composant
  const hasPermission =
    isAuthenticated && ["SADMIN", "ADMIN"].includes(user?.role?.code || "");

  // Gestion du rafraîchissement manuel
  const handleRefresh = async () => {
    await refetch();
  };

  // Formatage de la date de dernière mise à jour
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return "Jamais";
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Vérification des permissions
  if (!hasPermission) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Accès refusé. Seuls les administrateurs (SADMIN/ADMIN) peuvent
              consulter ces métriques.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // État de chargement
  if (loading && !metrics) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Chargement des métriques...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // État d'erreur
  if (error && !metrics) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Erreur: {error}</span>
              {showRefreshButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
                  />
                  Réessayer
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Aucune donnée disponible
  if (!metrics) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>Aucune donnée disponible</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête avec titre et bouton de rafraîchissement */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Métriques des Circonscriptions</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Indicateur de dernière mise à jour */}
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour: {formatLastUpdate(lastFetch)}
          </div>

          {/* Bouton de rafraîchissement */}
          {showRefreshButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
              />
              Actualiser
            </Button>
          )}
        </div>
      </div>

      {/* Cartes de métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total des circonscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total.toLocaleString("fr-FR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Circonscriptions totales
            </p>
          </CardContent>
        </Card>

        {/* Circonscriptions publiées */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.published.toLocaleString("fr-FR")}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.publishedPercentage.toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        {/* Circonscriptions restantes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restantes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.remaining.toLocaleString("fr-FR")}
            </div>
            <p className="text-xs text-muted-foreground">À publier</p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progression de la publication
              </CardTitle>
              <CardDescription>
                {metrics.published.toLocaleString("fr-FR")} sur{" "}
                {metrics.total.toLocaleString("fr-FR")} circonscriptions
                publiées
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {metrics.publishedPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Complété</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={metrics.publishedPercentage}
            className="w-full h-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Indicateur de rafraîchissement automatique masqué mais le rafraîchissement reste actif */}
      {/* Le rafraîchissement automatique est géré par useCirconscriptionMetrics */}
    </div>
  );
}

/**
 * Version simplifiée du composant pour utilisation rapide
 */
export function SimpleMetricsDashboard() {
  return <MetricsDashboard autoRefresh={false} showRefreshButton={true} />;
}

/**
 * Version avec rafraîchissement automatique
 */
export function LiveMetricsDashboard({
  refreshInterval = 30000,
}: {
  refreshInterval?: number;
}) {
  return (
    <MetricsDashboard
      autoRefresh={true}
      refreshInterval={refreshInterval}
      showRefreshButton={true}
    />
  );
}
