import { IQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationResponse } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';

export interface TransactionStore {
  transactions: IPaginationResponse<Transaction>;
  fetchTransaction: (params: IQueryParams) => Promise<void>;
}
