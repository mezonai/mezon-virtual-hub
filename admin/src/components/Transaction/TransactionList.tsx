import { Stack, Typography } from '@mui/material';
import { TransactionTable } from './internal/TransactionTable';
import { TransactionFilter } from './internal/TransactionFilter';

export const TransactionList = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Transactions</Typography>
      <TransactionFilter />
      <TransactionTable />
    </Stack>
  );
};
