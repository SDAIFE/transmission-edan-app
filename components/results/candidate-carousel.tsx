'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users } from 'lucide-react';
import type { Candidate } from '@/types/results';

interface CandidateCarouselProps {
  candidates: Candidate[];
  autoPlay?: boolean;
  interval?: number;
  showRank?: boolean;
}

export function CandidateCarousel({ 
  candidates, 
  autoPlay = true, 
  interval = 4000,
  showRank = true 
}: CandidateCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoPlay || candidates.length <= 1) return;

    const timer = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === candidates.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 300); // Délai pour l'animation de sortie
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, candidates.length]);

  if (candidates.length === 0) return null;

  const currentCandidate = candidates[currentIndex];
  const rank = currentIndex + 1;

  return (
    <div className="relative w-full h-full min-h-[280px] lg:min-h-[350px]">
      {/* Container principal avec animation */}
      <div 
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <Card className={`h-full bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm border-2 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300 ${
          currentCandidate.results.isWinner ? 'border-yellow-400/50 ring-2 ring-yellow-400/30' : 'border-white/30'
        }`}>
          <CardContent className="p-6 h-full flex flex-col justify-between">
            {/* En-tête avec rang et badge gagnant */}
            <div className="flex items-center justify-between mb-4">
              {showRank && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shadow-xl ring-2 ring-white/50"
                    style={{ 
                      backgroundColor: currentCandidate.party.color,
                      boxShadow: `0 4px 15px ${currentCandidate.party.color}60`
                    }}
                  >
                    {rank}
                  </div>
                  {currentCandidate.results.isWinner && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-xl font-bold animate-pulse px-3 py-1.5">
                      <Crown className="w-4 h-4 mr-1" />
                      GAGNANT
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Logo du parti - AGRANDI */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl border-3 border-white bg-white p-2">
                <img 
                  src={currentCandidate.party.logo} 
                  alt={`Logo ${currentCandidate.party.name}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Photo du candidat - MISE EN ÉVIDENCE */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Halo lumineux coloré très prononcé */}
                <div 
                  className="absolute inset-0 rounded-full blur-3xl scale-150 opacity-60 animate-pulse"
                  style={{ backgroundColor: `${currentCandidate.party.color}60` }}
                ></div>
                
                {/* Cercles concentriques d'effet */}
                <div 
                  className="absolute inset-0 rounded-full scale-125 opacity-30 animate-ping"
                  style={{ 
                    backgroundColor: currentCandidate.party.color,
                    animationDuration: '3s'
                  }}
                ></div>
                
                {/* Cercle de fond blanc épais */}
                <div className="relative bg-white p-3 rounded-full shadow-2xl">
                  <Avatar className="w-32 h-32 lg:w-40 lg:h-40 border-8 border-white shadow-3xl group-hover:scale-110 transition-transform duration-500"
                    style={{ 
                      boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 0 4px ${currentCandidate.party.color}40`
                    }}
                  >
                    <AvatarImage 
                      src={currentCandidate.photo} 
                      alt={currentCandidate.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback 
                      className="text-4xl lg:text-5xl font-bold text-white"
                      style={{ backgroundColor: currentCandidate.party.color }}
                    >
                      {currentCandidate.firstName.charAt(0)}{currentCandidate.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Effet de brillance amélioré */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse pointer-events-none"></div>
                
                {/* Étoiles scintillantes autour de la photo */}
                {currentCandidate.results.isWinner && (
                  <>
                    <div className="absolute -top-2 -left-2 text-yellow-400 text-3xl animate-spin" style={{ animationDuration: '4s' }}>✨</div>
                    <div className="absolute -top-2 -right-2 text-yellow-400 text-3xl animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>✨</div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-4xl animate-bounce">⭐</div>
                  </>
                )}
              </div>
            </div>

            {/* Informations du candidat */}
            <div className="text-center space-y-3">
              <h3 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight drop-shadow-sm">
                {currentCandidate.fullName}
              </h3>
              
              <div className="space-y-2">
                <p 
                  className="text-base lg:text-lg font-bold px-4 py-2 rounded-full text-white shadow-xl inline-block"
                  style={{ 
                    backgroundColor: currentCandidate.party.color,
                    boxShadow: `0 4px 15px ${currentCandidate.party.color}40`
                  }}
                >
                  {currentCandidate.party.sigle}
                </p>
                <p className="text-sm text-gray-700 font-semibold">
                  {currentCandidate.party.name}
                </p>
              </div>
            </div>

            {/* Indicateurs de progression - AMÉLIORÉS */}
            <div className="flex justify-center gap-2 mt-4">
              {candidates.map((_, index) => (
                <div
                  key={index}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 h-3 shadow-xl scale-110' 
                      : 'w-3 h-3 bg-white/60 hover:bg-white/80'
                  }`}
                  style={index === currentIndex ? {
                    backgroundColor: currentCandidate.party.color,
                    boxShadow: `0 2px 10px ${currentCandidate.party.color}80`
                  } : {}}
                />
              ))}
            </div>
          </CardContent>

          {/* Effet de survol */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      </div>

      {/* Effet de particules en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => {
          const seed = i * 11 + currentIndex * 3;
          return (
            <div
              key={i}
              className="absolute bg-white/20 rounded-full animate-pulse"
              style={{
                width: (seed % 3) + 2 + 'px',
                height: (seed % 3) + 2 + 'px',
                left: (seed % 100) + '%',
                top: ((seed * 2) % 100) + '%',
                animationDelay: (seed % 2) + 's',
                animationDuration: ((seed % 3) + 2) + 's'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
