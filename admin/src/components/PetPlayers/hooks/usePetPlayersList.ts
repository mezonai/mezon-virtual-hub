import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { usePetPlayersStore } from '@/store/petPlayers/store';
import { useEffect, useRef, useState } from 'react';

export const usePetPlayerList = () => {
  const { petPlayers, fetchPetPlayers } = usePetPlayersStore();
  const { queryParam } = useTableQueryParams();
  const firstCallRef = useRef<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const totalItem = petPlayers.total;
  const totalPage = petPlayers.total_page;
  const petPlayersData = petPlayers.result;

  useEffect(() => {
    if (firstCallRef.current) {
      firstCallRef.current = false;
      return;
    }
    setLoading(true);
    fetchPetPlayers(queryParam).finally(() => setLoading(false));
  }, [queryParam]);

  return {
    loading,
    totalItem,
    totalPage,
    petPlayersData,
  };
};
