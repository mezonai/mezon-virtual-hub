import { UPDATE_PET_PLAYERS } from '@/utils/config';
import httpClient from '../httpService/httpServices';
import { PetPlayerUpdateInfo } from '@/lib/schema/petPlayer/petPlayer';

export const updatePetPlayers = async (
  body: PetPlayerUpdateInfo,
  pet_player_id: string,
): Promise<boolean> => {
  try {
    const res = await httpClient.put(
      `${UPDATE_PET_PLAYERS}/${pet_player_id}`,
      body,
    );
    return res?.data?.success;
  } catch (err) {
    return false;
  }
};
