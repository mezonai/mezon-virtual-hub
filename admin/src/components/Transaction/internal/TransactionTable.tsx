import { AbstractTable } from '@/components/Table';
import { TRANSACTION_TABLE_CONFIG } from '@/constant/table/tableConfig';
import { useTableList } from '@/hooks/useTableList';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { useTransactionStore } from '@/store/transaction/store';
import { IPaginationParams } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';
import { Card } from '@mui/material';

export const TransactionTable = () => {
  const { handleParamsChange, page, limit } = useTableQueryParams();
  const { fetchTransaction, transactions } = useTransactionStore();
  const { loading, responseData, totalItem } = useTableList<Transaction>({
    fetchData: fetchTransaction,
    storeData: transactions,
  });
  return (
    <Card>
      <AbstractTable<Transaction, IPaginationParams<Transaction>>
        columns={TRANSACTION_TABLE_CONFIG}
        rows={responseData}
        count={totalItem}
        page={page}
        rowsPerPage={limit}
        onParamsChange={handleParamsChange}
        loading={loading}
      />
    </Card>
  );
};
