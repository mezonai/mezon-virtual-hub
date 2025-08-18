import { create } from 'zustand';
import { TransactionStore } from './type';
import {
  getTransaction,
  getTransactionParams,
} from '../../services/transaction/getTransaction';
import { Transaction } from '../../types/transaction/transaction';
import { PaginationResponseApi } from '../../types/common/common';

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: {} as PaginationResponseApi<Transaction>,
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
