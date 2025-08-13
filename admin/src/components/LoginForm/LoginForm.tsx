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
    const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URL}&scope=${SCOPE}&state=${STATE}`;
    window.location.href = authUrl;
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
