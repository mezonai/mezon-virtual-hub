import { create } from 'zustand';
import { PetPlayersStore } from './type';
import { PetPlayers, PetPlayersDetail } from '@/type/pet-players/petPlayers';
import { getPetPlayers } from '@/services/petPlayers/getPetPlayers';
import { IPaginationResponse } from '@/type/api';
import { IQueryParams } from '@/hooks/useTableQueryParams';
import { getPetPlayersDetail } from '@/services/petPlayers/getPetPlayerDetail';

export const usePetPlayersStore = create<PetPlayersStore>((set, get) => ({
  petPlayers: {} as IPaginationResponse<PetPlayers>,
  petPlayersDetail: {} as PetPlayersDetail,
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
  fetchPetPlayersDetail: async (pet_player_id: string) => {
    if (get().petPlayersDetail) {
      const petPlayersDetail = await getPetPlayersDetail(pet_player_id);
      if (petPlayersDetail) {
        return set({ petPlayersDetail });
      } else {
        return set({});
      }
    }
  },
}));
