import { UserInfo } from '../../lib/schema/user/user';
import { UPDATE_USER } from '../../utils/config';
import httpClient from '../httpService/httpServices';

export const updateUser = async (body: UserInfo): Promise<boolean> => {
  try {
    const user_id = body.id;
    const mezon_id = body.mezon_id;
    const gold = body.gold;
    const diamond = body.diamond;
    const has_first_reward = body.has_first_reward;
    const role = body.role;
    const position_x = body.position_x;
    const position_y = body.position_y;
    const display_name = body.display_name;
    const gender = body.gender;
    const response = await httpClient.put(`${UPDATE_USER}/${user_id}`, {
      mezon_id,
      gold,
      diamond,
      has_first_reward,
      role,
      position_x,
      position_y,
      display_name,
      gender,
    });
    return response?.data?.success ?? false;
  } catch (error) {
    console.error('updateUser', error);
    return false;
  }
};
