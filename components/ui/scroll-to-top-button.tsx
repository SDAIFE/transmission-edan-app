'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  threshold?: number; // Seuil de scroll pour afficher le bouton
  className?: string;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ 
  threshold = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fonction pour remonter en haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Écouter le scroll pour afficher/masquer le bouton et calculer la progression
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      
      if (scrollTop > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('scroll', handleScroll);

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  // Ne pas afficher le bouton s'il n'est pas visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Indicateur de progression circulaire */}
      <div className="relative">
        <svg
          className="w-16 h-16 transform -rotate-90"
          viewBox="0 0 64 64"
        >
          {/* Cercle de fond */}
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(59, 130, 246, 0.2)"
            strokeWidth="4"
            fill="none"
          />
          {/* Cercle de progression */}
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - scrollProgress / 100)}`}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        
        {/* Bouton principal */}
        <Button
          onClick={scrollToTop}
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            h-12 w-12 rounded-full
            bg-gradient-to-r from-blue-600 to-blue-700 
            hover:from-blue-700 hover:to-blue-800
            text-white shadow-lg hover:shadow-2xl
            transition-all duration-300 ease-in-out
            hover:scale-110 active:scale-95
            border-2 border-white/20 hover:border-white/40
            backdrop-blur-sm
            ${isVisible ? 'animate-in slide-in-from-bottom-2 fade-in duration-300' : ''}
            ${className}
          `}
          aria-label="Remonter en haut de la page"
          title={`Remonter en haut (${Math.round(scrollProgress)}% scrollé)`}
        >
          <ChevronUp className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </Button>
      </div>
    </div>
  );
};
