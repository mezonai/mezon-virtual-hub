import { PetPlayersDetail } from '@/type/pet-players/petPlayers';
import httpClient from '../httpService/httpServices';
import { GET_PET_PLAYERS_DETAIL } from '@/utils/config';

export const getPetPlayersDetail = async (
  pet_player_id: string,
): Promise<PetPlayersDetail | null> => {
  try {
    const response = await httpClient.get(
      `${GET_PET_PLAYERS_DETAIL}/${pet_player_id}`,
    );
    return response?.data?.data ?? null;
  } catch (err) {
    console.error('getPetPlayersDetail', err);
    return null;
  }
};
