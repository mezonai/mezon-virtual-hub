import { create } from 'zustand';
import { AuthStore } from './type';

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: '',
  refreshToken: '',
  setTokens: (access, refresh) =>
    set({ accessToken: access, refreshToken: refresh }),
  clearTokens: () => {
    set({ accessToken: '', refreshToken: '' });
  },
}));
