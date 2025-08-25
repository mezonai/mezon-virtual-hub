import { PetPlayerCreateInfo } from '@/lib/schema/petPlayer/petPlayer';
import httpClient from '../httpService/httpServices';
import { CREATE_PET_PLAYERS } from '@/utils/config';

export const createPetPlayers = async (
  body: PetPlayerCreateInfo,
): Promise<boolean> => {
  try {
    const response = await httpClient.post(`${CREATE_PET_PLAYERS}`, body);
    return response?.data?.success;
  } catch (error) {
    console.error('createPetPlayer', error);
    return false;
  }
};
