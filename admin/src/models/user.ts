export enum MapKey {
  HN1 = 'hn1',
  HN2 = 'hn2',
  HN3 = 'hn3',
  VINH = 'vinh',
  DN = 'dn',
  QN = 'qn',
  SG = 'sg',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NOT_SPECIFIED = 'not specified',
}

export enum Role{
  ADMIN,
  USER,
}

export enum SortOrder{
  ASC = 'ASC',
  DESC = 'DESC'
}

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
  role: number
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
