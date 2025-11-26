import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponseDto, SessionUser } from '@/types/auth';

interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: UserResponseDto | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: UserResponseDto) => void;
  logout: () => void;
  clearError: () => void;
  updateUser: (updates: Partial<UserResponseDto>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: (user) => set({ 
        user, 
        isAuthenticated: true,
        error: null,
        isLoading: false 
      }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null,
        isLoading: false 
      }),

      clearError: () => set({ error: null }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...updates },
            error: null 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Sélecteurs utiles
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
};

export const useAuthActions = () => {
  const { 
    setUser, 
    setLoading, 
    setError, 
    login, 
    logout, 
    clearError, 
    updateUser 
  } = useAuthStore();
  
  return { 
    setUser, 
    setLoading, 
    setError, 
    login, 
    logout, 
    clearError, 
    updateUser 
  };
};

// Hook pour vérifier les permissions
export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasRole = (role: string) => {
    return user?.role?.code === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user?.role?.code && roles.includes(user.role.code);
  };

  const canAccess = (resource: string, action: string) => {
    if (!user?.role) return false;
    
    const roleConfig = {
      USER: ['read:cels', 'upload:excel'],
      ADMIN: ['read:cels', 'read:departements', 'upload:excel', 'manage:users'],
      SADMIN: ['*'],
    };

    const permissions = roleConfig[user.role.code as keyof typeof roleConfig];
    
    if (permissions?.includes('*')) return true;
    
    return permissions?.includes(`${action}:${resource}`) ?? false;
  };

  return {
    hasRole,
    hasAnyRole,
    canAccess,
    isUser: hasRole('USER'),
    isAdmin: hasRole('ADMIN'),
    isSuperAdmin: hasRole('SADMIN'),
  };
};
