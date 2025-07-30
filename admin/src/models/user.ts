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

export interface MapEntity {
  name: string;
  map_key: MapKey;
  default_position_x: number;
  default_position_y: number;
  is_locked: boolean;
}

export interface User {
  id: string;
  created_at: Date;
  updated_at: Date;
  mezon_id: string | null;
  username: string;
  email: string;
  gold: number;
  diamond: number;
  gender: Gender;
  map: MapEntity;
  has_first_reward: boolean;
}
