"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle, Clock, Globe } from "lucide-react";
import type { RealtimeMetricsDto } from "@/types/dashboard";

/**
 * Composant de test pour les métriques temps réel avec les données des départements
 * À supprimer une fois les tests terminés
 */
export function RealtimeMetricsTest() {
  // Données mockées pour tester l'affichage
  const mockRealtimeMetrics: RealtimeMetricsDto = {
    totalCels: 564,
    celsAvecImport: 0,
    celsSansImport: 564,
    tauxProgression: 0,
    celsParStatut: {
      pending: 0,
      imported: 0,
      error: 0,
      processing: 0,
    },
    nombreErreurs: 0,
    alertes: {
      celsSansImport: 564,
      celsEnErreur: 0,
      celsEnAttente: 0,
    },
    timestamp: new Date().toISOString(),
    activiteRecente: {
      imports24h: 0,
      importsAujourdhui: 0,
      publicationsAujourdhui: 0,
      connexionsAujourdhui: 5,
      timestamp: new Date().toISOString(),
    },
    importsEnCours: {
      count: 0,
      imports: [],
      nombre: 0,
      liste: [],
    },
    alertesCritiques: {
      importsErreur: 0,
      timestamp: new Date().toISOString(),
      celsEnErreurCritique: 0,
      importsBloques: 0,
      utilisateursInactifs: 0,
      departementsNonPublies: 114,
    },
    departements: {
      totalDepartements: 114,
      departementsPubliés: 0,
      departementsEnAttente: 114,
      tauxPublication: 0,
    },
  };

  return (
    <div className="space-y-4">
      {/* Métriques des départements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Métriques des Départements
          </CardTitle>
          <CardDescription>
            État des publications par département
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Départements</span>
              <Badge variant="outline">
                {mockRealtimeMetrics.departements?.totalDepartements ?? 0}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Publiés</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {mockRealtimeMetrics.departements?.departementsPubliés ?? 0}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">En Attente</span>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                {mockRealtimeMetrics.departements?.departementsEnAttente ?? 0}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Taux Publication</span>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
                {(
                  mockRealtimeMetrics.departements?.tauxPublication ?? 0
                ).toFixed(1)}
                %
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
