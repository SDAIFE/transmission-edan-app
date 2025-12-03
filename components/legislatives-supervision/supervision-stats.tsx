"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  MapPin,
  Activity,
} from "lucide-react";
import type { SupervisionStatsProps } from "@/types/legislatives-supervision";

export function SupervisionStats({ data }: SupervisionStatsProps) {
  const formatNumber = (value: number): string => {
    return value.toLocaleString("fr-FR");
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Circonscriptions</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.statistiques.totalCirconscriptions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Taux: {formatPercentage(data.statistiques.tauxPublication)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(data.statistiques.circonscriptionsPubliees)}
            </div>
            <p className="text-xs text-muted-foreground">Circonscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(data.statistiques.circonscriptionsEnAttente)}
            </div>
            <p className="text-xs text-muted-foreground">Circonscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CELs</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.statistiques.totalCels)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.statistiques.celsImportees)} importées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analyses Comparatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taux de Participation Moyen</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatPercentage(data.analyses.tauxParticipationMoyen)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taux de Participation Minimum</p>
              <p className="text-3xl font-bold text-yellow-600">
                {formatPercentage(data.analyses.tauxParticipationMin)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taux de Participation Maximum</p>
              <p className="text-3xl font-bold text-green-600">
                {formatPercentage(data.analyses.tauxParticipationMax)}
              </p>
            </div>
          </div>

          {/* Circonscriptions par région */}
          {Object.keys(data.analyses.circonscriptionsParRegion).length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Circonscriptions par Région</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.analyses.circonscriptionsParRegion).map(([code, count]) => (
                  <div key={code} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Région {code}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tendances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.tendances.evolutionPublication.length > 0 ? (
              <div className="space-y-2">
                {data.tendances.evolutionPublication.slice(0, 10).map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{formatDate(point.date)}</span>
                    <Badge>{point.nombrePubliees || 0} publiées</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Évolution des Imports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.tendances.evolutionImports.length > 0 ? (
              <div className="space-y-2">
                {data.tendances.evolutionImports.slice(0, 10).map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{formatDate(point.date)}</span>
                    <Badge>{point.nombreImports || 0} imports</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rapports de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rapports de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Temps Moyen Import</p>
              <p className="text-xl font-bold">{data.rapports.tempsMoyenImport} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temps Moyen Publication</p>
              <p className="text-xl font-bold">{data.rapports.tempsMoyenPublication} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taux Réussite Import</p>
              <p className="text-xl font-bold text-green-600">
                {formatPercentage(data.rapports.tauxReussiteImport)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taux Réussite Publication</p>
              <p className="text-xl font-bold text-green-600">
                {formatPercentage(data.rapports.tauxReussitePublication)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

