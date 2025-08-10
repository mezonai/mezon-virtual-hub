import { SortOrder } from '../user';

export interface Transaction {
  id: string;
  mezon_transaction_id: string;
  amount: number;
  type: TransactionType;
  currency: TransactionCurrency;
  receiver_id: string | null;
  extra_attribute: string | null;
  user: UserEntity;
  created_at: string;
}

export interface TransactionResponseAPI {
  result: Transaction[];
  page: number;
  size: number;
  total: number;
  total_page: number;
  has_previous_page: boolean;
  has_next_page: boolean;
}

export interface UserEntity {
  id: string;
  username: string;
}

export enum TransactionType {
  BUY = 'buy',
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
}

export enum TransactionCurrency {
  TOKEN = 'token',
  GOLD = 'gold',
  DIAMOND = 'diamond',
}

export type transactionParams = {
  page: number;
  limit: number;
  search: string;
  sort_by: keyof Transaction;
  order: SortOrder;
};
