import { Stack, Typography } from '@mui/material';
import React from 'react';
import { PetPlayersTable } from './internal/PetPlayersTable';
import { PetPlayersFilter } from './internal/PetPlayersFilter';

export const PetPlayersList = (): React.JSX.Element => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Pet Players</Typography>
      <PetPlayersFilter />
      <PetPlayersTable />
    </Stack>
  );
};
