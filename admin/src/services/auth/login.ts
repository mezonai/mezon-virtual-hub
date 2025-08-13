import { LOGIN } from '../../utils/config';
import httpClient from '../httpService/httpServices';

interface loginParams {
  code: string | null;
  state: string | null;
}

interface loginResponseApi {
  accessToken: string;
  refreshToken: string;
}

export const login = async ({
  code,
  state,
}: loginParams): Promise<loginResponseApi | null> => {
  try {
    const response = await httpClient.post(`${LOGIN}`, {
      code,
      state,
    });
    return response?.data ?? null;
  } catch (err) {
    return null;
  }
};
