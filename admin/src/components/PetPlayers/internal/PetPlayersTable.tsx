import { AbstractTable } from '@/components/Table';
import { PET_PLAYERS_TABLE_CONFIG } from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationParams } from '@/type/api';
import { PetPlayers } from '@/type/pet-players/petPlayers';
import { Card } from '@mui/material';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';

interface PetPlayersTableProps {
  loading?: boolean;
  rows?: PetPlayers[];
  count?: number;
}
export const PetPlayersTable = ({
  count = 0,
  loading,
  rows = [],
}: PetPlayersTableProps): React.JSX.Element => {
  const { page, limit, handleParamsChange } = useTableQueryParams();
  return (
    <Card>
      <AbstractTable<PetPlayers, IPaginationParams<PetPlayers>>
        columns={PET_PLAYERS_TABLE_CONFIG}
        rows={rows}
        count={count}
        loading={loading}
        page={page}
        rowsPerPage={limit}
        onParamsChange={handleParamsChange}
        actionBtn={[
          {
            color: 'success',
            icon: <PencilIcon width="20px" height="20px" />,
          },
          {
            color: 'error',
            icon: <TrashIcon width="20px" height="20px" />,
          },
        ]}
      />
    </Card>
  );
};
