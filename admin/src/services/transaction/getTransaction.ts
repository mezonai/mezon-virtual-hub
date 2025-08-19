import { IPaginationResponse } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';
import httpClient from '../httpService/httpServices';
import { GET_TRANSACTION } from '@/utils/config';

export interface getTransactionParams {
  search: string;
  page: number;
  limit: number;
  sort_by: string;
  order: string;
}

export const getTransaction = async ({
  search,
  page,
  limit,
  sort_by,
  order,
}: getTransactionParams): Promise<IPaginationResponse<Transaction> | null> => {
  try {
    const response = await httpClient.get(`${GET_TRANSACTION}`, {
      params: {
        search,
        page,
        limit,
        sort_by,
        order,
      },
    });
    return response?.data?.data ?? [];
  } catch (error) {
    console.error('getTransaction', error);
    return null;
  }
};
