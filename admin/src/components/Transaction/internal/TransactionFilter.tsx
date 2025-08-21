import { Grid, Card } from '@mui/material';
import { Transaction } from '@/type/transaction/transaction';
import { TRANSACTION_FIELDS } from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationParams } from '@/type/api';
import { SearchInputParam } from '@/components/SearchInput/SearchInputParam';
import { SortSelectParam } from '@/components/Select/SortSelectParam';

export const TransactionFilter = () => {
  const { confirmSearch, setConfirmSearch } = useTableQueryParams();
  return (
    <Card sx={{ p: 2 }}>
      <Grid spacing={3} container>
        <Grid size={4}>
          <SearchInputParam<IPaginationParams<Transaction>>
            value={confirmSearch}
            placeholder="Search transaction"
            valueParams="search"
            onChange={(e) => setConfirmSearch(e.target.value)}
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
