import { Card } from '@mui/material';
import { Transaction } from '../../../types/transaction/transaction';
import { AbstractTable } from '../../../theme/components/Table/AbstractTable';
import { TRANSACTION_TABLE_CONFIG } from '../../../constant/table/tableConfig';
import { PaginationParams } from '../../../types/common/common';
import { useTableQueryParams } from '../../../hooks/useTableQueryParams';

interface TransactionProps {
  loading?: boolean;
  rows?: Transaction[];
  count?: number;
}

export const TransactionTable = ({
  rows = [],
  count = 0,
  loading,
}: TransactionProps) => {
  const { handleParamsChange, page, limit } = useTableQueryParams();
  return (
    <Card>
      <AbstractTable<Transaction, PaginationParams<Transaction>>
        columns={TRANSACTION_TABLE_CONFIG}
        rows={rows}
        count={count}
        page={page}
        rowsPerPage={limit}
        onParamsChange={handleParamsChange}
        loading={loading}
      />
    </Card>
  );
};
