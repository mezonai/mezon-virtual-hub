import Card from '@mui/material/Card';
import { User } from '@/models/user';
import React from 'react';
import { PencilIcon, Spinner, TrashIcon } from '@phosphor-icons/react';
import { ActionFormType } from '@/type/enum/user';
import { UserParams } from '@/type/user/user';
import { USER_TABLE_CONFIG } from '@/constant/table/tableConfig';
import { AbstractTable } from '@/components/Table';

interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
  loading?: boolean;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  setActionForm: (action: ActionFormType) => void;
  openFormModal: () => void;
  onParamsChange: (params: Partial<UserParams>) => void;
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  loading,
  onParamsChange,
  setSelectedUser,
  openFormModal,
  setActionForm,
}: UsersTableProps): React.JSX.Element {
  if (loading) return <Spinner />;
  return (
    <Card>
      <AbstractTable<User, UserParams>
        columns={USER_TABLE_CONFIG}
        actionBtn={[
          {
            onClick: (row) => {
              openFormModal?.();
              setSelectedUser(row);
              setActionForm(ActionFormType.EDIT);
            },
            color: 'success',
            icon: <PencilIcon width="20px" height="20px" />,
          },
          {
            color: 'error',
            icon: <TrashIcon width="20px" height="20px" />,
          },
        ]}
        rows={rows}
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onParamsChange={onParamsChange}
      />
    </Card>
  );
}
