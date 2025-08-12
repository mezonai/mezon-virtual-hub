import { Card } from '@mui/material';
import {
  Transaction,
  transactionParams,
} from '../../../types/transaction/transaction';
import { Spinner } from '../../../theme/components/Spinner/Spinner';
import { AbstractTable } from '../../../theme/components/Table/AbstractTable';
import { TRANSACTION_TABLE_CONFIG } from '../../../constant/table/tableConfig';

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
        columns={TRANSACTION_TABLE_CONFIG}
        rows={rows}
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onParamsChange={onParamsChange}
      />
    </Card>
  );
};
