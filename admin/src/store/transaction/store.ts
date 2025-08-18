import { create } from 'zustand';
import { TransactionStore } from './type';
import { IPaginationResponse } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';
import {
  getTransaction,
  getTransactionParams,
} from '@/services/transaction/getTransaction';

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: {} as IPaginationResponse<Transaction>,
  fetchTransaction: async ({
    search,
    page,
    limit,
    sort_by,
    order,
  }: getTransactionParams) => {
    if (get().transactions) {
      const transactions = await getTransaction({
        search,
        page,
        limit,
        sort_by,
        order,
      });
      if (transactions) {
        return set({ transactions });
      } else {
        return set({});
      }
    }
  },
}));
