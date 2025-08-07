import { useCallback, useState } from 'react';

export const useUserModalForm = (defaultValue = false) => {
  const [openModalForm, setOpenModalForm] = useState<boolean>(defaultValue);

  const open = useCallback(() => {
    setOpenModalForm(true);
  }, []);

  const close = useCallback(() => {
    setOpenModalForm(false);
  }, []);

  return {
    openModalForm,
    open,
    close,
  };
};
