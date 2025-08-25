import { IQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationResponse } from '@/type/api';
import { PetPlayers, PetPlayersDetail } from '@/type/pet-players/petPlayers';

export interface PetPlayersStore {
  petPlayers: IPaginationResponse<PetPlayers>;
  fetchPetPlayers: (params: IQueryParams) => Promise<void>;
  petPlayersDetail: PetPlayersDetail;
  fetchPetPlayersDetail: (pet_player_id: string) => Promise<void>;
}
