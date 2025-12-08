"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import type { LegislativeStatsSectionProps } from "@/types/legislatives-publications";

export function LegislativeStatsSection({
  stats,
  loading = false,
}: LegislativeStatsSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Circonscriptions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Aucune donnée</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Circonscriptions",
      value: stats.totalCirconscriptions,
      icon: <Building2 className="h-4 w-4 text-blue-600" />,
      color: "default" as const,
    },
    {
      title: "Publiées",
      value: stats.publishedCirconscriptions,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      color: "success" as const,
      trend: {
        value: stats.publicationRate,
        isPositive: true,
      },
    },
    {
      title: "En Attente",
      value: stats.pendingCirconscriptions,
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      color: "warning" as const,
    },
    // {
    //   title: "Total CELs",
    //   value: stats.totalCels,
    //   icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
    //   color: "default" as const,
    // },
    // {
    //   title: "CELs Importées",
    //   value: stats.importedCels,
    //   icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    //   color: "success" as const,
    // },
    // {
    //   title: "CELs en Attente",
    //   value: stats.pendingCels,
    //   icon: <Clock className="h-4 w-4 text-yellow-600" />,
    //   color: "warning" as const,
    // },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        📊 Statistiques des Circonscriptions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <LegislativeStatsCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}

interface LegislativeStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "default" | "success" | "warning" | "error";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function LegislativeStatsCard({
  title,
  value,
  icon,
  color = "default",
  trend,
}: LegislativeStatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString("fr-FR")}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span>Taux: {trend.value.toFixed(2)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

