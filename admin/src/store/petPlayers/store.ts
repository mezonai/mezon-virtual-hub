import { create } from 'zustand';
import { PetPlayersStore } from './type';
import { PetPlayers } from '@/type/pet-players/petPlayers';
import { getPetPlayers } from '@/services/petPlayers/getPetPlayers';
import { IPaginationResponse } from '@/type/api';
import { IQueryParams } from '@/hooks/useTableQueryParams';

export const usePetPlayersStore = create<PetPlayersStore>((set, get) => ({
  petPlayers: {} as IPaginationResponse<PetPlayers>,
  fetchPetPlayers: async (params: IQueryParams) => {
    if (get().petPlayers) {
      const petPlayers = await getPetPlayers(params);
      if (petPlayers) {
        return set({ petPlayers });
      } else {
        return set({});
      }
    }
  },
}));
