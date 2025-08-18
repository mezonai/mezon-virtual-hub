import { Grid, Card } from '@mui/material';
import { SortOrder } from '@/type/enum/user';
import {
  Transaction,
  transactionParams,
} from '@/type/transaction/transaction';
import { TRANSACTION_FIELDS } from '@/constant/table/tableConfig';
import { SortSelect } from '@/components/Select';
import { SearchInput } from '@/components/SearchInput';

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
