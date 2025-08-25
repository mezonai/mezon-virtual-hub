import { AbstractTable } from '@/components/Table';
import { PET_PLAYERS_TABLE_CONFIG } from '@/constant/table/tableConfig';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationParams } from '@/type/api';
import {
  PetPlayers,
  PetPlayersFilterParams,
} from '@/type/pet-players/petPlayers';
import { Card } from '@mui/material';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useTableList } from '@/hooks/useTableList';
import { usePetPlayersStore } from '@/store/petPlayers/store';
import { ActionFormType } from '@/type/enum';
import { usePetPlayersDetailParam } from '../hook/usePetPlayersDetailParam';

interface PetPlayersTableProps {
  openFormModal: () => void;
  setActionForm: (action: ActionFormType) => void;
}

export const PetPlayersTable = ({
  openFormModal,
  setActionForm,
}: PetPlayersTableProps): React.JSX.Element => {
  const { page, limit, handleParamsChange } = useTableQueryParams();
  const { petPlayers, fetchPetPlayers } = usePetPlayersStore();
  const { loading, totalItem, responseData } = useTableList<
    PetPlayers,
    PetPlayersFilterParams
  >({
    fetchData: fetchPetPlayers,
    storeData: petPlayers,
    excludeParam: 'pet_player_id',
  });
  const { handleParamPetPlayerDetail } = usePetPlayersDetailParam();
  return (
    <Card>
      <AbstractTable<PetPlayers, IPaginationParams<PetPlayers>>
        columns={PET_PLAYERS_TABLE_CONFIG}
        rows={responseData}
        count={totalItem}
        loading={loading}
        page={page}
        rowsPerPage={limit}
        onParamsChange={handleParamsChange}
        actionBtn={[
          {
            onClick: (row) => {
              handleParamPetPlayerDetail({ pet_player_id: row.id });
              openFormModal?.();
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
      />
    </Card>
  );
};
