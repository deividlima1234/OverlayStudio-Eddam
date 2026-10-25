import { create } from 'zustand';
import { getApiUrl } from '../utils/apiUrl';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Acciones
  setAuth: (user: UserProfile, token: string) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  getAuthHeaders: () => Record<string, string>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Inicializar desde localStorage si existe
  const storedUser = localStorage.getItem('eddam_user');
  const storedToken = localStorage.getItem('eddam_token');

  let initialUser: UserProfile | null = null;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch {
      initialUser = null;
    }
  }

  return {
    user: initialUser,
    token: storedToken || null,
    isAuthenticated: Boolean(initialUser && storedToken),
    isLoading: false,

    setAuth: (user: UserProfile, token: string) => {
      localStorage.setItem('eddam_user', JSON.stringify(user));
      localStorage.setItem('eddam_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    },

    updateUser: (partial: Partial<UserProfile>) => {
      const current = get().user;
      if (!current) return;
      const updated = { ...current, ...partial };
      localStorage.setItem('eddam_user', JSON.stringify(updated));
      set({ user: updated });
    },

    logout: () => {
      localStorage.removeItem('eddam_user');
      localStorage.removeItem('eddam_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: async () => {
      const token = get().token || localStorage.getItem('eddam_token');
      if (!token) {
        set({ isAuthenticated: false, user: null });
        return false;
      }

      // Si es un token de invitado demo, es válido localmente
      if (token.startsWith('guest-token-')) {
        return true;
      }

      const API_URL = getApiUrl();
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const userData = await res.json();
          get().setAuth(userData, token);
          return true;
        } else {
          get().logout();
          return false;
        }
      } catch {
        // En caso de fallo de red, mantener sesión local si existe
        return get().isAuthenticated;
      }
    },

    getAuthHeaders: (): Record<string, string> => {
      const token = get().token || localStorage.getItem('eddam_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    }
  };
});
