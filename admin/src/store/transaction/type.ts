import { getTransactionParams } from '../../services/transaction/getTransaction';
import { PaginationResponseApi } from '../../types/common/common';
import { Transaction } from '../../types/transaction/transaction';

export interface TransactionStore {
  transactions: PaginationResponseApi<Transaction>;
  fetchTransaction: (params: getTransactionParams) => Promise<void>;
}
