import { PetPlayers } from '@/type/pet-players/petPlayers';
import httpClient from '../httpService/httpServices';
import { GET_PET_PLAYERS } from '@/utils/config';
import { IPaginationResponse } from '@/type/api';
import { IQueryParams } from '@/hooks/useTableQueryParams';

export const getPetPlayers = async (
  params: IQueryParams,
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
