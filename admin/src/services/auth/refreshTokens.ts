import { AuthResponseApi } from '@/types/auth/auth';
import { REFRESH_TOKEN } from '@/utils/config';
import httpClient from '../httpService/httpServices';

interface RefreshTokenBody {
  refreshToken: string;
}

export const refreshTokens = async (
  body: RefreshTokenBody,
): Promise<AuthResponseApi> => {
  try {
    const response = await httpClient.post(`${REFRESH_TOKEN}`, body);
    return response?.data?.data;
  } catch (err) {
    throw err;
  }
};
