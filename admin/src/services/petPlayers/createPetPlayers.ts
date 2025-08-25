import { PetPlayerCreateInfo } from '@/lib/schema/petPlayer/petPlayer';
import httpClient from '../httpService/httpServices';
import { CREATE_PET_PLAYERS } from '@/utils/config';

export const createPetPlayers = async (
  body: PetPlayerCreateInfo,
): Promise<boolean> => {
  try {
    const { map, sub_map, ...others } = body;
    const room_code = sub_map ? `${map}-${sub_map}` : `${map}`;
    const payload = {
      ...others,
      room_code,
    };
    const response = await httpClient.post(`${CREATE_PET_PLAYERS}`, payload);
    return response?.data?.success;
  } catch (error) {
    console.error('createPetPlayer', error);
    return false;
  }
};
