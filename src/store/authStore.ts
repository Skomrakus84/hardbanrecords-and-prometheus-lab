import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserProfile } from '../types';
import { authApi } from '../api/client';

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@hardban.com',
    username: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    module_access: 'both',
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2', 
    email: 'musician@hardban.com',
    username: 'johnmusician',
    first_name: 'John',
    last_name: 'Musician',
    role: 'artist',
    module_access: 'music',
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'writer@hardban.com', 
    username: 'janewriter',
    first_name: 'Jane',
    last_name: 'Writer',
    role: 'user',
    module_access: 'publishing',
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockProfiles: UserProfile[] = [
  {
    id: '1',
    user_id: '1',
    display_name: 'Admin User',
    bio: 'Platform Administrator',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '2', 
    display_name: 'John Musician',
    bio: 'Professional musician and producer',
    is_public: true,
    genre_preferences: ['Rock', 'Electronic'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: '3',
    display_name: 'Jane Writer',
    bio: 'Published author and content creator',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  mockLogin: (email: string) => Promise<boolean>;
  register: (userData: { 
    email: string; 
    password: string; 
    username: string; 
    first_name?: string; 
    last_name?: string;
    module_access?: 'music' | 'publishing';
  }) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(credentials);
          const data = response.data as any;
          
          if (data.success && data.data) {
            const { user, profile, token } = data.data;
            
            // Store token in localStorage
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('auth_token', token);
            }
            
            set({
              user,
              profile,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            set({
              isLoading: false,
              error: data.message || 'Login failed',
            });
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          return false;
        }
      },

      mockLogin: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = mockUsers.find(u => u.email === email);
          if (user) {
            const profile = mockProfiles.find(p => p.user_id === user.id);
            
            set({
              user,
              profile,
              token: 'mock_token_' + user.id,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            set({
              isLoading: false,
              error: 'User not found',
            });
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: 'Mock login failed',
          });
          return false;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.register(userData);
          const data = response.data as any;
          
          if (data.success && data.data) {
            const { user, profile, token } = data.data;
            
            // Store token in localStorage
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('auth_token', token);
            }
            
            set({
              user,
              profile,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            set({
              isLoading: false,
              error: data.message || 'Registration failed',
            });
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          return false;
        }
      },

      logout: () => {
        // Remove token from localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('auth_token');
        }
        
        // Call logout API (fire and forget)
        authApi.logout().catch(() => {});
        
        set({
          user: null,
          profile: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          const data = response.data as any;
          
          if (data.success && data.data) {
            const { token } = data.data;
            
            // Store new token in localStorage
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('auth_token', token);
            }
            
            set({ token });
            return true;
          }
          
          return false;
        } catch {
          // If refresh fails, logout user
          get().logout();
          return false;
        }
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true });
          
          const response = await authApi.getCurrentUser();
          const data = response.data as any;
          
          if (data.success && data.data) {
            set({
              user: data.data,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch {
          set({
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions for access control
export const hasAccess = (user: User | null, requiredModule: 'music' | 'publishing'): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.module_access === requiredModule || user.module_access === 'both';
};

export const canAccessAdminPanel = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'label';
};

export const getAvailableModules = (user: User | null): Array<'music' | 'publishing'> => {
  if (!user) return [];
  if (user.role === 'admin') return ['music', 'publishing'];
  if (user.module_access === 'both') return ['music', 'publishing'];
  return [user.module_access];
};
