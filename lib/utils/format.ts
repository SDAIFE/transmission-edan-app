/**
 * Utilitaires de formatage
 * 
 * TODO: Implémenter les fonctions de formatage
 */

/**
 * Formate un nombre en pourcentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formate une date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Formate un nombre avec séparateurs
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

