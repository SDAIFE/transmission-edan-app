'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import type { CandidateCardProps } from '@/types/results';
import Image from 'next/image';

export function CandidateCard({ 
  candidate, 
  candidateColor,
  showDetails = true,
  animated = true,
  onClick 
}: CandidateCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedVotes, setAnimatedVotes] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);


  useEffect(() => {
    // Vérifier que les résultats existent
    if (!candidate.results) {
      setIsVisible(true);
      setAnimatedVotes(0);
      setAnimatedPercentage(0);
      return;
    }

    if (animated) {
      // Animation d'apparition
      const timer = setTimeout(() => setIsVisible(true), candidate.results.rank * 100);
      
      // Animation des chiffres
      let startTime: number;
      const duration = 2000; // 2 secondes

      const animateNumbers = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Fonction d'easing (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedVotes(Math.floor(candidate.results.votes * easeOut));
        setAnimatedPercentage(Number((candidate.results.percentage * easeOut).toFixed(1)));
        
        if (progress < 1) {
          requestAnimationFrame(animateNumbers);
        }
      };

      const animationTimer = setTimeout(() => {
        requestAnimationFrame(animateNumbers);
      }, candidate.results.rank * 150);

      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
      };
    } else {
      setIsVisible(true);
      setAnimatedVotes(candidate.results.votes);
      setAnimatedPercentage(candidate.results.percentage);
    }
  }, [candidate.results?.votes, candidate.results?.percentage, candidate.results?.rank, animated]);

  // Détection d'égalité et de gagnant
  const isTied = candidate.results?.isTied || false;
  const isWinner = candidate.results?.isWinner || false;
  
  // Utiliser la couleur spécifique ou celle du parti en fallback
  const displayColor = candidateColor || candidate.party.color;

  return (
    <Card 
      className={`cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group relative ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${isTied ? 'ring-4 ring-orange-400 ring-opacity-80 animate-pulse' : ''}`}
      onClick={() => onClick?.(candidate)}
      style={{ 
        transitionDelay: animated ? `${(candidate.results?.rank || 1) * 100}ms` : '0ms',
        background: `linear-gradient(135deg, ${displayColor}20 0%, ${displayColor}30 100%)`
      }}
    >
      {/* Bande colorée du parti en haut - PLUS VISIBLE */}
      <div 
        className={`h-3 w-full ${isTied ? 'animate-pulse' : ''}`}
        style={{ 
          backgroundColor: isTied ? '#FB923C' : displayColor,
          boxShadow: isTied ? '0 4px 10px rgba(251, 146, 60, 0.5)' : `0 2px 8px ${displayColor}60`
        }}
      />


      {/* Animation d'égalité - Étoiles scintillantes */}
      {isTied && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-4 left-1/4 text-orange-400 text-xl animate-ping" style={{ animationDuration: '2s' }}>✦</div>
          <div className="absolute top-4 right-1/4 text-orange-500 text-xl animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>✦</div>
          <div className="absolute top-8 left-1/2 text-orange-300 text-2xl animate-ping" style={{ animationDelay: '1s', animationDuration: '2s' }}>✦</div>
        </div>
      )}

      <CardContent className="p-6 relative">
        {/* Photo du candidat en valeur - GRANDE TAILLE */}
        <div className="flex flex-col items-center mb-6">
          {/* Photo principale avec effet de profondeur AMÉLIORÉ */}
          <div className="relative mb-4">
            {/* Halo lumineux plus prononcé */}
            <div 
              className="absolute inset-0 rounded-full blur-3xl scale-125 opacity-60"
              style={{ backgroundColor: `${displayColor}60` }}
            ></div>
            
            {/* Cercle de fond blanc épais */}
            <div className="relative bg-white p-2 rounded-full shadow-2xl">
              <Avatar className="h-40 w-40 ring-8 ring-white shadow-3xl group-hover:ring-[10px] transition-all duration-500 group-hover:scale-110 border-4 border-opacity-20"
                style={{ borderColor: displayColor, borderWidth: '3px' }}
              >
                <AvatarImage src={candidate.photo} alt={candidate.fullName} className="object-cover" />
                <AvatarFallback 
                  className="text-4xl font-bold text-white"
                  style={{ backgroundColor: displayColor }}
                >
                  {candidate.firstName[0]}{candidate.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Badge subtil "En tête" */}
            {isWinner && (
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                style={{ 
                  backgroundColor: '#10B981',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                1
              </div>
            )}


            {/* Badge d'égalité sur la photo */}
            {isTied && !isWinner && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10 animate-pulse">
                <div className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 text-orange-900 px-4 py-2 rounded-full text-sm font-bold shadow-2xl border-2 border-white"
                  style={{ 
                    boxShadow: '0 10px 30px rgba(251, 146, 60, 0.5)',
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  ⚖️ ÉGALITÉ
                </div>
              </div>
            )}
          </div>

          {/* Informations du candidat centrées */}
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {candidate.lastName}
            </h3>
            
            {/* Logo du parti - NOUVEAU */}
            {candidate.party.logo && (
              <div className="flex justify-center my-3">
                <div className="relative w-24 h-20 bg-transparent rounded-lg shadow-lg p-2 border-2 border-gray-100">
                  <Image
                    src={candidate.party.logo}
                    alt={`Logo ${candidate.party.name}`}
                    fill
                    className="object-contain p-1"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Parti politique avec style moderne */}
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-6 h-6 rounded-full shadow-lg ring-2 ring-white"
                style={{ backgroundColor: displayColor }}
              />
              <span className="text-base font-bold text-gray-800">
                {candidate.party.sigle}
              </span>
            </div>
            
            {/* Nom complet du parti */}
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed font-medium">
              {candidate.party.name}
            </p>
          </div>
        </div>

          {/* Résultats essentiels */}
        <div className="space-y-4">
          {/* Score principal avec effet de carte - ANIMATION SPÉCIALE */}
          <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center relative overflow-hidden ${isTied ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-50 to-orange-100' : ''}`}>
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Effet spécial égalité */}
            {isTied && !isWinner && (
              <>
                <div className="absolute top-2 left-2 text-orange-400 text-xl animate-pulse">✦</div>
                <div className="absolute top-2 right-2 text-orange-400 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>✦</div>
              </>
            )}
            
            <div 
              className="text-5xl font-black mb-2 relative z-10"
              style={{ 
                color: isTied ? '#F97316' : displayColor,
                textShadow: isTied ? '0 0 20px rgba(249, 115, 22, 0.5)' : `0 0 30px ${displayColor}80`
              }}
            >
              {animatedPercentage}%
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 relative z-10">
              <Users className="h-4 w-4" />
              <span className="font-medium">{animatedVotes.toLocaleString('fr-FR')} voix</span>
            </div>
          </div>

          {/* Barre de progression simplifiée */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ 
                width: `${animatedPercentage}%`,
                background: `linear-gradient(90deg, ${displayColor} 0%, ${displayColor}E6 50%, ${displayColor} 100%)`
              }}
            >
              {/* Effet de brillance sur la barre */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"></div>
            </div>
          </div>
        </div>

        {/* Effet de survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </CardContent>
    </Card>
  );
}
