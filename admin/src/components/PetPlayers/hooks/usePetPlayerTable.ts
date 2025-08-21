import { usePetPlayerList } from './usePetPlayersList';

export const usePetPlayerTable = () => {
  const { loading, totalItem, petPlayersData } = usePetPlayerList();

  return {
    loading,
    totalItem,
    petPlayersData,
  };
};
