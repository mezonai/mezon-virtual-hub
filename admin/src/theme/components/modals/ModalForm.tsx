import { Box, Button, Modal, ModalProps, Typography } from '@mui/material';
import React from 'react';

interface ModalFormProps extends Pick<ModalProps, 'open'> {
  title?: string;
  children?: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onClose?: () => void;
  onSubmit?: () => void;
}

export const ModalForm = ({
  title,
  children,
  open,
  onClose,
  onSubmit,
  submitLabel,
  cancelLabel,
}: ModalFormProps) => {
  const handleCancel = () => {
    onClose?.();
  };
  return (
    <Modal keepMounted open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto',
          width: '1035px',
          maxHeight: '100%',
          maxWidth: '80vw',
          borderRadius: '10px',
        }}
      >
        <Typography variant="h3" gutterBottom>
          {title}
        </Typography>
        {children}
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleCancel} variant="outlined">
            {cancelLabel}
          </Button>
          <Button type="submit" variant="contained">
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
