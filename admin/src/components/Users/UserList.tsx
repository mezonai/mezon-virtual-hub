import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UsersFilter } from './internal/UsersFilter';
import { UsersTable } from './internal/UsersTable';
import { useUserList } from './hooks/useUserList';
import { UserFormModal } from './internal/UserFormModal';

export function UserList(): React.JSX.Element {
  const {
    users,
    page,
    limit: rowsPerPage,
    totalPages,
    sortBy,
    order,
    search,
    openFormModal,
    selectedUser,
    actionType,
    setActionType,
    setSelectedUser,
    setOpenFormModal,
    setPage,
    setLimit,
    setSearch,
    setSortBy,
    setOrder,
    setConfirmSearch,
  } = useUserList();
  const handleClose = () => {
    setOpenFormModal(false);
  };
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
        setSelectedUser={setSelectedUser}
        setPage={setPage}
        setLimit={setLimit}
        setOpenFormModal={setOpenFormModal}
        setActionForm={setActionType}
      />
      <UserFormModal
        open={openFormModal}
        onClose={handleClose}
        selectedUser={selectedUser}
        action={actionType}
      />
    </Stack>
  );
}
