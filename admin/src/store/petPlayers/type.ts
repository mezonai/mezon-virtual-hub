import { IQueryParams } from '@/hooks/useTableQueryParams';
import { IPaginationResponse } from '@/type/api';
import { PetPlayers } from '@/type/pet-players/petPlayers';

export interface PetPlayersStore {
  petPlayers: IPaginationResponse<PetPlayers>;
  fetchPetPlayers: (params: IQueryParams) => Promise<void>;
}
