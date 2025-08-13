import { styled } from '@mui/system';
import { LoginBox } from '../../pages/LoginPage';
import { Box, keyframes } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { paths } from '../../utils/paths';
import { useAuth } from '../../hooks/useAuth';
import { Toast } from '../../theme/components/Toast/Toast';
import { ToastType } from '../../types/toast/toast';
import { CheckFatIcon } from '@phosphor-icons/react';

const keyframe = keyframes`
  0%   {clip-path: polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)}
  25%  {clip-path: polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
  50%  {clip-path: polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
  75%  {clip-path: polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)}
  100% {clip-path: polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0)}
`;

const Loader = styled(Box)(() => ({
  width: '60px',
  aspectRatio: '1',
  border: '15px solid #ddd',
  borderRadius: '50%',
  transform: 'rolate(45deg)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-15px',
    borderRadius: '50%',
    border: '15px solid #514b82',
    animation: `${keyframe} 2s infinite linear`,
  },
}));

export const Callback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { handleLogin } = useAuth();
  const callRef = useRef(false);
  useEffect(() => {
    if (callRef.current) return;
    callRef.current = true;
    const state = params.get('state');
    const code = params.get('code');
    if (!state && !code) {
      navigate(paths.auth.login);
    }
    const doLogin = async () => {
      const success = await handleLogin(code, state);
      if (success) {
        navigate('/dashboard');
        Toast({
          message: 'Login Successfully!',
          type: ToastType.SUCCESS,
          icon: <CheckFatIcon width="24px" height="24px" fill="#fff" />,
        });
      } else {
        navigate(paths.auth.login);
      }
    };
    doLogin();
  }, [navigate]);
  return (
    <LoginBox
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 99999,
        }}
      >
        <Loader />
      </Box>
    </LoginBox>
  );
};
