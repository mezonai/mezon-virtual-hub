import { Box, Button, Modal, ModalProps, Typography } from '@mui/material';
import { WarningIcon } from '@phosphor-icons/react';

interface ModalConfirmProps extends Pick<ModalProps, 'open'> {
  title?: string;
  onClose?: () => void;
  onAction?: () => void;
}

export const ModalConfirm = ({
  title,
  open,
  onClose,
  onAction,
}: ModalConfirmProps) => {
  return (
    <Modal keepMounted open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto',
          width: '680px',
          maxHeight: '100%',
          maxWidth: '80vw',
          borderRadius: '10px',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <WarningIcon width="60px" height="60px" fill="rgb(248,193,134)" />
        </Box>
        <Typography
          sx={{
            fontSize: '30px',
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          Are you sure?
        </Typography>
        <Typography
          sx={{
            fontSize: '18px',
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>
        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" onClick={() => onClose?.()}>
            Cancel
          </Button>
          <Button onClick={onAction} variant="outlined" type="button">
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
