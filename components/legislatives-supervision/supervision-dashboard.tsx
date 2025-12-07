"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableColumnsType } from "antd";
import {
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MapPin,
  Eye,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type {
  SupervisionDashboardResponse,
  Alerte,
  RegionSupervision,
  HistoriqueEntry,
} from "@/types/legislatives-supervision";

interface SupervisionDashboardProps {
  data: SupervisionDashboardResponse;
  onCirconscriptionClick?: (codeCirconscription: string) => void;
  onAlerteClick?: (alerte: Alerte) => void;
}

export function SupervisionDashboard({
  data,
  onCirconscriptionClick,
  onAlerteClick,
}: SupervisionDashboardProps) {
  const formatNumber = (value: number): string => {
    return value.toLocaleString("fr-FR");
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAlerteIcon = (type: string) => {
    switch (type) {
      case "ANOMALIE":
        return <AlertCircle className="h-4 w-4" />;
      case "RETARD":
        return <Clock className="h-4 w-4" />;
      case "ERREUR":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlerteColor = (priorite: string) => {
    switch (priorite) {
      case "HAUTE":
        return "destructive";
      case "MOYENNE":
        return "default";
      case "BASSE":
        return "secondary";
      default:
        return "default";
    }
  };

  // Colonnes pour le tableau des régions
  const regionsColumns: TableColumnsType<RegionSupervision> = [
    {
      title: "Code",
      dataIndex: "codeRegion",
      key: "codeRegion",
      width: 80,
    },
    {
      title: "Région",
      dataIndex: "libelleRegion",
      key: "libelleRegion",
      width: 200,
    },
    {
      title: "Circonscriptions",
      dataIndex: "nombreCirconscriptions",
      key: "nombreCirconscriptions",
      width: 120,
      align: "center",
      render: (value: number) => formatNumber(value),
    },
    {
      title: "Taux Publication",
      dataIndex: "tauxPublication",
      key: "tauxPublication",
      width: 120,
      align: "center",
      render: (value: number) => (
        <Badge variant={value >= 80 ? "default" : value >= 50 ? "secondary" : "destructive"}>
          {formatPercentage(value)}
        </Badge>
      ),
    },
    {
      title: "CELs en Attente",
      dataIndex: "celsEnAttente",
      key: "celsEnAttente",
      width: 120,
      align: "center",
      render: (value: number) => (
        <span className={value > 0 ? "text-yellow-600 font-medium" : ""}>
          {formatNumber(value)}
        </span>
      ),
    },
  ];

  // Colonnes pour le tableau des alertes
  const alertesColumns: TableColumnsType<Alerte> = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <div className="flex items-center gap-2">
          {getAlerteIcon(type)}
          <span>{type}</span>
        </div>
      ),
    },
    {
      title: "Priorité",
      dataIndex: "priorite",
      key: "priorite",
      width: 100,
      render: (priorite: string) => (
        <Badge variant={getAlerteColor(priorite) as any}>{priorite}</Badge>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Circonscription",
      dataIndex: "codeCirconscription",
      key: "codeCirconscription",
      width: 120,
      render: (code: string | undefined) =>
        code ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => code && onCirconscriptionClick?.(code)}
            className="h-auto p-0"
          >
            {code}
          </Button>
        ) : (
          "-"
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_: unknown, record: Alerte) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAlerteClick?.(record)}
          className="h-8"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Colonnes pour l'historique
  const historiqueColumns: TableColumnsType<HistoriqueEntry> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 180,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      ellipsis: true,
    },
    {
      title: "Circonscription",
      dataIndex: "codeCirconscription",
      key: "codeCirconscription",
      width: 120,
      render: (code: string | undefined) =>
        code ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => code && onCirconscriptionClick?.(code)}
            className="h-auto p-0"
          >
            {code}
          </Button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Circonscriptions</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.vueEnsemble.totalCirconscriptions)}</div>
            <p className="text-xs text-muted-foreground">
              Taux de publication: {formatPercentage(data.vueEnsemble.tauxPublication)}
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
              {formatNumber(data.vueEnsemble.circonscriptionsPubliees)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(
                (data.vueEnsemble.circonscriptionsPubliees /
                  data.vueEnsemble.totalCirconscriptions) *
                  100
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(data.vueEnsemble.circonscriptionsEnAttente)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(
                (data.vueEnsemble.circonscriptionsEnAttente /
                  data.vueEnsemble.totalCirconscriptions) *
                  100
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Publication</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(data.vueEnsemble.tauxPublication)}
            </div>
            <p className="text-xs text-muted-foreground">Global</p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métriques de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Temps Moyen Publication</p>
              <p className="text-xl font-bold">{data.metriquesPerformance.tempsMoyenPublication} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taux d&apos;Erreur</p>
              <p className="text-xl font-bold text-red-600">
                {formatPercentage(data.metriquesPerformance.tauxErreur)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Imports Réussis</p>
              <p className="text-xl font-bold text-green-600">
                {formatNumber(data.metriquesPerformance.nombreImportsReussis)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Imports Échoués</p>
              <p className="text-xl font-bold text-red-600">
                {formatNumber(data.metriquesPerformance.nombreImportsEchoues)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes */}
      {data.alertes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertes ({data.alertes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={alertesColumns}
              dataSource={data.alertes}
              rowKey={(record, index) => `alerte-${index}`}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </CardContent>
        </Card>
      )}

      {/* Statistiques par région */}
      {data.regions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Statistiques par Région ({data.regions.length} régions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={regionsColumns}
              dataSource={data.regions}
              rowKey="codeRegion"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </CardContent>
        </Card>
      )}

      {/* Historique récent */}
      {data.historique.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique Récent</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={historiqueColumns}
              dataSource={data.historique.slice(0, 10)}
              rowKey={(record, index) => `hist-${index}`}
              pagination={false}
              size="small"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}






