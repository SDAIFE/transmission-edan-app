'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Vote, 
  Download,
  Trophy,
  Award,
  Target
} from 'lucide-react';
import { ResultsChart } from './results-chart';
import type { ZoneResultsData } from '@/lib/services/zoneResultsService';

interface ZoneResultsDisplayProps {
  results: ZoneResultsData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const ZoneResultsDisplay: React.FC<ZoneResultsDisplayProps> = ({ 
  results, 
  loading, 
  error, 
  onRefresh 
}) => {
  // Fonction utilitaire pour convertir les données de zone en format Candidate
  const convertToCandidateFormat = (candidate: any) => ({
    id: candidate.candidateId,
    firstName: candidate.candidateName.split(' ')[0] || '',
    lastName: candidate.candidateName.split(' ').slice(1).join(' ') || '',
    fullName: candidate.candidateName,
    numero: candidate.candidateNumber,
    photo: '', // Pas de photo disponible dans les données de zone
    party: {
      id: candidate.candidateId + '-party', // ID généré pour le parti
      name: candidate.partyName,
      sigle: candidate.partyName.substring(0, 3).toUpperCase(), // Sigle généré
      logo: '', // Pas de logo disponible
      color: candidate.partyColor
    },
    results: {
      votes: candidate.votes,
      percentage: candidate.percentage,
      rank: candidate.rank,
      isWinner: candidate.isWinner,
      isTied: candidate.isTied
    },
    statistics: {
      totalExprimes: candidate.votes,
      voteShare: candidate.percentage,
      trend: "stable" as const
    }
  });

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Chargement des résultats...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-600" />
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={onRefresh} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            Aucun résultat disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              Sélectionnez une zone pour voir ses résultats détaillés.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { zoneInfo, statistics, results: candidatesResults, summary } = results;

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de la zone */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Résultats pour {zoneInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Informations de la zone */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Zone sélectionnée :</h4>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  {zoneInfo.type === 'region' && 'Région'}
                  {zoneInfo.type === 'department' && 'Département'}
                  {zoneInfo.type === 'votingPlace' && 'Lieu de vote'}
                  {zoneInfo.type === 'pollingStation' && 'Bureau de vote'}
                </Badge>
                <span className="text-sm font-medium text-gray-700">{zoneInfo.name}</span>
                {zoneInfo.parentZone && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{zoneInfo.parentZone.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Inscrits</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {statistics.totalInscrits.toLocaleString('fr-FR')}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Votants</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {statistics.totalVotants.toLocaleString('fr-FR')}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Participation</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {statistics.tauxParticipation.toFixed(1)}%
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Exprimés</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {statistics.totalExprimes.toLocaleString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Résumé du vainqueur */}
            {summary.winner && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Vainqueur</h4>
                    <p className="text-sm text-yellow-700">
                      {summary.winner.candidateName} ({summary.winner.partyName}) - {summary.winner.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graphiques des résultats */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Répartition des voix
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResultsChart
              results={candidatesResults.map(c => ({
                candidateId: c.candidateId,
                votes: c.votes,
                percentage: c.percentage
              }))}
              candidates={candidatesResults.map(convertToCandidateFormat)}
              type="donut"
              animated={true}
              height={400}
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Scores par candidat
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResultsChart
              results={candidatesResults.map(c => ({
                candidateId: c.candidateId,
                votes: c.votes,
                percentage: c.percentage
              }))}
              candidates={candidatesResults.map(convertToCandidateFormat)}
              type="horizontal-bar"
              animated={true}
              height={400}
            />
          </CardContent>
        </Card>
      </div> */}

      {/* Tableau détaillé des résultats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Résultats détaillés par candidat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rang</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Candidat</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Parti</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Voix</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">%</th>
                </tr>
              </thead>
              <tbody>
                {candidatesResults.map((candidate, index) => (
                  <tr key={candidate.candidateId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">#{candidate.rank}</span>
                        {candidate.isWinner && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                        {candidate.isTied && (
                          <Award className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: candidate.partyColor }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900">{candidate.candidateName}</div>
                          <div className="text-sm text-gray-500">#{candidate.candidateNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{candidate.partyName}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-gray-900">
                        {candidate.votes.toLocaleString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-gray-900">
                        {candidate.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
