import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { PetPlayersFilterParams } from '@/type/pet-players/petPlayers';
import { useEffect, useState } from 'react';

export const usePetPlayersFilter = () => {
  const [confirmSearchSpecies, setConfirmSearchSpecies] = useState<string>('');

  const { queryParam } = useTableQueryParams<PetPlayersFilterParams>();

  useEffect(() => {
    setConfirmSearchSpecies(queryParam.species ?? '');
  }, [setConfirmSearchSpecies, queryParam.species]);

  return {
    confirmSearchSpecies,
    setConfirmSearchSpecies,
  };
};
