// Export de tous les services API

export * from './client';
export * from './auth';

// Services API pour les CELs
export { celsApi } from './cels';

// Services API pour les départements
export { departementsApi } from './departements';

// Services API pour l'upload
export { uploadApi } from './upload';
export type { 
  ImportData, 
  ImportListResponse, 
  ImportStats, 
  ImportFilters, 
  UploadRequestParams,
  UploadResponse,
  ImportStatus 
} from '@/types/upload';

// Services API pour le dashboard
export { dashboardApi } from './dashboard';

// Services API pour les utilisateurs
export { usersApi } from './users';
export type { User, UserListResponse, CreateUserData, UpdateUserData, UpdateProfileData, AssignDepartmentsData, AssignCelsData, AssignCirconscriptionsData } from './users';

// Services API pour les listes de formulaires
export { listsApi } from './lists';
export type { SimpleDepartement, SimpleCel, SimpleCirconscription, SimpleRegion } from './lists';

// Services API pour les rôles
export { rolesApi } from './roles';
export type { Role } from './roles';

// Export des types depuis auth pour compatibilité avec le guide API
export type { Role as AuthRole, Departement, Cel, CreateUserDto } from '@/types/auth';