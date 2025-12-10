"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook pour détecter si l'utilisateur est sur un appareil mobile
 * Utilise une media query pour détecter les écrans de moins de 768px
 * 
 * @returns {boolean} true si l'écran est mobile, false sinon
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Vérifier que window est disponible (SSR safe)
    if (typeof window === "undefined") {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    
    // Définir l'état initial
    setIsMobile(mql.matches);
    
    // Écouter les changements
    mql.addEventListener("change", onChange);
    
    // Nettoyage
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return isMobile;
}

