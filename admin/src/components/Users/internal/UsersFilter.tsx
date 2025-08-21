import Card from '@mui/material/Card';
import { Grid } from '@mui/material';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { USER_FIELDS } from '@/constant/table/tableConfig';
import { User } from '@/models/user';
import { IPaginationParams } from '@/type/api';
import { SearchInputParam } from '@/components/SearchInput/SearchInputParam';
import { SortSelectParam } from '@/components/Select/SortSelectParam';

export function UsersFilter(): React.JSX.Element {
  const { setConfirmSearch, confirmSearch } = useTableQueryParams();
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid size={4}>
          <SearchInputParam<IPaginationParams<User>>
            placeholder="Search user"
            value={confirmSearch}
            valueParams="search"
            onChange={(e) => setConfirmSearch(e.target.value)}
          />
        </Grid>
        <Grid size={4}>
          <SortSelectParam<IPaginationParams<User>> items={USER_FIELDS} />
        </Grid>
      </Grid>
    </Card>
  );
}
