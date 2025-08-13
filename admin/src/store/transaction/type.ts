import { getTransactionParams } from '../../services/transaction/getTransaction';
import { TransactionResponseAPI } from '../../types/transaction/transaction';

export interface TransactionStore {
  transactions: TransactionResponseAPI;
  fetchTransaction: (params: getTransactionParams) => Promise<void>;
}
