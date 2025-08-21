import { create } from 'zustand';
import { PetPlayersStore } from './type';
import { PetPlayers } from '@/type/pet-players/petPlayers';
import {
  getPetPlayers,
  getPetPlayersParams,
} from '@/services/petPlayers/getPetPlayers';
import { IPaginationResponse } from '@/type/api';

export const usePetPlayersStore = create<PetPlayersStore>((set, get) => ({
  petPlayers: {} as IPaginationResponse<PetPlayers>,
  fetchPetPlayers: async (params: getPetPlayersParams) => {
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
