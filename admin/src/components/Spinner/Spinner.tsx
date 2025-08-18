import { Box, CircularProgress } from '@mui/material';

export const Spinner = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress
        size={60}
        color="secondary"
        disableShrink
        thickness={5}
      />
    </Box>
  );
};
