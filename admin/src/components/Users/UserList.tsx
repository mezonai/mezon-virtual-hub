import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UsersFilter } from './internal/UsersFilter';
import { UsersTable } from './internal/UsersTable';
import { useUserList } from './hooks/useUserList';
import { UserFormModal } from './internal/UserFormModal';
import { User } from '@/models/user';
import { useState } from 'react';
import { ActionFormType } from '@/type/enum/user';
import { useModal } from '@/hooks/useModal';

export function UserList(): React.JSX.Element {
  const {
    users,
    page,
    limit: rowsPerPage,
    totalItems,
    sortBy,
    order,
    search,
    loading,
    confirmSearch,
    setConfirmSearch,
    handleParamsChange,
  } = useUserList();

  const { isOpenModal, open, close } = useModal();

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [actionType, setActionType] = useState<ActionFormType | null>(null);

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
        confirmSearch={confirmSearch}
        setConfirmSearch={setConfirmSearch}
        onParamsChange={handleParamsChange}
      />
      <UsersTable
        count={totalItems}
        page={page}
        rows={users}
        rowsPerPage={rowsPerPage}
        setSelectedUser={setSelectedUser}
        openFormModal={open}
        setActionForm={setActionType}
        onParamsChange={handleParamsChange}
        loading={loading}
      />
      <UserFormModal
        open={isOpenModal}
        selectedUser={selectedUser}
        action={actionType}
        closeFormModal={close}
      />
    </Stack>
  );
}
