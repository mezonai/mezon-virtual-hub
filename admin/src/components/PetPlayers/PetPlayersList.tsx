import { Button, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { PetPlayersTable } from './internal/PetPlayersTable';
import { PetPlayersFilter } from './internal/PetPlayersFilter';
import { usePetPlayersStore } from '@/store/petPlayers/store';
import { useModal } from '@/hooks/useModal';
import { PetPlayersFormModal } from './internal/PetPlayersFormModal';
import { ActionFormType } from '@/type/enum';
import { usePetPlayersDetailParam } from './hook/usePetPlayersDetailParam';
import { PlusIcon } from '@phosphor-icons/react';
import { PetPlayersFormConfirm } from './internal/PetPlayersFormConfirm';

export const PetPlayersList = (): React.JSX.Element => {
  const { fetchPetPlayersDetail } = usePetPlayersStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [actionType, setActionType] = useState<ActionFormType | null>(null);
  const { queryParamPetPlayerDetail } = usePetPlayersDetailParam();
  const {
    isOpenModal: isFormOpen,
    open: openForm,
    close: closeForm,
  } = useModal();
  const {
    isOpenModal: isConfirmOpen,
    open: openConfirm,
    close: closeConfirm,
  } = useModal();
  const [petPlayerIdDelete, setPetPlayerIdDelete] = useState<string>('');

  const fetchDataPetPlayerDetail = useCallback(async () => {
    if (!queryParamPetPlayerDetail.pet_player_id) return;
    setLoading(true);
    fetchPetPlayersDetail(queryParamPetPlayerDetail.pet_player_id).finally(() =>
      setLoading(false),
    );
  }, [queryParamPetPlayerDetail]);

  useEffect(() => {
    fetchDataPetPlayerDetail();
  }, [fetchDataPetPlayerDetail]);

  const [refetchTable, setRefetchTable] = useState<() => void>(() => () => {});

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Pet Players</Typography>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={() => {
              openForm?.();
              setActionType(ActionFormType.CREATE);
            }}
          >
            Add
          </Button>
        </div>
      </Stack>
      <PetPlayersFilter />
      <PetPlayersTable
        openFormModal={openForm}
        openFormConfirm={openConfirm}
        setActionForm={setActionType}
        setPetPlayerIdDelete={setPetPlayerIdDelete}
        setFetchDataApi={setRefetchTable}
        reloadPetPlayerDetail={fetchDataPetPlayerDetail}
      />
      <PetPlayersFormModal
        open={isFormOpen}
        action={actionType}
        closeFormModal={closeForm}
        loading={loading}
      />
      <PetPlayersFormConfirm
        open={isConfirmOpen}
        closeFormModal={closeConfirm}
        petPlayerIdDelete={petPlayerIdDelete}
        reloadPetPlayerList={refetchTable}
      />
    </Stack>
  );
};
