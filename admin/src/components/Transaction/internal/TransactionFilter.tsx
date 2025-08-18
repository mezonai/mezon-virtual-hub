import { Grid, Card } from '@mui/material';
import { Transaction } from '../../../types/transaction/transaction';
import { SearchInput } from '../../../theme/components/SearchInput/SearchInput';
import { SortSelect } from '../../../theme/components/Select/SortSelect';
import { TRANSACTION_FIELDS } from '../../../constant/table/tableConfig';
import { PaginationParams } from '../../../types/common/common';
import { useTableQueryParams } from '../../../hooks/useTableQueryParams';


export const TransactionFilter = () => {
  const { handleParamsChange, setConfirmSearch, confirmSearch, sortBy, order } =
    useTableQueryParams<Transaction>();
  return (
    <Card sx={{ p: 2 }}>
      <Grid spacing={4} container>
        <SearchInput<PaginationParams<Transaction>>
          placeholder="Search transaction"
          value={confirmSearch}
          onChangeSearch={setConfirmSearch}
          onParamsChange={handleParamsChange}
        />
        <SortSelect<PaginationParams<Transaction>, Transaction>
          sortBy={sortBy}
          order={order}
          onParamsChange={handleParamsChange}
          items={TRANSACTION_FIELDS}
        />
      </Grid>
    </Card>
  );
};
