import { getPetPlayersParams } from '@/services/petPlayers/getPetPlayers';
import { IPaginationResponse } from '@/type/api';
import { PetPlayers } from '@/type/pet-players/petPlayers';

export interface PetPlayersStore {
  petPlayers: IPaginationResponse<PetPlayers>;
  fetchPetPlayers: (params: getPetPlayersParams) => Promise<void>;
}
