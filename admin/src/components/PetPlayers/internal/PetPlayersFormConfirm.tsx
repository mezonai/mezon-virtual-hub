import { ModalConfirm } from '@/components/modals';
import { deletePetPlayers } from '@/services/petPlayers/deletePetPlayers';
import { Toast } from '@/components/Toast';
import { ToastType } from '@/type/toast/toast';

interface PetPlayersFormConfirmProps {
  open: boolean;
  closeFormModal: () => void;
  petPlayerIdDelete?: string;
  reloadPetPlayerList?: () => void;
}

export const PetPlayersFormConfirm = ({
  open,
  closeFormModal,
  petPlayerIdDelete,
  reloadPetPlayerList,
}: PetPlayersFormConfirmProps) => {
  const handleCloseConfirmModal = () => {
    closeFormModal?.();
  };

  const handleDeletePetPlayer = async () => {
    if (petPlayerIdDelete) {
      const success = await deletePetPlayers(petPlayerIdDelete);
      if (success) {
        closeFormModal?.();
        if (reloadPetPlayerList) reloadPetPlayerList();
        Toast({
          message: 'Delete Pet Player Successfully',
          type: ToastType.SUCCESS,
        });
      } else {
        Toast({
          message: 'Delete Pet Player Fail ',
          type: ToastType.ERROR,
        });
      }
    }
  };

  return (
    <ModalConfirm
      open={open}
      onClose={handleCloseConfirmModal}
      title={`Delete Pet Players: 'Pet player id ${petPlayerIdDelete}' ?`}
      onAction={handleDeletePetPlayer}
    />
  );
};
