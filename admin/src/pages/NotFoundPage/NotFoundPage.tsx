import React from 'react';
import NotFound from '@/components/NotFound/NotFound';
import { Box } from '@mui/material';

export const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        paddingTop: 6,
        justifyContent: 'center',
      }}
    >
      <NotFound />
    </Box>
  );
};
