import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (user, token) => {
    const authData = JSON.stringify({ token, user });
    await Keychain.setGenericPassword('sakubumi_auth', authData);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await Keychain.resetGenericPassword();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const { token, user } = JSON.parse(credentials.password);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
