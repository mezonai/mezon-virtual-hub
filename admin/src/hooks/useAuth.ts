import { useCallback } from 'react';
import { useAuthStore } from '../store/auth/store';
import { login } from '../services/auth/login';

export function useAuth() {
  const { setTokens, clearTokens } = useAuthStore();

  const handleLogin = useCallback(
    async (code: string | null, state: string | null): Promise<boolean> => {
      const data = await login({ code, state });
      if (data) {
        localStorage.setItem('authToken', data.accessToken);
        setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    },
    [],
  );

  const handleLogout = useCallback(() => {
    clearTokens();
    localStorage.removeItem('authToken');
  }, []);

  return {
    handleLogin,
    handleLogout,
  };
}
