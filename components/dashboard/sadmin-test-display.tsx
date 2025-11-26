'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import type { SadminDashboardStatsDto } from '@/types/dashboard';

/**
 * Composant de test pour vérifier l'affichage des métriques SADMIN
 * À supprimer une fois les tests terminés
 */
export function SadminTestDisplay() {
  const { user } = useAuth();
  const { adminMetrics, loading, error } = useDashboardMetrics();

  // Fonction pour vérifier si les métriques sont de type SADMIN
  const isSadminMetrics = (metrics: any): metrics is SadminDashboardStatsDto => {
    return metrics && 'totalRegions' in metrics && 'totalDepartements' in metrics;
  };

  if (user?.role?.code !== 'SADMIN') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Ce composant de test n'est visible que pour les utilisateurs SADMIN
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">Chargement des métriques SADMIN...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error}</p>
      </div>
    );
  }

  if (!adminMetrics || !isSadminMetrics(adminMetrics)) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-800">Aucune métrique SADMIN disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-green-800 mb-2">
          ✅ Test des Métriques SADMIN
        </h3>
        <p className="text-green-700">
          Les nouvelles métriques SADMIN sont correctement chargées !
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-800 mb-2">Métriques de Base</h4>
          <ul className="space-y-1 text-sm">
            <li>Total CELs: <span className="font-bold">{adminMetrics.totalCels}</span></li>
            <li>Total Régions: <span className="font-bold">{adminMetrics.totalRegions}</span></li>
            <li>Total Départements: <span className="font-bold">{adminMetrics.totalDepartements}</span></li>
            <li>Total Utilisateurs: <span className="font-bold">{adminMetrics.totalUtilisateurs}</span></li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-800 mb-2">Utilisateurs par Rôle</h4>
          <ul className="space-y-1 text-sm">
            {adminMetrics.utilisateursParRole.map((roleData, index) => (
              <li key={index}>
                {roleData.role}: <span className="font-bold">{roleData.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-bold text-gray-800 mb-2">Imports des 7 derniers jours</h4>
        <div className="grid gap-2 md:grid-cols-7">
          {adminMetrics.importsParJour.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600">{day.date}</div>
              <div className="font-bold text-sm">{day.nombreImports}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
