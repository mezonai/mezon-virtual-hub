import { UPDATE_PET_PLAYERS } from '@/utils/config';
import httpClient from '../httpService/httpServices';
import { PetPlayerUpdateInfo } from '@/lib/schema/petPlayer/petPlayer';

export const updatePetPlayers = async (
  body: PetPlayerUpdateInfo,
): Promise<boolean> => {
  try {
    const {
      map,
      sub_map,
      skill_slot_1,
      skill_slot_2,
      skill_slot_3,
      skill_slot_4,
      id,
      type,
      rarity,
      species,
      ...rest
    } = body;
    const room_code = `${map}-${sub_map}`;
    const payload = {
      ...rest,
      room_code,
    };

    const res = await httpClient.put(
      `${UPDATE_PET_PLAYERS}/${body.id}`,
      payload,
    );
    return res?.data?.success;
  } catch (err) {
    return false;
  }
};
