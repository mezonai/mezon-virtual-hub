import { IPaginationResponse } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';
import httpClient from '../httpService/httpServices';
import { GET_TRANSACTION } from '@/utils/config';
import { IQueryParams } from '@/hooks/useTableQueryParams';

export const getTransaction = async (
  params: IQueryParams,
): Promise<IPaginationResponse<Transaction> | null> => {
  try {
    const response = await httpClient.get(`${GET_TRANSACTION}`, {
      params: params,
    });
    return response?.data?.data ?? [];
  } catch (error) {
    console.error('getTransaction', error);
    return null;
  }
};
