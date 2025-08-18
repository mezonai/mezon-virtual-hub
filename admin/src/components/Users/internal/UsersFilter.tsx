import Card from '@mui/material/Card';
import { Grid } from '@mui/material';
import { User } from '@/models/user';
import { SortOrder } from '@/type/enum/user';
import { UserParams } from '@/type/user/user';
import { USER_FIELDS } from '@/constant/table/tableConfig';
import { SearchInput } from '@/components/SearchInput';
import { SortSelect } from '@/components/Select';

interface UsersFilterProps {
  sortBy: string;
  search: string;
  order: SortOrder;
  confirmSearch: string;
  onParamsChange: (params: Partial<UserParams>) => void;
  setConfirmSearch: React.Dispatch<React.SetStateAction<string>>;
}

export function UsersFilter({
  sortBy,
  order,
  onParamsChange,
  confirmSearch,
  setConfirmSearch,
}: UsersFilterProps): React.JSX.Element {
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={4}>
        <SearchInput<UserParams>
          placeholder="Search user"
          value={confirmSearch}
          onChangeSearch={setConfirmSearch}
          onParamsChange={onParamsChange}
        />
        <SortSelect<UserParams, User>
          sortBy={sortBy}
          order={order}
          onParamsChange={onParamsChange}
          items={USER_FIELDS}
        />
      </Grid>
    </Card>
  );
}
