import { useCallback, useState } from 'react';

export const useModal = (defaultValue = false) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(defaultValue);

  const open = useCallback(() => {
    setIsOpenModal(true);
  }, []);

  const close = useCallback(() => {
    setIsOpenModal(false);
  }, []);

  return {
    isOpenModal,
    open,
    close,
  };
};
