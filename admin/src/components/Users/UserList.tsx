import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { UsersFilter } from './internal/UsersFilter';
import { UsersTable } from './internal/UsersTable';
import { useUserList } from './hooks/useUserList';

export function UserList(): React.JSX.Element {
  const {
    users,
    page,
    limit: rowsPerPage,
    totalPages,
    sortBy,
    order,
    search,
    setPage,
    setLimit,
    setSearch,
    setSortBy,
    setOrder,
    setConfirmSearch
  } = useUserList();

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Users</Typography>       
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
      <UsersFilter
        sortBy={sortBy}
        search={search}
        order={order}
        setSearch={setSearch}
        setSortBy={setSortBy}
        setOrder={setOrder}
        setConfirmSearch={setConfirmSearch}
      />
      <UsersTable
        count={totalPages}
        page={page}
        rows={users}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setLimit={setLimit}
      />
    </Stack>
  );
}
