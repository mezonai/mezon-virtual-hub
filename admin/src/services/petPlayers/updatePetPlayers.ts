import { UPDATE_PET_PLAYERS } from '@/utils/config';
import httpClient from '../httpService/httpServices';
import { PetPlayerUpdateInfo } from '@/lib/schema/petPlayer/petPlayer';

export const updatePetPlayers = async (
  body: PetPlayerUpdateInfo,
): Promise<boolean> => {
  try {
    const res = await httpClient.put(`${UPDATE_PET_PLAYERS}/${body.id}`, body);
    return res?.data?.success;
  } catch (err) {
    return false;
  }
};
