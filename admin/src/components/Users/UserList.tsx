import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useModal } from '@/hooks/useModal';
import { useState } from 'react';
import { User } from '@/models/user';
import { ActionFormType } from '@/type/enum';
import { UsersFilter } from './internal/UsersFilter';
import { UsersTable } from './internal/UsersTable';
import { UserFormModal } from './internal/UserFormModal';

export function UserList(): React.JSX.Element {
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
      <UsersFilter />
      <UsersTable
        setSelectedUser={setSelectedUser}
        openFormModal={open}
        setActionForm={setActionType}
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
