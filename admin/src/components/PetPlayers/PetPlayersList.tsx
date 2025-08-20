import { Stack, Typography } from '@mui/material';
import React from 'react';
import { PetPlayersTable } from './internal/PetPlayersTable';
import { PetPlayersFilter } from './internal/PetPlayersFilter';
import { usePetPlayerList } from './hooks/usePetPlayersList';

export const PetPlayersList = (): React.JSX.Element => {
  const { loading, totalItem, petPlayersData } = usePetPlayerList();

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Pet Players</Typography>
      <PetPlayersFilter />
      <PetPlayersTable
        loading={loading}
        rows={petPlayersData}
        count={totalItem}
      />
    </Stack>
  );
};
