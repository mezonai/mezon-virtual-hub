import Card from '@mui/material/Card';
import { User } from '../../../models/user';
import React from 'react';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { ActionFormType } from '../../../types/user';
import { userParams } from '../../../types/user/user';
import { Spinner } from '../../../theme/components/Spinner/Spinner';
import { formatDate } from '../../../utils/fortmat/formateDate';
import { AbstractTable } from '../../../theme/components/Table/AbstractTable';

interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
  loading?: boolean;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  setActionForm: (action: ActionFormType) => void;
  openFormModal: () => void;
  onParamsChange: (params: Partial<userParams>) => void;
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
      <AbstractTable<User, userParams>
        columns={[
          {
            key: 'mezon_id',
            headerName: 'Mezon ID',
          },
          {
            key: 'username',
            headerName: 'Username',
          },
          {
            key: 'email',
            headerName: 'Email',
          },
          {
            key: 'gender',
            headerName: 'Gender',
          },
          {
            key: 'map',
            headerName: 'Map',
            render: (row) => row?.map?.name ?? '-',
          },
          {
            key: 'display_name',
            headerName: 'Display name',
          },
          {
            key: 'gold',
            headerName: 'Gold',
          },
          {
            key: 'diamond',
            headerName: 'Diamond',
          },
          {
            key: 'created_at',
            headerName: 'Created At',
            render: (row) => formatDate({ date: row.created_at }),
          },
          {
            key: 'action',
            headerName: 'Action',
          },
        ]}
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
