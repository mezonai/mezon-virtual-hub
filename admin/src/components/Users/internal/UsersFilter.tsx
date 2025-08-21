import { SearchInputParam } from '@/components/SearchInput/SearchInputParam';
import { SortSelectParam } from '@/components/Select/SortSelectParam';
import { USER_FIELDS } from '@/constant/table/tableConfig';
import { User } from '@/models/user';
import { IPaginationParams } from '@/type/api';
import { Grid } from '@mui/material';
import Card from '@mui/material/Card';

export function UsersFilter(): React.JSX.Element {
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid size={4}>
          <SearchInputParam<IPaginationParams<User>>
            placeholder="Search user"
            valueParams="search"
          />
        </Grid>
        <Grid size={4}>
          <SortSelectParam<IPaginationParams<User>> items={USER_FIELDS} />
        </Grid>
      </Grid>
    </Card>
  );
}
