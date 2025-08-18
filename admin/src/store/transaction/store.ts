import { create } from 'zustand';
import { TransactionStore } from './type';
import {
  getTransaction,
  getTransactionParams,
} from '@/services/transaction/getTransaction';
import { TransactionResponseAPI } from '@/type/transaction/transaction';


export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: {} as TransactionResponseAPI,
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
