/**
 * Utilitaires pour gérer les codes des communes d'Abidjan
 * 
 * ⚠️ FORMAT RECOMMANDÉ : 3 parties "dept-sousPrefecture-commune"
 * Exemple : "022-001-004" pour COCODY
 * 
 * Le backend accepte aussi les formats courts (1 ou 2 parties) mais recommande 
 * le format 3 parties pour éviter les ambiguïtés
 */

import type { PublishableEntity } from '@/types/publications';

/**
 * Valide le format d'un code de commune
 * ✅ FORMAT RECOMMANDÉ : "022-001-004" (3 parties)
 * ⚠️ Format accepté mais non recommandé : "022-004" (2 parties) ou "004" (1 partie)
 */
export function validateCommuneCode(code: string, strict: boolean = false): boolean {
  const parts = code.split('-');
  
  if (strict) {
    // Mode strict : seulement le format 3 parties
    if (parts.length !== 3) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [CommuneCode] Format non recommandé: ${code}. Format recommandé: "022-001-004" (3 parties)`);
      }
      return false;
    }
    
    if (parts[0] !== '022') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [CommuneCode] Code département invalide: ${parts[0]}. Attendu: "022"`);
      }
      return false;
    }
    
    return true;
  }
  
  // Mode permissif : accepte tous les formats (1, 2 ou 3 parties)
  if (parts.length === 1) {
    return true; // Format court "004"
  }
  
  if (parts.length === 2) {
    // Format 2 parties "022-004"
    if (parts[0] !== '022') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [CommuneCode] Code département invalide: ${parts[0]}. Attendu: "022"`);
      }
      return false;
    }
    return true;
  }
  
  if (parts.length === 3) {
    // Format 3 parties "022-001-004" ✅ RECOMMANDÉ
    if (parts[0] !== '022') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [CommuneCode] Code département invalide: ${parts[0]}. Attendu: "022"`);
      }
      return false;
    }
    return true;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ [CommuneCode] Format invalide: ${code}`);
  }
  return false;
}

/**
 * Reconstruit le code complet d'une commune à partir de ses composants
 * ✅ FORMAT RECOMMANDÉ : 3 parties "dept-sousPrefecture-commune"
 */
export function buildCommuneCode(
  codeDepartement: string,
  codeSousPrefecture: string,
  codeCommune: string
): string {
  return `${codeDepartement}-${codeSousPrefecture}-${codeCommune}`;
}

/**
 * Normalise le code d'une entité pour s'assurer qu'il est au FORMAT RECOMMANDÉ
 * - Pour les communes : reconstruit le format 3 parties si possible
 * - Pour les départements : retourne le code tel quel
 * 
 * ⚠️ Le backend accepte les 3 formats mais RECOMMANDE le format 3 parties
 * pour éviter les ambiguïtés
 */
export function normalizeEntityCode(entity: PublishableEntity): string {
  // Pour les départements, pas de normalisation nécessaire
  if (entity.type === 'DEPARTMENT') {
    return entity.code;
  }
  
  // Pour les communes, essayer de construire le format 3 parties (RECOMMANDÉ)
  if (entity.type === 'COMMUNE') {
    const parts = entity.code.split('-');
    
    // Si le code a déjà 3 parties ("022-001-004"), c'est parfait !
    if (parts.length === 3 && validateCommuneCode(entity.code, true)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [CommuneCode] Code déjà au format recommandé: ${entity.code}`);
      }
      return entity.code;
    }
    
    // Si on a les 3 champs séparés, reconstruire le format 3 parties
    if (entity.codeDepartement && entity.codeSousPrefecture && entity.codeCommune) {
      const codeComplet = buildCommuneCode(
        entity.codeDepartement,
        entity.codeSousPrefecture,
        entity.codeCommune
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 [CommuneCode] Code reconstruit au format recommandé: "${entity.code}" → "${codeComplet}"`);
      }
      
      return codeComplet;
    }
    
    // Si on n'a pas codeSousPrefecture, utiliser le code tel quel (format court accepté)
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [CommuneCode] Impossible de construire le format 3 parties (manque codeSousPrefecture). Utilisation du code: ${entity.code}`);
    }
  }
  
  return entity.code;
}

/**
 * Parse un code de commune pour extraire ses composants
 * Supporte 3 formats :
 * - Format 3 parties (RECOMMANDÉ) : "022-001-004" → { dept: "022", sp: "001", commune: "004" }
 * - Format 2 parties : "022-004" → { dept: "022", sp: null, commune: "004" }
 * - Format court : "004" → { dept: null, sp: null, commune: "004" }
 */
export function parseCommuneCode(code: string): {
  codeDepartement: string | null;
  codeSousPrefecture: string | null;
  codeCommune: string;
} | null {
  const parts = code.split('-');
  
  // Format court "004"
  if (parts.length === 1) {
    return {
      codeDepartement: null,
      codeSousPrefecture: null,
      codeCommune: parts[0],
    };
  }
  
  // Format 2 parties "022-004"
  if (parts.length === 2) {
    return {
      codeDepartement: parts[0],
      codeSousPrefecture: null,
      codeCommune: parts[1],
    };
  }
  
  // Format 3 parties "022-001-004" ✅ RECOMMANDÉ
  if (parts.length === 3) {
    return {
      codeDepartement: parts[0],
      codeSousPrefecture: parts[1],
      codeCommune: parts[2],
    };
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ [CommuneCode] Format invalide: ${code}`);
  }
  return null;
}

/**
 * Table de correspondance des codes communes d'Abidjan
 * ✅ FORMAT RECOMMANDÉ : 3 parties "022-001-XXX"
 * Le backend accepte aussi les formats courts mais recommande le format complet
 */
export const COMMUNES_ABIDJAN = {
  // Format 3 parties (RECOMMANDÉ) - Sous-Préfecture 001
  '022-001-001': 'ABOBO',
  '022-001-002': 'ADJAME',
  '022-001-003': 'ATTECOUBE',
  '022-001-004': 'COCODY',
  '022-001-005': 'KOUMASSI',
  '022-001-006': 'MARCORY',
  '022-001-007': 'PLATEAU',
  '022-001-008': 'PORT-BOUET',
  '022-001-009': 'TREICHVILLE',
  '022-001-010': 'YOPOUGON',
  
  // Autres sous-préfectures
  '022-002-001': 'ANYAMA',
  '022-003-001': 'BINGERVILLE',
  '022-004-001': 'SONGON',
  '022-005-098': 'BROFODOUME',
  
  // Format 2 parties (accepté mais non recommandé)
  '022-001': 'ABOBO',
  '022-002': 'ADJAME',
  '022-003': 'ATTECOUBE',
  '022-004': 'COCODY',
  '022-005': 'KOUMASSI',
  '022-006': 'MARCORY',
  '022-007': 'PLATEAU',
  '022-008': 'PORT-BOUET',
  '022-009': 'TREICHVILLE',
  '022-010': 'YOPOUGON',
  '022-098': 'BROFODOUME',
  
  // Format court (accepté mais non recommandé)
  '001': 'ABOBO',
  '002': 'ADJAME',
  '003': 'ATTECOUBE',
  '004': 'COCODY',
  '005': 'KOUMASSI',
  '006': 'MARCORY',
  '007': 'PLATEAU',
  '008': 'PORT-BOUET',
  '009': 'TREICHVILLE',
  '010': 'YOPOUGON',
  '098': 'BROFODOUME',
} as const;

/**
 * Vérifie si un code correspond à une commune d'Abidjan connue
 */
export function isKnownCommune(code: string): boolean {
  return code in COMMUNES_ABIDJAN;
}

/**
 * Récupère le nom d'une commune à partir de son code
 */
export function getCommuneName(code: string): string | null {
  return COMMUNES_ABIDJAN[code as keyof typeof COMMUNES_ABIDJAN] || null;
}

