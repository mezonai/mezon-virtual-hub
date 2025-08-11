import { Card } from '@mui/material';
import {
  Transaction,
  transactionParams,
} from '../../../types/transaction/transaction';
import { Spinner } from '../../../theme/components/Spinner/Spinner';
import { formatDate } from '../../../utils/fortmat/formateDate';
import { AbstractTable } from '../../../theme/components/Table/AbstractTable';

interface TransactionProps {
  loading?: boolean;
  rows?: Transaction[];
  rowsPerPage?: number;
  count?: number;
  page?: number;
  onParamsChange: (params: Partial<transactionParams>) => void;
}

export const TransactionTable = ({
  rows = [],
  rowsPerPage = 0,
  count = 0,
  page = 0,
  loading,
  onParamsChange,
}: TransactionProps) => {
  if (loading) return <Spinner />;
  return (
    <Card>
      <AbstractTable<Transaction, transactionParams>
        columns={[
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
        ]}
        rows={rows}
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onParamsChange={onParamsChange}
      />
    </Card>
  );
};
