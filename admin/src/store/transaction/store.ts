import { create } from 'zustand';
import { TransactionStore } from './type';
import { IPaginationResponse } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';
import { getTransaction } from '@/services/transaction/getTransaction';
import { IQueryParams } from '@/hooks/useTableQueryParams';

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: {} as IPaginationResponse<Transaction>,
  fetchTransaction: async (params: IQueryParams) => {
    if (get().transactions) {
      const transactions = await getTransaction(params);
      if (transactions) {
        return set({ transactions });
      } else {
        return set({});
      }
    }
  },
}));
