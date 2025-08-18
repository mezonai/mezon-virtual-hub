import { UserInfo } from '@/lib/schema/user/user';
import { UPDATE_USER } from '@/utils/config';
import httpClient from '../httpService/httpServices';

export const updateUser = async (
  body: UserInfo,
  user_id: string | undefined,
): Promise<boolean> => {
  try {
    const response = await httpClient.put(`${UPDATE_USER}/${user_id}`, body);
    return response?.data?.success ?? false;
  } catch (error) {
    console.error('updateUser', error);
    return false;
  }
};
