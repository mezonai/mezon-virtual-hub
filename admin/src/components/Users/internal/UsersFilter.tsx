import Card from '@mui/material/Card';
import { Grid } from '@mui/material';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { SearchInput } from '@/components/SearchInput';
import { SortSelect } from '@/components/Select';
import { USER_FIELDS } from '@/constant/table/tableConfig';
import { User } from '@/models/user';
import { IPaginationParams } from '@/type/api';

export function UsersFilter(): React.JSX.Element {
  const { handleParamsChange, setConfirmSearch, confirmSearch, sortBy, order } =
    useTableQueryParams<User>();
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={4}>
        <SearchInput<IPaginationParams<User>>
          placeholder="Search user"
          value={confirmSearch}
          onChangeSearch={setConfirmSearch}
          onParamsChange={handleParamsChange}
        />
        <SortSelect<IPaginationParams<User>, User>
          sortBy={sortBy}
          order={order}
          onParamsChange={handleParamsChange}
          items={USER_FIELDS}
        />
      </Grid>
    </Card>
  );
}
