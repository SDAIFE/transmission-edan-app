// ✅ Utilitaires pour gérer la session et les tokens

/**
 * Vérifie si le token est proche de l'expiration
 * @returns nombre de minutes avant expiration (ou null si expiré/invalide)
 */
export async function getTokenExpirationTime(): Promise<number | null> {
  try {
    // Récupérer le token depuis les cookies
    const tokenResponse = await fetch('/api/auth/token', {
      credentials: 'include'
    });
    
    if (!tokenResponse.ok) return null;
    
    const { token } = await tokenResponse.json();
    if (!token) return null;
    
    // Décoder le JWT pour lire l'expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convertir en ms
    const timeUntilExpiration = expirationTime - Date.now();
    
    // Retourner en minutes
    return Math.floor(timeUntilExpiration / 1000 / 60);
  } catch (error) {
    console.error('❌ [SessionHelper] Erreur lecture expiration token:', error);
    return null;
  }
}

/**
 * Vérifie et rafraîchit le token si nécessaire AVANT une action critique
 * Retourne true si le token est valide/rafraîchi, false sinon
 */
export async function ensureValidToken(): Promise<{
  isValid: boolean;
  needsLogin: boolean;
  message?: string;
}> {
  try {
    const minutesLeft = await getTokenExpirationTime();
    
    // Token invalide ou expiré
    if (minutesLeft === null || minutesLeft <= 0) {
      return {
        isValid: false,
        needsLogin: true,
        message: 'Votre session a expiré. Veuillez vous reconnecter.'
      };
    }
    
    // Token expire dans moins de 5 minutes → Refresh préventif
    if (minutesLeft < 5) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ [SessionHelper] Token expire dans ${minutesLeft} min, refresh préventif...`);
      }
      
      // Tenter de rafraîchir le token
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!refreshResponse.ok) {
        return {
          isValid: false,
          needsLogin: true,
          message: 'Impossible de rafraîchir votre session. Veuillez vous reconnecter.'
        };
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [SessionHelper] Token rafraîchi avec succès');
      }
    }
    
    // Token valide
    return {
      isValid: true,
      needsLogin: false
    };
    
  } catch (error) {
    console.error('❌ [SessionHelper] Erreur vérification token:', error);
    return {
      isValid: false,
      needsLogin: true,
      message: 'Erreur de vérification de session. Veuillez vous reconnecter.'
    };
  }
}

/**
 * Sauvegarde les données du formulaire en sessionStorage
 * Pour restauration après reconnexion
 */
export function saveFormData(formId: string, data: any): void {
  try {
    sessionStorage.setItem(`form_backup_${formId}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
    console.log(`💾 [SessionHelper] Données sauvegardées pour: ${formId}`);
  } catch (error) {
    console.error('❌ [SessionHelper] Erreur sauvegarde formulaire:', error);
  }
}

/**
 * Récupère les données sauvegardées du formulaire
 */
export function getFormData<T>(formId: string): T | null {
  try {
    const saved = sessionStorage.getItem(`form_backup_${formId}`);
    if (!saved) return null;
    
    const { data, timestamp } = JSON.parse(saved);
    
    // Expirer après 1 heure
    if (Date.now() - timestamp > 60 * 60 * 1000) {
      sessionStorage.removeItem(`form_backup_${formId}`);
      return null;
    }
    
    return data as T;
  } catch (error) {
    console.error('❌ [SessionHelper] Erreur lecture formulaire:', error);
    return null;
  }
}

/**
 * Supprime les données sauvegardées
 */
export function clearFormData(formId: string): void {
  sessionStorage.removeItem(`form_backup_${formId}`);
}

