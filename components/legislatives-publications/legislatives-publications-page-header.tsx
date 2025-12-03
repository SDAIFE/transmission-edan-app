"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, BarChart3, FileText } from "lucide-react";

interface LegislativesPublicationsPageHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
  isUser?: boolean;
}

export function LegislativesPublicationsPageHeader({
  onRefresh,
  loading = false,
  isUser = false,
}: LegislativesPublicationsPageHeaderProps) {
  const title = isUser ? "Consolidation" : "Publication";
  const description = isUser
    ? "Consolidation des résultats législatives par circonscription"
    : "Gestion des publications des résultats législatives par circonscription";
  const actionText = isUser
    ? "Consultez les résultats consolidés par circonscription"
    : "Gérez la publication des résultats électoraux par circonscription";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {title} des Résultats Législatives
              </CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </div>
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{actionText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

