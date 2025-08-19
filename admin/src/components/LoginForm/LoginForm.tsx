import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { getRedirectOauth2 } from '@/services/auth/getRedirectOauth2';
import { getRedirectUrl } from '@/utils/url/getRedirectUrl';

export const LoginForm: React.FC = () => {
  const handleClickLoginWithMezon = async () => {
    const redirectUrl = getRedirectUrl();
    const res = await getRedirectOauth2(redirectUrl);
    if (res) {
      window.location.href = res.data;
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h5" align="center">
          Mezon-virtual-hub
        </Typography>
        <Button
          onClick={handleClickLoginWithMezon}
          variant="contained"
          fullWidth
        >
          Login with Mezon
        </Button>
      </Stack>
    </Box>
  );
};
