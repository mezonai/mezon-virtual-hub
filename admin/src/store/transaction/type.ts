import { getTransactionParams } from '@/services/transaction/getTransaction';
import { IPaginationResponse } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';

export interface TransactionStore {
  transactions: IPaginationResponse<Transaction>;
  fetchTransaction: (params: getTransactionParams) => Promise<void>;
}
