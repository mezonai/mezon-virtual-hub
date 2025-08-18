import { Box, styled } from '@mui/material';

interface SpinnerProps {
  variant?: 'absolute' | 'fixed';
}

const Loader = styled(Box)(() => ({
  width: '50px',
  aspectRatio: '1',
  display: 'grid',
  borderRadius: '50%',
  background: `
  linear-gradient(0deg ,rgb(255 255 255 / 50%) 30%, #0000 0 70%, rgb(255 255 255 / 100%) 0) 50%/8% 100%,
  linear-gradient(90deg, rgb(255 255 255 / 25%) 30%, #0000 0 70%, rgb(255 255 255 / 75%) 0) 50%/100% 8%
`,
  backgroundRepeat: 'no-repeat',
  animation: 'l23 1s infinite steps(12)',

  '&::before, &::after': {
    content: '""',
    gridArea: '1/1',
    borderRadius: '50%',
    background: 'inherit',
  },

  '&::before': {
    opacity: 0.915,
    transform: 'rotate(30deg)',
  },

  '&::after': {
    opacity: 0.83,
    transform: 'rotate(60deg)',
  },

  '@keyframes l23': {
    '100%': {
      transform: 'rotate(1turn)',
    },
  },
}));

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
      <Loader />
    </Box>
  );
};
