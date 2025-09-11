import { toast } from 'react-toastify';
import { ToastType } from '@/type/toast/toast';
import { Stack, Typography } from '@mui/material';
import React from 'react';
import {
  CheckFatIcon,
  WarningCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react';

interface ToastProps {
  type: ToastType;
  message?: string;
}

export const backgroundType = (type: ToastType) => {
  const map: Record<string, string> = {
    [ToastType.SUCCESS]: '#51a351',
    [ToastType.ERROR]: '#bd362f',
  };
  return map[type] ?? '';
};

export const showIcon = (type: ToastType) => {
  const mapIcon: Record<ToastType, React.ReactNode> = {
    [ToastType.SUCCESS]: (
      <CheckFatIcon width="24px" height="24px" fill="#fff" />
    ),
    [ToastType.ERROR]: <WarningIcon width="24px" height="24px" fill="#fff" />,
    [ToastType.WARNING]: (
      <WarningCircleIcon width="24px" height="24px" fill="#fff" />
    ),
  };
  return mapIcon[type] ?? null;
};

const ToastContent = ({
  type,
  message,
}: {
  type: ToastType;
  message?: string;
}) => {
  return (
    <Stack direction="row" display="flex" alignItems="center">
      {showIcon(type)}
      <Typography marginLeft="10px">{message}</Typography>
    </Stack>
  );
};

export const Toast = ({ type, message }: ToastProps) => {
  toast[type](<ToastContent type={type} message={message} />, {
    icon: false,
    style: {
      background: backgroundType(type),
      padding: '20px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: 500,
      marginTop: '10px',
    },
  });
};
