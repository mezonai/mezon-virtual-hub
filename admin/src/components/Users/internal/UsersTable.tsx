import Card from '@mui/material/Card';
import React from 'react';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { ActionFormType } from '@/type/enum';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { AbstractTable } from '@/components/Table/AbstractTable';
import { IPaginationParams } from '@/type/api';
import { USER_TABLE_CONFIG } from '@/constant/table/tableConfig';
import { User } from '@/models/user';

interface UsersTableProps {
  count?: number;
  rows?: User[];
  loading?: boolean;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  setActionForm: (action: ActionFormType) => void;
  openFormModal: () => void;
}

export function UsersTable({
  count = 0,
  rows = [],
  loading,
  setSelectedUser,
  openFormModal,
  setActionForm,
}: UsersTableProps): React.JSX.Element {
  const { handleParamsChange, page, limit } = useTableQueryParams();
  return (
    <Card>
      <AbstractTable<User, IPaginationParams<User>>
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
        rowsPerPage={limit}
        onParamsChange={handleParamsChange}
        loading={loading}
      />
    </Card>
  );
}
