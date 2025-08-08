import { Stack, Typography } from '@mui/material';
import { TransactionFilter } from './internal/TransactionFilter';
import { TransactionTable } from './internal/TransactionTable';
import { useTransactionList } from './hooks/useTransactionList';

export const TransactionList = () => {
  const {
    loading,
    limit: rowsPerPage,
    page,
    sortBy,
    transactionData,
    order,
    totalItem,
    confirmSearch,
    setConfirmSearch,
    handleParamsChange,
  } = useTransactionList();

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Transactions</Typography>
      <TransactionFilter
        sortBy={sortBy}
        order={order}
        onParamsChange={handleParamsChange}
        setConfirmSearch={setConfirmSearch}
        confirmSearch={confirmSearch}
      />
      <TransactionTable
        rows={transactionData}
        rowsPerPage={rowsPerPage}
        count={totalItem}
        page={page}
        onParamsChange={handleParamsChange}
        loading={loading}
      />
    </Stack>
  );
};
