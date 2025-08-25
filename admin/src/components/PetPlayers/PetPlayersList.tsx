import { Button, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { PetPlayersTable } from './internal/PetPlayersTable';
import { PetPlayersFilter } from './internal/PetPlayersFilter';
import { usePetPlayersStore } from '@/store/petPlayers/store';
import { useModal } from '@/hooks/useModal';
import { PetPlayersFormModal } from './internal/PetPlayersFormModal';
import { ActionFormType } from '@/type/enum';
import { usePetPlayersDetailParam } from './hook/usePetPlayersDetailParam';
import { PlusIcon } from '@phosphor-icons/react';

export const PetPlayersList = (): React.JSX.Element => {
  const { fetchPetPlayersDetail } = usePetPlayersStore();
  const [loading, setLoading] = useState<boolean>(false);
  const { isOpenModal, open, close } = useModal();
  const [actionType, setActionType] = useState<ActionFormType | null>(null);
  const { queryParamPetPlayerDetail } = usePetPlayersDetailParam();

  useEffect(() => {
    if (!queryParamPetPlayerDetail.pet_player_id) return;
    setLoading(true);
    fetchPetPlayersDetail(queryParamPetPlayerDetail.pet_player_id).finally(() =>
      setLoading(false),
    );
  }, [queryParamPetPlayerDetail]);

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
              open?.();
              setActionType(ActionFormType.CREATE);
            }}
          >
            Add
          </Button>
        </div>
      </Stack>
      <PetPlayersFilter />
      <PetPlayersTable openFormModal={open} setActionForm={setActionType} />
      <PetPlayersFormModal
        open={isOpenModal}
        action={actionType}
        closeFormModal={close}
        loading={loading}
      />
    </Stack>
  );
};
