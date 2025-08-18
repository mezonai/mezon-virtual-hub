import { Toast } from '@/components/Toast';
import { ToastType } from '@/type/toast/toast';
import axios, { AxiosError } from 'axios';
import { ApiResponseError } from '@/types/auth/auth';
import { paths } from '@/utils/paths';
import { refreshTokens } from '../auth/refreshTokens';

const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://fallback.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage before each request
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  function (response) {
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      const getToken = localStorage.getItem('accessToken');
      if (!refreshToken || !getToken) {
        window.location.href = paths.auth.login;
        return;
      }
      try {
        const res = await refreshTokens({ refreshToken });
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        error.config.headers['Authorization'] = `Bearer ${res.accessToken}`;
        return httpClient(error.config);
      } catch (err: unknown) {
        const error = err as AxiosError<ApiResponseError>;
        Toast({
          type: ToastType.ERROR,
          message: error?.response?.data?.message,
        });
      }
    }
    if (error?.response) {
      Toast({
        message: error?.response?.data?.message || 'An Error occurred',
        type: ToastType.ERROR,
      });
    } else {
      Toast({
        message: 'Network error, please try again',
        type: ToastType.ERROR,
      });
    }
    return Promise.reject(error);
  },
);

export default httpClient;
