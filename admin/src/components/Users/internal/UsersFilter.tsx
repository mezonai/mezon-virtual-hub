import Card from '@mui/material/Card';
import { Grid } from '@mui/material';
import { SearchInput } from '../../../theme/components/SearchInput/SearchInput';
import { SortSelect } from '../../../theme/components/Select/SortSelect';
import { USER_FIELDS } from '../../../constant/table/tableConfig';
import { PaginationParams } from '../../../types/common/common';
import { User } from '../../../types/user/user';
import { useTableQueryParams } from '../../../hooks/useTableQueryParams';

export function UsersFilter(): React.JSX.Element {
  const { handleParamsChange, setConfirmSearch, confirmSearch, sortBy, order } =
    useTableQueryParams<User>();
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={4}>
        <SearchInput<PaginationParams<User>>
          placeholder="Search user"
          value={confirmSearch}
          onChangeSearch={setConfirmSearch}
          onParamsChange={handleParamsChange}
        />
        <SortSelect<PaginationParams<User>, User>
          sortBy={sortBy}
          order={order}
          onParamsChange={handleParamsChange}
          items={USER_FIELDS}
        />
      </Grid>
    </Card>
  );
}
