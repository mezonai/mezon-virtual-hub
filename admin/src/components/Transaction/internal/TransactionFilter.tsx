import { Grid, Card } from '@mui/material';
import { Transaction } from '@/type/transaction/transaction';
import { SearchInput } from '@/components/SearchInput';
import { SortSelect } from '@/components/Select';
import { TRANSACTION_FIELDS } from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationParams } from '@/type/api';

export const TransactionFilter = () => {
  const { handleParamsChange, confirmSearch, setConfirmSearch, order, sortBy } =
    useTableQueryParams();
  return (
    <Card sx={{ p: 2 }}>
      <Grid spacing={4} container>
        <SearchInput<IPaginationParams<Transaction>>
          placeholder="Search transaction"
          value={confirmSearch}
          onChangeSearch={setConfirmSearch}
          onParamsChange={handleParamsChange}
          valueParams="search"
        />
        <SortSelect<IPaginationParams<Transaction>, Transaction>
          sortBy={sortBy}
          order={order}
          onParamsChange={handleParamsChange}
          items={TRANSACTION_FIELDS}
        />
      </Grid>
    </Card>
  );
};
