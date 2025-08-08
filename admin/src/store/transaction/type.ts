import { TransactionResponseAPI } from '../../models/transaction/transaction';
import { getTransactionParams } from '../../services/transaction/getTransaction';

export interface TransactionStore {
  transactions: TransactionResponseAPI;
  fetchTransaction: (params: getTransactionParams) => Promise<void>;
}
