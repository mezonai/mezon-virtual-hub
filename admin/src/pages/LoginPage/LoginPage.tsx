import React from 'react';
import { Box, Paper, Container, styled } from '@mui/material';
import { LoginForm } from '../../components/LoginForm';

export const LoginBox = styled(Box)(() => ({
  width: '100%',
  height: '100vh',
  backgroundImage: `url('https://images.pexels.com/photos/176851/pexels-photo-176851.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: '0.4s linear',
}));

export const LoginPage: React.FC = () => {
  return (
    <LoginBox
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4 }}>
          <LoginForm />
        </Paper>
      </Container>
    </LoginBox>
  );
};
