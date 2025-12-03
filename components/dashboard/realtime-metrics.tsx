"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  RefreshCw,
  Activity,
  Building2,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import type { RealtimeMetricsDto } from "@/types/dashboard";

interface RealtimeMetricsProps {
  enabled?: boolean;
  refreshInterval?: number; // en millisecondes
}

export function RealtimeMetrics({
  enabled = true,
  refreshInterval = 60000, // 60 secondes (1 minute) - optimisé pour réduire la charge
}: RealtimeMetricsProps) {
  const [metrics, setMetrics] = useState<RealtimeMetricsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ PROXY : Utilise dashboardApi qui passe automatiquement par le proxy Next.js
      const data = await dashboardApi.getRealtimeMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        response?: { status?: number };
      };

      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ [RealtimeMetrics] Erreur API:", errorObj);
      }

      // Gestion spécifique des erreurs
      if (errorObj.response?.status === 401) {
        setError("Session expirée. Redirection automatique...");
        // L'intercepteur gère déjà la redirection
      } else {
        setError(
          errorObj.message || "Erreur lors de la récupération des métriques"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Chargement initial
    fetchMetrics();

    // Rafraîchissement automatique
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [enabled, refreshInterval]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("fr-FR");
  };

  if (!enabled || !metrics) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-primary font-bold">
            Métriques Temps Réel
          </h2>
          <p className="text-muted-foreground">
            Dernière mise à jour : {formatTimestamp(metrics.timestamp)}
          </p>
        </div>
        <Button
          onClick={fetchMetrics}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CELs</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCels}</div>
            <p className="text-xs text-muted-foreground">
              Taux:{" "}
              {(
                metrics.tauxProgression ||
                metrics.tauxProgressionPersonnel ||
                0
              ).toFixed(1)}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec Import</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.celsAvecImport}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.celsParStatut.imported} importées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sans Import</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.celsSansImport}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.celsParStatut.pending} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.nombreErreurs}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.celsParStatut.error} critiques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques des départements */}
      {metrics.departements && (
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
                  {metrics.departements.totalDepartements}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Publiés</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {metrics.departements.departementsPubliés}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">En Attente</span>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  {metrics.departements.departementsEnAttente}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Taux Publication</span>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  {metrics.departements.tauxPublication.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente (24h)</CardTitle>
          <CardDescription>Activité des dernières 24 heures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* ✅ ADAPTATION : Utilise imports24h (USER) ou importsAujourdhui (ADMIN/SADMIN) */}
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Imports (24h)</span>
              <Badge variant="secondary">
                {metrics.activiteRecente.imports24h ||
                  metrics.activiteRecente.importsAujourdhui ||
                  0}
              </Badge>
            </div>
            {/* ✅ ADAPTATION : Publications (ADMIN/SADMIN uniquement) */}
            {metrics.activiteRecente.publicationsAujourdhui !== undefined && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  Publications aujourd&apos;hui
                </span>
                <Badge variant="secondary">
                  {metrics.activiteRecente.publicationsAujourdhui}
                </Badge>
              </div>
            )}
            {/* ✅ ADAPTATION : Connexions (ADMIN/SADMIN uniquement) */}
            {metrics.activiteRecente.connexionsAujourdhui !== undefined && (
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">
                  Connexions aujourd&apos;hui
                </span>
                <Badge variant="secondary">
                  {metrics.activiteRecente.connexionsAujourdhui}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Imports en cours */}
      {/* ✅ ADAPTATION : Utilise count/imports (nouveau format) ou nombre/liste (ancien format) */}
      {/* {(metrics.importsEnCours.count || metrics.importsEnCours.nombre || 0) >
        0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imports en Cours</CardTitle>
            <CardDescription>
              {metrics.importsEnCours.count ||
                metrics.importsEnCours.nombre ||
                0}{" "}
              import(s) en cours de traitement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* ✅ ADAPTATION : Utilise imports (nouveau format) ou liste (ancien format) */}
              {/* {(
                metrics.importsEnCours.imports ||
                metrics.importsEnCours.liste ||
                []
              ).map(
                (
                  importItem: {
                    id?: number;
                    COD_CE?: string;
                    codeCellule?: string;
                    NOM_FICHIER?: string;
                    nomFichier?: string;
                    STATUT_IMPORT?: string;
                    DATE_IMPORT?: string;
                    dateImport?: string;
                  },
                  index: number
                ) => (
                  <div
                    key={importItem.id || index}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded"
                  >
                    <div>
                      {/* ✅ ADAPTATION : Structure selon le format (nouveau ou ancien) */}
                      {/* <span className="font-medium">
                        {importItem.COD_CE || importItem.codeCellule || "N/A"}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {importItem.NOM_FICHIER ||
                          importItem.nomFichier ||
                          "Fichier inconnu"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {importItem.STATUT_IMPORT && (
                        <Badge variant="outline">
                          {importItem.STATUT_IMPORT}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(
                          importItem.DATE_IMPORT || importItem.dateImport || ""
                        )}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent> */}
       {/* </div> </Card> */}
      {/* )} */} 

      {/* Alertes critiques */}
      {/* {(metrics.alertesCritiques.celsEnErreurCritique > 0 || 
        metrics.alertesCritiques.importsBloques > 0 || 
        metrics.alertesCritiques.departementsNonPublies > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Alertes Critiques</CardTitle>
            <CardDescription className="text-red-600">
              Attention : Des problèmes critiques nécessitent votre intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.alertesCritiques.celsEnErreurCritique > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">
                    {metrics.alertesCritiques.celsEnErreurCritique} CEL(s) en erreur critique
                  </span>
                </div>
              )}
              {metrics.alertesCritiques.importsBloques > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm">
                    {metrics.alertesCritiques.importsBloques} import(s) bloqué(s)
                  </span>
                </div>
              )}
              {metrics.alertesCritiques.departementsNonPublies > 0 && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-red-600" />
                  <span className="text-sm">
                    {metrics.alertesCritiques.departementsNonPublies} département(s) non publié(s)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )} */}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
