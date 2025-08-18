import { AuthResponseApi } from '@/types/auth/auth';
import { LOGIN } from '@/utils/config';
import httpClient from '../httpService/httpServices';

interface LoginBody {
  code: string;
  state: string;
  redirect_uri: string;
}

export const login = async (payload: LoginBody): Promise<AuthResponseApi> => {
  try {
    const response = await httpClient.post(`${LOGIN}`, payload);
    return response?.data?.data;
  } catch (err) {
    throw err;
  }
};
