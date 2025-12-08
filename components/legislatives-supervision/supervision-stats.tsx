"use client";

import { useMemo } from "react";
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

  const formatDateShort = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  // Préparer les données pour les graphiques
  const publicationChartData = useMemo(() => {
    return data.tendances.evolutionPublication.map((point) => ({
      date: formatDateShort(point.date),
      dateFull: point.date,
      publications: point.nombrePubliees || 0,
    }));
  }, [data.tendances.evolutionPublication]);

  const importsChartData = useMemo(() => {
    return data.tendances.evolutionImports.map((point) => ({
      date: formatDateShort(point.date),
      dateFull: point.date,
      imports: point.nombreImports || 0,
    }));
  }, [data.tendances.evolutionImports]);

  // Préparer les données pour le graphique des régions
  const regionsChartData = useMemo(() => {
    return Object.entries(data.analyses.circonscriptionsParRegion).map(
      ([code, count]) => ({
        region: `Région ${code}`,
        count,
      })
    );
  }, [data.analyses.circonscriptionsParRegion]);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString("fr-FR")}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

          {/* Graphique des circonscriptions par région */}
          {regionsChartData.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Circonscriptions par Région</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis
                    dataKey="region"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    stroke="#6b7280"
                  />
                  <YAxis
                    fontSize={11}
                    stroke="#6b7280"
                    tickFormatter={(value) => value.toLocaleString("fr-FR")}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    name="Nombre de circonscriptions"
                  />
                </BarChart>
              </ResponsiveContainer>
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
            {publicationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={publicationChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    fontSize={11}
                    stroke="#6b7280"
                    tickFormatter={(value) => value.toLocaleString("fr-FR")}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="publications"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Publications"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune donnée disponible
              </p>
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
            {importsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={importsChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    fontSize={11}
                    stroke="#6b7280"
                    tickFormatter={(value) => value.toLocaleString("fr-FR")}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="imports"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Imports"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune donnée disponible
              </p>
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






