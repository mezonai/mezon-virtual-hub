import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Select, MenuItem, Grid } from '@mui/material';
import { User } from '../../../models/user';
import { SortOrder } from '../../../types/user';
import { userParams } from '../../../types/user/user';

interface UsersFilterProps {
  sortBy: keyof User;
  search: string;
  order: SortOrder;
  confirmSearch: string;
  onParamsChange: (params: Partial<userParams>) => void;
  setConfirmSearch: React.Dispatch<React.SetStateAction<string>>;
}

const userFieldChange: Record<string, string> = {
  id: 'ID',
  mezon_id: 'Mezon ID',
  username: 'Username',
  email: 'Email',
  display_name: 'Display Name',
  gold: 'Gold',
  diamond: 'Diamond',
  gender: 'Gender',
  has_first_reward: 'Has First Reward',
  created_at: 'Created At',
  updated_at: 'Updated At',
} as const;

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
        <OutlinedInput
          value={confirmSearch}
          fullWidth
          placeholder="Search user"
          onChange={(event) => {
            setConfirmSearch(event.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onParamsChange({ search: confirmSearch });
            }
          }}
          startAdornment={
            <InputAdornment position="start">
              <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
            </InputAdornment>
          }
          sx={{ maxWidth: '500px' }}
        />
        <Select
          value={sortBy}
          onChange={(e) => {
            onParamsChange({ sort_by: e.target.value });
          }}
          displayEmpty
          sx={{ minWidth: 120 }}
        >
          {Object.entries(userFieldChange).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={order}
          onChange={(e) => {
            onParamsChange({ order: e.target.value });
          }}
          displayEmpty
          sx={{ minWidth: 120 }}
        >
          {Object.entries(SortOrder).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </Card>
  );
}
