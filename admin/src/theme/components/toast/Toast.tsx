import { toast } from 'react-toastify';
import { ToastType } from '../../../types/toast/toast';
import { Stack, Typography } from '@mui/material';

interface ToastProps {
  type: ToastType;
  icon?: React.ReactNode;
  message?: string;
}

export const backgroundType = (type: ToastType) => {
  const map: Record<string, string> = {
    [ToastType.SUCCESS]: '#51a351',
    [ToastType.ERROR]: '#bd362f',
  };
  return map[type] ?? '';
};

export const Toast = ({ type, icon, message }: ToastProps) => {
  toast[type](
    <Stack direction="row" display="flex" alignItems="center">
      {icon}
      <Typography marginLeft="10px">{message}</Typography>
    </Stack>,
    {
      icon: false,
      style: {
        background: backgroundType(type),
        padding: '15px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 500,
      },
    },
  );
};
