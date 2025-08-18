import { Box, CircularProgress } from '@mui/material';

interface SpinnerProps {
  variant?: 'absolute' | 'fixed';
}

export const Spinner = ({ variant = 'fixed' }: SpinnerProps) => {
  return (
    <Box
      sx={{
        position: variant,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <CircularProgress size={50} />
    </Box>
  );
};
