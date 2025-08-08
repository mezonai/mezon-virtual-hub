import { TransactionResponseAPI } from '../../models/transaction/transaction';
import { GET_TRANSACTION } from '../../utils/config';
import httpClient from '../httpService/httpServices';

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
}: getTransactionParams): Promise<TransactionResponseAPI | null> => {
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
