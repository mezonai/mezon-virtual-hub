import { Stack, Typography } from '@mui/material';
import { TransactionTable } from './internal/TransactionTable';
import { TransactionFilter } from './internal/TransactionFilter';
import { useTransactionList } from './hooks/useTransactionList';

export const TransactionList = () => {
  const { loading, transactionData, totalItem } = useTransactionList();

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Transactions</Typography>
      <TransactionFilter />
      <TransactionTable
        rows={transactionData}
        count={totalItem}
        loading={loading}
      />
    </Stack>
  );
};
