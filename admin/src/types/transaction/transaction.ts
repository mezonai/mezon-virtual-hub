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
