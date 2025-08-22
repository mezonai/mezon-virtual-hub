import { IQueryParams } from '@/hooks/useTableQueryParams';
import { User } from '@/models/user';
import httpClient from '../httpService/httpServices';
import { GET_USERS } from '@/utils/config';
import { IPaginationResponse } from '@/type/api';

export const getUsers = async (
  params: IQueryParams,
): Promise<IPaginationResponse<User> | null> => {
  try {
    const response = await httpClient.get(`${GET_USERS}`, {
      params: params,
    });
    return response?.data?.data ?? [];
  } catch (err) {
    console.error('getUsers', err);
    return null;
  }
};
