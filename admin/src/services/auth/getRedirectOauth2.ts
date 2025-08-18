import { REDIRECT_OAUTH2 } from '@/utils/config';
import httpClient from '../httpService/httpServices';

interface ResponseRedirectOauth2 {
  code: boolean;
  message: string;
  success: boolean;
  data: string;
  path: string;
  timestamp: string;
}

export const getRedirectOauth2 = async (
  redirect_url: string,
): Promise<ResponseRedirectOauth2 | null> => {
  try {
    const res = await httpClient.get(`${REDIRECT_OAUTH2}`, {
      params: {
        redirect_url,
      },
    });
    return res?.data ?? null;
  } catch (err) {
    console.error('getRedirectOauth2', err);
    return null;
  }
};
