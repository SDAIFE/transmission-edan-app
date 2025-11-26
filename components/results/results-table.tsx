'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Users, 
  BarChart3,
  MapPin,
  Building,
  Map
} from 'lucide-react';
import type { ResultsTableProps, Region, Departement, LieuVote, BureauVote } from '@/types/results';

export function ResultsTable({ 
  regions, 
  candidates, 
  filters, 
  onFiltersChange,
  expandedLevel = 'region' 
}: ResultsTableProps) {
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [expandedDepartements, setExpandedDepartements] = useState<string[]>([]);
  const [expandedLieux, setExpandedLieux] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  const toggleDepartement = (deptId: string) => {
    setExpandedDepartements(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const toggleLieu = (lieuId: string) => {
    setExpandedLieux(prev => 
      prev.includes(lieuId) 
        ? prev.filter(id => id !== lieuId)
        : [...prev, lieuId]
    );
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value });
  };

  const getWinnerColor = (results: any[]) => {
    if (results.length === 0) return '';
    const winner = results.reduce((prev, current) => 
      prev.votes > current.votes ? prev : current
    );
    const candidate = candidates.find(c => c.id === winner.candidateId);
    return candidate?.party.color || '';
  };

  const formatNumber = (num: number) => num.toLocaleString('fr-FR');

  const ResultRow = ({ 
    level, 
    name, 
    icon: Icon, 
    data, 
    isExpanded, 
    onToggle, 
    children,
    color 
  }: {
    level: number;
    name: string;
    icon: any;
    data: any;
    isExpanded?: boolean;
    onToggle?: () => void;
    children?: React.ReactNode;
    color?: string;
  }) => (
    <>
      <TableRow className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-0 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <Icon className="h-4 w-4 text-gray-500" />
            <span>{name}</span>
            {color && (
              <div 
                className="w-3 h-3 rounded-full ml-2"
                style={{ backgroundColor: color }}
              />
            )}
          </div>
        </TableCell>
        
        <TableCell className="text-center">
          <Badge variant="outline">
            {formatNumber(data.inscrits)}
          </Badge>
        </TableCell>
        
        <TableCell className="text-center">
          <Badge variant="outline">
            {formatNumber(data.votants)}
          </Badge>
        </TableCell>
        
        <TableCell className="text-center">
          <Badge 
            variant={data.tauxParticipation >= 70 ? "default" : "secondary"}
            className={data.tauxParticipation >= 70 ? "bg-green-100 text-green-800" : ""}
          >
            {data.tauxParticipation.toFixed(1)}%
          </Badge>
        </TableCell>
        
        <TableCell className="text-center">
          {formatNumber(data.exprimes)}
        </TableCell>
        
        {/* Colonnes pour chaque candidat */}
        {candidates.map(candidate => {
          const result = data.results.find((r: any) => r.candidateId === candidate.id);
          const votes = result?.votes || 0;
          const percentage = result?.percentage || 0;
          
          return (
            <TableCell key={candidate.id} className="text-center">
              <div className="space-y-1">
                <div className="font-medium text-sm">
                  {formatNumber(votes)}
                </div>
                <div 
                  className="text-xs font-semibold"
                  style={{ color: candidate.party.color }}
                >
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </TableCell>
          );
        })}
      </TableRow>
      
      {children && (
        <TableRow>
          <TableCell colSpan={5 + candidates.length} className="p-0">
            <Collapsible open={isExpanded}>
              <CollapsibleContent>
                {children}
              </CollapsibleContent>
            </Collapsible>
          </TableCell>
        </TableRow>
      )}
    </>
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Résultats par territoire
          </CardTitle>
          
          {/* Recherche */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un territoire..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Territoire</TableHead>
                <TableHead className="text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    Inscrits
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    Votants
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Participation
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold">Exprimés</TableHead>
                
                {/* En-têtes candidats */}
                {candidates.map(candidate => (
                  <TableHead key={candidate.id} className="text-center font-semibold min-w-[100px]">
                    <div className="space-y-1">
                      <div className="text-xs font-medium">
                        {candidate.lastName}
                      </div>
                      <div 
                        className="text-xs px-2 py-1 rounded text-white"
                        style={{ backgroundColor: candidate.party.color }}
                      >
                        {candidate.party.sigle}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {regions.map(region => (
                <ResultRow
                  key={region.id}
                  level={0}
                  name={region.nom}
                  icon={Map}
                  data={region.totals}
                  isExpanded={expandedRegions.includes(region.id)}
                  onToggle={() => toggleRegion(region.id)}
                  color={getWinnerColor(region.totals.results)}
                >
                  {expandedRegions.includes(region.id) && (
                    <div>
                      {region.departements.map(departement => (
                        <ResultRow
                          key={departement.id}
                          level={1}
                          name={departement.nom}
                          icon={Building}
                          data={departement.totals}
                          isExpanded={expandedDepartements.includes(departement.id)}
                          onToggle={() => toggleDepartement(departement.id)}
                          color={getWinnerColor(departement.totals.results)}
                        >
                          {expandedDepartements.includes(departement.id) && (
                            <div>
                              {departement.lieuxVote.map(lieu => (
                                <ResultRow
                                  key={lieu.id}
                                  level={2}
                                  name={lieu.nom}
                                  icon={MapPin}
                                  data={lieu.totals}
                                  isExpanded={expandedLieux.includes(lieu.id)}
                                  onToggle={() => toggleLieu(lieu.id)}
                                  color={getWinnerColor(lieu.totals.results)}
                                >
                                  {expandedLieux.includes(lieu.id) && (
                                    <div>
                                      {lieu.bureaux.map(bureau => (
                                        <ResultRow
                                          key={bureau.id}
                                          level={3}
                                          name={bureau.nom}
                                          icon={Users}
                                          data={bureau}
                                          color={getWinnerColor(bureau.results)}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </ResultRow>
                              ))}
                            </div>
                          )}
                        </ResultRow>
                      ))}
                    </div>
                  )}
                </ResultRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
