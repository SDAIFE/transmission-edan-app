'use client';

import { Card, CardContent } from '@/components/ui/card';

export function CandidateCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      {/* Bande colorée du parti - Squelette */}
      <div className="h-3 w-full bg-gray-200 animate-pulse" />
      
      <CardContent className="p-6">
        {/* Photo du candidat - Squelette */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            {/* Halo lumineux - Squelette */}
            <div className="absolute inset-0 rounded-full blur-3xl scale-125 opacity-60 bg-gray-200 animate-pulse" />
            
            {/* Cercle de fond blanc - Squelette */}
            <div className="relative bg-white p-2 rounded-full shadow-2xl">
              <div className="h-40 w-40 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Informations du candidat - Squelette */}
          <div className="text-center space-y-3">
            {/* Nom du candidat */}
            <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
            
            {/* Logo du parti - Squelette */}
            <div className="flex justify-center my-3">
              <div className="w-24 h-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            
            {/* Sigle du parti */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            
            {/* Nom complet du parti */}
            <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          </div>
        </div>

        {/* Résultats essentiels - Squelette */}
        <div className="space-y-4">
          {/* Score principal - Squelette */}
          <div className="bg-gray-100 rounded-2xl p-6 text-center">
            <div className="h-12 w-16 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2" />
            <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          </div>

          {/* Barre de progression - Squelette */}
          <div className="w-full bg-gray-200 rounded-full h-3 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
