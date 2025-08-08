import { Stack, Typography } from '@mui/material';
import { TransactionFilter } from './internal/TransactionFilter';
import { TransactionTable } from './internal/TransactionTable';
import { useTransactionList } from './hooks/useTransactionList';
import { Spinner } from '../../theme/components/spinner/Spinner';

export const TransactionList = () => {
  const {
    loading,
    limit: rowsPerPage,
    page,
    sortBy,
    transactionData,
    order,
    toatalItem,
    confirmSearch,
    setConfirmSearch,
    handleParamsChange,
  } = useTransactionList();

  if (loading) return <Spinner />;
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
        count={toatalItem}
        page={page}
        onParamsChange={handleParamsChange}
      />
    </Stack>
  );
};
