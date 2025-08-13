import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import {
  CLIENT_ID,
  OAUTH_URL,
  REDIRECT_URL,
  RESPONSE_TYPE,
  SCOPE,
  STATE,
} from '../../utils/config';
import { Toast } from '../../theme/components/Toast/Toast';
import { ToastType } from '../../types/toast/toast';
import { WarningCircleIcon } from '@phosphor-icons/react';

type LoginFormData = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleClickLoginWithMezon = () => {
    if (CLIENT_ID) {
      const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URL}&scope=${SCOPE}&state=${STATE}`;
      window.location.href = authUrl;
    } else {
      Toast({
        type: ToastType.ERROR,
        message: 'Cannot login with Mezon because client_id not found',
        icon: <WarningCircleIcon width="24px" height="24px" fill="#fff" />,
      });
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
