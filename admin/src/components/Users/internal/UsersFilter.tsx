import * as React from 'react';
import Card from '@mui/material/Card';
import { Grid } from '@mui/material';
import { User } from '../../../models/user';
import { SortOrder } from '../../../types/user';
import { userParams } from '../../../types/user/user';
import { SearchInput } from '../../../theme/components/SearchInput/SearchInput';
import { SortSelect } from '../../../theme/components/Select/SortSelect';
import { USER_FIELDS } from '../../../constant/table/tableConfig';

interface UsersFilterProps {
  sortBy: string;
  search: string;
  order: SortOrder;
  confirmSearch: string;
  onParamsChange: (params: Partial<userParams>) => void;
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
        <SearchInput<userParams>
          placeholder="Search user"
          value={confirmSearch}
          onChangeSearch={setConfirmSearch}
          onParamsChange={onParamsChange}
        />
        <SortSelect<userParams, User>
          sortBy={sortBy}
          order={order}
          onParamsChange={onParamsChange}
          items={USER_FIELDS}
        />
      </Grid>
    </Card>
  );
}
