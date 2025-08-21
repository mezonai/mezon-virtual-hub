import { SearchInputParam } from '@/components/SearchInput/SearchInputParam';
import { SortSelectParam } from '@/components/Select/SortSelectParam';
import { TRANSACTION_FIELDS } from '@/constant/table/tableConfig';
import { IPaginationParams } from '@/type/api';
import { Transaction } from '@/type/transaction/transaction';
import { Card, Grid } from '@mui/material';

export const TransactionFilter = () => {
  return (
    <Card sx={{ p: 2 }}>
      <Grid spacing={3} container>
        <Grid size={4}>
          <SearchInputParam<IPaginationParams<Transaction>>
            placeholder="Search transaction"
            valueParams="search"
          />
        </Grid>
        <Grid size={4}>
          <SortSelectParam<IPaginationParams<Transaction>>
            items={TRANSACTION_FIELDS}
          />
        </Grid>
      </Grid>
    </Card>
  );
};
