import React from 'react';
import { Box, Paper, Container } from '@mui/material';
import { LoginForm } from '../../components/LoginForm';
import { useLogin } from '../../components/LoginForm/hooks/useLogin';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useLogin({
    onError: (err) => {
      console.warn('Login failed:', err);
    },
  });

  const handleLogin = (data: { email: string; password: string }) => {
    login(data);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4 }}>
          <LoginForm onSubmit={handleLogin} />
        </Paper>
      </Container>
    </Box>
  );
};
