import axios from 'axios';
import { Toast } from '../../theme/components/Toast/Toast';
import { ToastType } from '../../types/toast/toast';

const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://fallback.example.com',
  timeout: 10000,
});

// Attach token from localStorage before each request
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
  (error) => {
    if (error.response) {
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
