import { Grid, Card } from '@mui/material';
import { SortOrder } from '@/type/enum';
import { PaginationParams } from '@/types/common/common';
import { Transaction } from '@/type/transaction/transaction';
import { SearchInput } from '@/components/SearchInput';
import { SortSelect } from '@/components/Select';
import { TRANSACTION_FIELDS } from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';

interface TransactionFilterProps {
  sortBy: string;
  order: SortOrder;
  confirmSearch: string;
  onParamsChange: (params: Partial<PaginationParams<Transaction>>) => void;
  setConfirmSearch: React.Dispatch<React.SetStateAction<string>>;
}
export const TransactionFilter = ({
  sortBy,
  order,
  confirmSearch,
  onParamsChange,
  setConfirmSearch,
}: TransactionFilterProps) => {
  const { handleParamsChange } = useTableQueryParams();
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
