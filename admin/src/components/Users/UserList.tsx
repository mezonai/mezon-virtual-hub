import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { CustomersFilters } from './internal/UsersFilter';
import { UsersTable } from './internal/UsersTable';
import { User, Gender, MapKey } from '../../models/user';

const users: User[] = [
  {
    id: '1',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz001',
    username: 'alice',
    email: 'alice@example.com',
    gold: 1500,
    diamond: 20,
    gender: Gender.FEMALE,
    map: {
      name: 'Hanoi Zone 1',
      map_key: MapKey.HN1,
      default_position_x: 100,
      default_position_y: 200,
      is_locked: false,
    },
    has_first_reward: true,
  },
  {
    id: '2',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz002',
    username: 'bob',
    email: 'bob@example.com',
    gold: 2000,
    diamond: 10,
    gender: Gender.MALE,
    map: {
      name: 'Danang',
      map_key: MapKey.DN,
      default_position_x: 300,
      default_position_y: 400,
      is_locked: false,
    },
    has_first_reward: false,
  },
  {
    id: '3',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz003',
    username: 'charlie',
    email: 'charlie@example.com',
    gold: 1200,
    diamond: 5,
    gender: Gender.NOT_SPECIFIED,
    map: {
      name: 'Quang Ninh',
      map_key: MapKey.QN,
      default_position_x: 50,
      default_position_y: 75,
      is_locked: false,
    },
    has_first_reward: true,
  },
  {
    id: '4',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz004',
    username: 'diana',
    email: 'diana@example.com',
    gold: 1700,
    diamond: 0,
    gender: Gender.FEMALE,
    map: {
      name: 'Vinh',
      map_key: MapKey.VINH,
      default_position_x: 120,
      default_position_y: 300,
      is_locked: false,
    },
    has_first_reward: false,
  },
  {
    id: '5',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz005',
    username: 'edward',
    email: 'edward@example.com',
    gold: 900,
    diamond: 2,
    gender: Gender.MALE,
    map: {
      name: 'Saigon',
      map_key: MapKey.SG,
      default_position_x: 500,
      default_position_y: 100,
      is_locked: true,
    },
    has_first_reward: false,
  },
  {
    id: '6',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz006',
    username: 'fiona',
    email: 'fiona@example.com',
    gold: 1300,
    diamond: 15,
    gender: Gender.FEMALE,
    map: {
      name: 'Hanoi Zone 2',
      map_key: MapKey.HN2,
      default_position_x: 90,
      default_position_y: 180,
      is_locked: false,
    },
    has_first_reward: true,
  },
  {
    id: '7',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz007',
    username: 'george',
    email: 'george@example.com',
    gold: 800,
    diamond: 3,
    gender: Gender.MALE,
    map: {
      name: 'Hanoi Zone 3',
      map_key: MapKey.HN3,
      default_position_x: 60,
      default_position_y: 60,
      is_locked: false,
    },
    has_first_reward: false,
  },
  {
    id: '8',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz008',
    username: 'hannah',
    email: 'hannah@example.com',
    gold: 1900,
    diamond: 25,
    gender: Gender.FEMALE,
    map: {
      name: 'Danang',
      map_key: MapKey.DN,
      default_position_x: 310,
      default_position_y: 410,
      is_locked: true,
    },
    has_first_reward: true,
  },
  {
    id: '9',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz009',
    username: 'ian',
    email: 'ian@example.com',
    gold: 1600,
    diamond: 9,
    gender: Gender.NOT_SPECIFIED,
    map: {
      name: 'Quang Ninh',
      map_key: MapKey.QN,
      default_position_x: 65,
      default_position_y: 80,
      is_locked: false,
    },
    has_first_reward: false,
  },
  {
    id: '10',
    created_at: new Date(),
    updated_at: new Date(),
    mezon_id: 'mz010',
    username: 'julia',
    email: 'julia@example.com',
    gold: 2200,
    diamond: 12,
    gender: Gender.FEMALE,
    map: {
      name: 'Hanoi Zone 1',
      map_key: MapKey.HN1,
      default_position_x: 110,
      default_position_y: 210,
      is_locked: true,
    },
    has_first_reward: true,
  },
];

export function UserList(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;

  const paginatedCustomers = applyPagination(users, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Customers</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
            >
              Import
            </Button>
            <Button
              color="inherit"
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
            >
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
            Add
          </Button>
        </div>
      </Stack>
      <CustomersFilters />
      <UsersTable
        count={paginatedCustomers.length}
        page={page}
        rows={paginatedCustomers}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(
  rows: User[],
  page: number,
  rowsPerPage: number,
): User[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
