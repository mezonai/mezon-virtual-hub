import { Grid, Card } from '@mui/material';
import { SortOrder } from '../../../types/user';
import {
  Transaction,
  transactionParams,
} from '../../../types/transaction/transaction';
import { SearchInput } from '../../../theme/components/SearchInput/SearchInput';
import { SortSelect } from '../../../theme/components/Select/SortSelect';
import { TRANSACTION_FIELDS } from '../../../constant/table/tableConfig';

interface TransactionFilterProps {
  sortBy: string;
  order: SortOrder;
  confirmSearch: string;
  onParamsChange: (params: Partial<transactionParams>) => void;
  setConfirmSearch: React.Dispatch<React.SetStateAction<string>>;
}
export const TransactionFilter = ({
  sortBy,
  order,
  confirmSearch,
  onParamsChange,
  setConfirmSearch,
}: TransactionFilterProps) => {
  return (
    <Card sx={{ p: 2 }}>
      <Grid spacing={4} container>
        <SearchInput<transactionParams>
          placeholder="Search transaction"
          value={confirmSearch}
          onChangeSearch={setConfirmSearch}
          onParamsChange={onParamsChange}
        />
        <SortSelect<transactionParams, Transaction>
          sortBy={sortBy}
          order={order}
          onParamsChange={onParamsChange}
          items={TRANSACTION_FIELDS}
        />
      </Grid>
    </Card>
  );
};
