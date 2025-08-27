import { DELETE_PET_PLAYERS } from '@/utils/config';
import httpClient from '../httpService/httpServices';

export const deletePetPlayers = async (
  pet_players_id: string,
): Promise<boolean> => {
  try {
    const response = await httpClient.delete(
      `${DELETE_PET_PLAYERS}/${pet_players_id}`,
    );
    return response?.data?.success ?? false;
  } catch (err) {
    console.error('deletePetPlayers', err);
    return false;
  }
};
