// utils/cache.ts
export class LocalCache {
  private static CACHE_PREFIX = 'election_results_';
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static set(key: string, data: any): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Impossible de mettre en cache les données:', error);
    }
  }

  static get(key: string): any | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_PREFIX + key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  static clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache:', error);
    }
  }

  static clearExpired(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.CACHE_PREFIX))
        .forEach(key => {
          const cached = localStorage.getItem(key);
          if (cached) {
            try {
              const { timestamp } = JSON.parse(cached);
              if (Date.now() - timestamp > this.CACHE_DURATION) {
                localStorage.removeItem(key);
              }
            } catch (error) {
              // Supprimer les entrées corrompues
              localStorage.removeItem(key);
            }
          }
        });
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache expiré:', error);
    }
  }
}
