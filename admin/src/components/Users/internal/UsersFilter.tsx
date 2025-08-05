import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Select, MenuItem, Grid } from '@mui/material';
import { User } from '../../../models/user';

interface UsersFilterProps {
  sortBy: keyof User;
  search: string;
  order: 'ASC' | 'DESC';
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setSortBy: React.Dispatch<React.SetStateAction<keyof User>>;
  setOrder: React.Dispatch<React.SetStateAction<'ASC' | 'DESC'>>;
  setConfirmSearch: React.Dispatch<React.SetStateAction<string>>
}

const userFieldOptions = [
  'id',
  'mezon_id',
  'username',
  'email',
  'display_name',
  'gold',
  'diamond',
  'gender',
  'has_first_reward',
  'created_at',
  'updated_at',
] as const;

const userFieldChange: Record<string, string> = {
  'id': 'ID',
  'mezon_id': 'Mezon ID',
  'username': 'Username',
  'email': 'Email',
  'display_name': 'Display Name',
  'gold': 'Gold',
  'diamond': 'Diamond',
  'gender': 'Gender',
  'has_first_reward': 'Has First Reward',
  'created_at': 'Created At',
  'updated_at': 'Updated At'
} as const

export function UsersFilter({
  search,
  sortBy,
  order,
  setSearch,
  setSortBy,
  setOrder,
  setConfirmSearch
}: UsersFilterProps): React.JSX.Element {

  const handleSearchKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setConfirmSearch(search)
    }
  }
  
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={4}>
        <OutlinedInput
          value={search}
          fullWidth
          placeholder="Search customer"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          onKeyDown={handleSearchKeyDown}
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
            setSortBy(e.target.value);
          }}
          displayEmpty
          sx={{ minWidth: 120 }}
        >
          {userFieldOptions.map((field) => (
            <MenuItem key={field} value={field}>
              {userFieldChange[field] ?? field}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
          }}
          displayEmpty
          sx={{ minWidth: 120 }}
        >
          {['ASC', 'DESC'].map((field) => (
            <MenuItem key={field} value={field}>
              {field}
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </Card>
  );
}
