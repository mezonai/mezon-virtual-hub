import { useCallback } from 'react';
import { login } from '../services/auth/login';
import { useNavigate } from 'react-router-dom';
import { paths } from '../utils/paths';
import { getRedirectUrl } from '../utils/url/getRedirectUrl';
import { removeToken, setTokens } from '../utils/auth/authStorage';

export function useAuth() {
  const navigate = useNavigate();
  const handleLogin = useCallback(
    async (code: string, state: string): Promise<boolean> => {
      if (!code || !state) return false;
      try {
        const redirect_uri = getRedirectUrl();
        const data = await login({ code, state, redirect_uri });
        if (data) {
          setTokens(data.accessToken, data.refreshToken);
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
    removeToken();
    navigate(paths.auth.login);
  }, [navigate]);

  return {
    handleLogin,
    handleLogout,
  };
}
