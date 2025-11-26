'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vote } from 'lucide-react';

export function CandidatesSectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse" />
        </Badge>
      </div>

      {/* Grille des cartes de candidats - Squelette */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 shadow-lg overflow-hidden">
            <div className="h-3 w-full bg-gray-200 animate-pulse" />
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full blur-3xl scale-125 opacity-60 bg-gray-200 animate-pulse" />
                  <div className="relative bg-white p-2 rounded-full shadow-2xl">
                    <div className="h-40 w-40 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex justify-center my-3">
                    <div className="w-24 h-20 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-2xl p-6 text-center">
                  <div className="h-12 w-16 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2" />
                  <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse mx-auto" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
