import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserProfile } from '../types';
import { authApi } from '../api/client';

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
  register: (userData: { 
    email: string; 
    password: string; 
    username: string; 
    first_name?: string; 
    last_name?: string;
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
