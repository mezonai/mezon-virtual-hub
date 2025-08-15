import { useCallback } from 'react';
import { login } from '../services/auth/login';
import { useNavigate } from 'react-router-dom';
import { paths } from '../utils/paths';
import { getRedirectUrl } from '../utils/url/getRedirectUrl';

export function useAuth() {
  const navigate = useNavigate();
  const handleLogin = useCallback(
    async (code: string, state: string): Promise<boolean> => {
      if (!code || !state) return false;
      try {
        const redirect_uri = getRedirectUrl();
        const data = await login({ code, state, redirect_uri });
        if (data) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate(paths.auth.login);
  }, [navigate]);

  return {
    handleLogin,
    handleLogout,
  };
}
