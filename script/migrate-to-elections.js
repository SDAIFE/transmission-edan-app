
/**
 * Script de migration pour créer la nouvelle application d'élections législatives
 * en copiant et adaptant les fichiers de l'application actuelle
 * 
 * Usage: node scripts/migrate-to-elections.js <source-path> <target-path>
 * Exemple: node scripts/migrate-to-elections.js ../transmission-epr-app ./elections-legislatives-app
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_PATH = process.argv[2] || '../transmission-epr-app';
const TARGET_PATH = process.argv[3] || './transmission-edan-app';

// Mapping des fichiers à copier intégralement
const FILES_TO_COPY = [
  // Configuration
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  'tailwind.config.ts',
  'components.json',
  'middleware.ts',
  'postcss.config.mjs',
  'eslint.config.mjs',
  
  // Actions
  'actions/auth.action.ts',
  
  // Contexts
  'contexts/AuthContext.tsx',
  
  // Store
  'store/auth.ts',
  'store/ui.ts',
  
  // Types
  'types/auth.ts',
  
  // Lib - Config
  'lib/config/api.ts',
  'lib/config/cors.ts',
  
  // Lib - Utils
  'lib/utils.ts',
  'lib/utils/auth.ts',
  
  // App - Auth
  'app/auth/login/page.tsx',
  'app/auth/register/page.tsx',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  
  // App - API Auth
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/auth/refresh/route.ts',
  'app/api/auth/token/route.ts',
];

// Mapping des dossiers à copier intégralement
const DIRS_TO_COPY = [
  'components/auth',
  'components/ui',
  'components/layout',
  'components/dashboard',
  'components/results',
  'components/users',
  'components/modals',
  'components/tables',
  'lib/api/auth.ts',
  'lib/api/interceptor.ts',
  'lib/services/auth.service.ts',
  'lib/auth',
  'lib/hooks',
  'public',
  'styles',
];

// Mapping des fichiers à adapter (copier puis adapter)
const FILES_TO_ADAPT = {
  // Pages
  'app/(protected)/dashboard/page.tsx': 'app/(protected)/dashboard/page.tsx',
  'app/(protected)/publications/page.tsx': 'app/(protected)/circonscriptions/page.tsx',
  'app/(protected)/upload/page.tsx': 'app/(protected)/elections/page.tsx',
  'app/(protected)/results/page.tsx': 'app/(protected)/resultats/page.tsx',
  'app/(protected)/users/page.tsx': 'app/(protected)/utilisateurs/page.tsx',
  
  // Components Publications -> Circonscriptions
  'components/publications/publications-page-header.tsx': 'components/circonscriptions/circonscriptions-page-header.tsx',
  'components/publications/publications-page-content-v2.tsx': 'components/circonscriptions/circonscriptions-page-content.tsx',
  'components/publications/publications-stats-cards.tsx': 'components/circonscriptions/circonscriptions-stats-cards.tsx',
  'components/publications/departments-table.tsx': 'components/circonscriptions/circonscriptions-table.tsx',
  'components/publications/department-filters.tsx': 'components/circonscriptions/circonscriptions-filters.tsx',
  'components/publications/department-details-modal.tsx': 'components/circonscriptions/circonscription-details-modal.tsx',
  
  // Components Upload -> Elections
  'components/upload/upload-page-header.tsx': 'components/elections/elections-page-header.tsx',
  'components/upload/upload-page-content.tsx': 'components/elections/elections-page-content.tsx',
  'components/upload/stats-cards.tsx': 'components/elections/elections-stats-cards.tsx',
  'components/upload/imports-table.tsx': 'components/elections/elections-table.tsx',
  'components/upload/import-filters.tsx': 'components/elections/elections-filters.tsx',
  
  // Hooks
  'hooks/use-publications.ts': 'hooks/use-circonscriptions.ts',
  'hooks/use-upload.ts': 'hooks/use-elections.ts',
  'hooks/use-election-results.ts': 'hooks/use-resultats.ts',
};

// Fonction pour copier un fichier
function copyFile(source, target) {
  const sourcePath = path.join(SOURCE_PATH, source);
  const targetPath = path.join(TARGET_PATH, target);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️  Fichier source introuvable: ${sourcePath}`);
    return false;
  }
  
  // Créer les dossiers parents si nécessaire
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ Copié: ${source} → ${target}`);
  return true;
}

// Fonction pour copier un dossier récursivement
function copyDir(source, target) {
  const sourcePath = path.join(SOURCE_PATH, source);
  const targetPath = path.join(TARGET_PATH, target);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️  Dossier source introuvable: ${sourcePath}`);
    return false;
  }
  
  function copyRecursive(src, dst) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    if (!fs.existsSync(dst)) {
      fs.mkdirSync(dst, { recursive: true });
    }
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dst, entry.name);
      
      if (entry.isDirectory()) {
        copyRecursive(srcPath, dstPath);
      } else {
        fs.copyFileSync(srcPath, dstPath);
      }
    }
  }
  
  copyRecursive(sourcePath, targetPath);
  console.log(`✅ Copié dossier: ${source} → ${target}`);
  return true;
}

// Fonction pour adapter un fichier (copie + remplacements)
function adaptFile(source, target, replacements = {}) {
  const sourcePath = path.join(SOURCE_PATH, source);
  const targetPath = path.join(TARGET_PATH, target);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️  Fichier source introuvable: ${sourcePath}`);
    return false;
  }
  
  // Créer les dossiers parents si nécessaire
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Lire le fichier source
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  // Appliquer les remplacements par défaut
  const defaultReplacements = {
    'publications': 'circonscriptions',
    'Publications': 'Circonscriptions',
    'publication': 'circonscription',
    'Publication': 'Circonscription',
    'departement': 'circonscription',
    'Departement': 'Circonscription',
    'département': 'circonscription',
    'Département': 'Circonscription',
    'departements': 'circonscriptions',
    'Departements': 'Circonscriptions',
    'départements': 'circonscriptions',
    'Départements': 'Circonscriptions',
    'upload': 'elections',
    'Upload': 'Elections',
    'import': 'election',
    'Import': 'Election',
    'CEL': 'Circonscription',
    'cel': 'circonscription',
    'CEC': 'Élection',
    'cec': 'élection',
    'users': 'utilisateurs',
    'Users': 'Utilisateurs',
    'results': 'resultats',
    'Results': 'Resultats',
  };
  
  // Appliquer tous les remplacements
  const allReplacements = { ...defaultReplacements, ...replacements };
  for (const [search, replace] of Object.entries(allReplacements)) {
    const regex = new RegExp(search, 'g');
    content = content.replace(regex, replace);
  }
  
  // Écrire le fichier cible
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`🔄 Adapté: ${source} → ${target}`);
  return true;
}

// Fonction principale
function main() {
  console.log('🚀 Démarrage de la migration...\n');
  console.log(`📂 Source: ${SOURCE_PATH}`);
  console.log(`📂 Cible: ${TARGET_PATH}\n`);
  
  // Vérifier que le dossier source existe
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`❌ Le dossier source n'existe pas: ${SOURCE_PATH}`);
    process.exit(1);
  }
  
  // Créer le dossier cible s'il n'existe pas
  if (!fs.existsSync(TARGET_PATH)) {
    fs.mkdirSync(TARGET_PATH, { recursive: true });
    console.log(`📁 Dossier cible créé: ${TARGET_PATH}\n`);
  }
  
  // Copier les fichiers intégralement
  console.log('📋 Copie des fichiers intégralement...\n');
  let copied = 0;
  for (const file of FILES_TO_COPY) {
    if (copyFile(file, file)) {
      copied++;
    }
  }
  console.log(`\n✅ ${copied}/${FILES_TO_COPY.length} fichiers copiés\n`);
  
  // Copier les dossiers intégralement
  console.log('📁 Copie des dossiers intégralement...\n');
  let dirsCopied = 0;
  for (const dir of DIRS_TO_COPY) {
    if (copyDir(dir, dir)) {
      dirsCopied++;
    }
  }
  console.log(`\n✅ ${dirsCopied}/${DIRS_TO_COPY.length} dossiers copiés\n`);
  
  // Adapter les fichiers
  console.log('🔄 Adaptation des fichiers...\n');
  let adapted = 0;
  for (const [source, target] of Object.entries(FILES_TO_ADAPT)) {
    if (adaptFile(source, target)) {
      adapted++;
    }
  }
  console.log(`\n✅ ${adapted}/${Object.keys(FILES_TO_ADAPT).length} fichiers adaptés\n`);
  
  // Créer les fichiers de données mockées
  console.log('📊 Création des fichiers de données mockées...\n');
  const mockDataDir = path.join(TARGET_PATH, 'lib/mock-data');
  if (!fs.existsSync(mockDataDir)) {
    fs.mkdirSync(mockDataDir, { recursive: true });
  }
  
  // Créer les fichiers mock (templates basiques)
  const mockFiles = {
    'circonscriptions.ts': `import type { Circonscription } from '@/types/circonscriptions';

export const mockCirconscriptions: Circonscription[] = [
  {
    id: 'circ-001',
    code: 'ABJ-01',
    libelle: 'Abidjan 1ère Circonscription',
    region: 'Lagunes',
    departement: 'Abidjan',
    nombreSieges: 2,
    nombreCandidaturesAttendues: 8,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
  },
];
`,
    'elections.ts': `import type { Election } from '@/types/elections';

export const mockElections: Election[] = [];
`,
    'candidatures.ts': `import type { Candidature } from '@/types/candidatures';

export const mockCandidatures: Candidature[] = [];
`,
    'resultats.ts': `import type { ResultatElection } from '@/types/resultats';

export const mockResultats: ResultatElection[] = [];
`,
  };
  
  for (const [filename, content] of Object.entries(mockFiles)) {
    const filePath = path.join(mockDataDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Créé: lib/mock-data/${filename}`);
  }
  
  console.log('\n✨ Migration terminée !\n');
  console.log('📝 Prochaines étapes:');
  console.log('1. Installer les dépendances: npm install');
  console.log('2. Créer les types manquants dans types/');
  console.log('3. Créer les services dans lib/services/');
  console.log('4. Compléter les données mockées dans lib/mock-data/');
  console.log('5. Créer les pages manquantes (candidatures)');
  console.log('6. Adapter les composants selon les besoins\n');
}

// Exécuter le script
main();

