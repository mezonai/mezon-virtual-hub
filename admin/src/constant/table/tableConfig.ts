import React from 'react';
import { User } from '../../models/user';
import { formatDate } from '../../utils/format/formatDate';
import { Transaction } from '../../types/transaction/transaction';

export const USER_TABLE_CONFIG: {
  key: keyof User | string;
  headerName: string;
  render?: (row: User) => React.ReactNode;
}[] = [
  {
    key: 'mezon_id',
    headerName: 'Mezon ID',
  },
  {
    key: 'username',
    headerName: 'Username',
  },
  {
    key: 'email',
    headerName: 'Email',
  },
  {
    key: 'gender',
    headerName: 'Gender',
  },
  {
    key: 'map',
    headerName: 'Map',
    render: (row) => row?.map?.name ?? '-',
  },
  {
    key: 'display_name',
    headerName: 'Display name',
  },
  {
    key: 'gold',
    headerName: 'Gold',
  },
  {
    key: 'diamond',
    headerName: 'Diamond',
  },
  {
    key: 'created_at',
    headerName: 'Created At',
    render: (row) => formatDate({ date: row.created_at }),
  },
  {
    key: 'action',
    headerName: 'Action',
  },
];

export const USER_FIELDS: Record<string, string> = {
  id: 'ID',
  mezon_id: 'Mezon ID',
  username: 'Username',
  email: 'Email',
  display_name: 'Display Name',
  gold: 'Gold',
  diamond: 'Diamond',
  gender: 'Gender',
  has_first_reward: 'Has First Reward',
  created_at: 'Created At',
  updated_at: 'Updated At',
} as const;

export const TRANSACTION_TABLE_CONFIG: {
  key: keyof Transaction;
  headerName: string;
  render?: (row: Transaction) => React.ReactNode;
}[] = [
  {
    key: 'mezon_transaction_id',
    headerName: 'Mezon Transaction ID',
  },
  {
    key: 'amount',
    headerName: 'Amount',
  },
  {
    key: 'type',
    headerName: 'Type',
  },
  {
    key: 'currency',
    headerName: 'Currency',
  },
  {
    key: 'receiver_id',
    headerName: 'Receiver ID',
  },
  {
    key: 'user',
    headerName: 'User',
    render: (row) => row?.user?.username ?? '',
  },
  {
    key: 'created_at',
    headerName: 'Created At',
    render: (row) => formatDate({ date: row.created_at }),
  },
];

export const TRANSACTION_FIELDS: Record<string, string> = {
  id: 'ID',
  mezon_transaction_id: 'Mezon Transaction ID',
  amount: 'Amount',
  type: 'Type',
  currency: 'Currentcy',
  receiver_id: 'Receiver ID',
  extra_attribute: 'Extra Attribute',
  created_at: 'Created At',
} as const;
