// Constantes de l'application CEI

export const APP_CONFIG = {
  name: 'Transmission EPR - CEI',
  description: 'Application de transmission des résultats',
  version: '1.0.0',
  author: 'Commission Électorale Indépendante',
} as const;

// Configuration de l'API
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      profile: '/auth/profile',
      verify: '/auth/verify',
    },
    dashboard: {
      stats: '/dashboard/stats',
      statsUser: '/dashboard/stats/user',
      statsAdmin: '/dashboard/stats/admin',
      statsSadmin: '/dashboard/stats/sadmin',
      cels: '/dashboard/cels',
      myCels: '/dashboard/cels/my-cels',
      departmentCels: '/dashboard/cels/department-cels',
      allCels: '/dashboard/cels/all-cels',
      celsByStatus: '/dashboard/cels/status',
      pendingImports: '/dashboard/cels/pending-imports',
      completedImports: '/dashboard/cels/completed-imports',
      errorImports: '/dashboard/cels/error-imports',
    },
    users: {
      list: '/users',
      create: '/users',
      getById: '/users',
      update: '/users',
      delete: '/users',
      assignDepartements: '/users',
      profile: '/users/profile/me',
      updateProfile: '/users/profile/me',
    },
    cels: {
      list: '/cels',
      getByCode: '/cels',
      update: '/cels',
      assignUser: '/cels',
      unassignUser: '/cels',
      stats: '/cels/stats/overview',
      byDepartement: '/cels/departement',
      byRegion: '/cels/region',
      unassigned: '/cels/unassigned/list',
      byType: '/cels/type',
    },
    departements: {
      list: '/departements',
      getByCode: '/departements',
      update: '/departements',
      assignUser: '/departements',
      unassignUser: '/departements',
      stats: '/departements/stats/overview',
      byRegion: '/departements/region',
    },
    upload: {
      excel: '/legislatives/upload/excel',
      imports: '/legislatives/upload/imports',
      stats: '/legislatives/upload/stats',
      importsByCel: '/upload/imports/cel',
      importsByStatus: '/upload/imports/statut',
    },
  },
} as const;

// Configuration de pagination
export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
  limits: [10, 25, 50, 100],
} as const;

// Configuration des fichiers
export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  allowedExtensions: ['.xlsx', '.xls'],
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Session expirée, veuillez vous reconnecter',
  FORBIDDEN: 'Accès non autorisé',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation des données',
  FILE_TOO_LARGE: 'Fichier trop volumineux (max 10MB)',
  INVALID_FILE_TYPE: 'Type de fichier non supporté',
  UPLOAD_FAILED: 'Échec de l\'upload du fichier',
  IMPORT_FAILED: 'Échec de l\'import des données',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  UPLOAD_SUCCESS: 'Fichier uploadé avec succès',
  IMPORT_SUCCESS: 'Import des données réussi',
  UPDATE_SUCCESS: 'Mise à jour réussie',
  CREATE_SUCCESS: 'Création réussie',
  DELETE_SUCCESS: 'Suppression réussie',
} as const;

// Configuration des rôles
export const ROLE_CONFIG = {
  USER: {
    name: 'Utilisateur',
    description: 'Utilisateur standard avec accès aux CELs assignées',
    permissions: ['read:cels', 'upload:excel'],
  },
  ADMIN: {
    name: 'Administrateur',
    description: 'Administrateur avec accès aux départements assignés',
    permissions: ['read:cels', 'read:departements', 'upload:excel', 'manage:users'],
  },
  SADMIN: {
    name: 'Super Administrateur',
    description: 'Super administrateur avec accès complet',
    permissions: ['*'],
  },
} as const;

// Configuration des statuts d'import
export const IMPORT_STATUS_CONFIG = {
  PENDING: {
    label: 'En attente',
    color: 'warning',
    description: 'Import en attente de traitement',
  },
  PROCESSING: {
    label: 'En cours',
    color: 'info',
    description: 'Import en cours de traitement',
  },
  COMPLETED: {
    label: 'Terminé',
    color: 'success',
    description: 'Import terminé avec succès',
  },
  ERROR: {
    label: 'Erreur',
    color: 'error',
    description: 'Erreur lors de l\'import',
  },
} as const;

// Configuration des couleurs CEI
export const CEI_COLORS = {
  primary: '#DB812E',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// Configuration des animations
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;
