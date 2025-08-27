import { UPDATE_PET_PLAYERS } from '@/utils/config';
import httpClient from '../httpService/httpServices';
import { PetPlayerUpdateInfo } from '@/lib/schema/petPlayer/petPlayer';

type UpdatePetPlayerPayload = Omit<PetPlayerUpdateInfo, 'map' | 'sub_map'> & {
  room_code: string;
};

export const updatePetPlayer = async (
  body: PetPlayerUpdateInfo,
): Promise<boolean> => {
  try {
    const { map, sub_map, id, ...rest } = body;
    const payload: UpdatePetPlayerPayload = {
      ...rest,
      room_code: sub_map ? `${map}-${sub_map}` : map,
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
