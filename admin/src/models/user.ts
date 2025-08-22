import { Gender, Role } from '@/type/enum';

export interface User {
  id: string;
  mezon_id: string;
  username: string;
  email: string;
  display_name: string;
  gold: number;
  diamond: number;
  gender: Gender;
  has_first_reward: boolean;
  created_at: string;
  updated_at: string;
  map: MapData;
  role: Role;
}

export interface MapData {
  id: string;
  name: string;
  map_key: string;
  default_position_x: number;
  default_position_y: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}
