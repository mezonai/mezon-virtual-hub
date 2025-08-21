import { PetPlayers } from '@/type/pet-players/petPlayers';
import httpClient from '../httpService/httpServices';
import { GET_PET_PLAYERS } from '@/utils/config';
import { IPaginationResponse } from '@/type/api';

export interface getPetPlayersParams {
  search: string;
  page: number;
  limit: number;
  sort_by: string;
  order: string;
}

export const getPetPlayers = async (
  params: getPetPlayersParams,
): Promise<IPaginationResponse<PetPlayers> | null> => {
  try {
    const response = await httpClient.get(`${GET_PET_PLAYERS}`, {
      params: params,
    });
    return response?.data?.data ?? [];
  } catch (err) {
    console.error('getPetPlayers', err);
    return null;
  }
};
