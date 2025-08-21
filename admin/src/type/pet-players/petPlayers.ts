export enum SkillCode {
  GROWWL = 'NOR01',
  PROTECT = 'NOR02',
  REST = 'NOR03',
  CONFUSION = 'NOR04',
  CUT = 'NOR05',
  POUND = 'NOR06',
  DOUBLE_KICK = 'NOR07',
  BITE = 'NOR08',
  CRUSH_CLAW = 'NOR09',
  WING_ATTACK = 'NOR10',
  FLY = 'NOR11',
  FURY_PUNCH = 'NOR12',
  EARTHQUAKE = 'GRASS01',
  RAZOR_LEAF = 'GRASS01',
  WHIP_WIRE = 'GRASS03',
  ABSORB = 'GRASS02',
  THUNDERBOLT = 'ELECTRIC01',
  THUNDER_WAVE = 'ELECTRIC02',
  ELECTRO_BALL = 'ELECTRIC03',
  WATER_GUN = 'WATER01',
  BUBBLE = 'WATER02',
  AQUA_CUTTER = 'WATER03',
  EMBER = 'FIRE01',
  FIRE_BLAST = 'FIRE02',
  OVERHEAT = 'FIRE03',
  ICE_BALL = 'ICE01',
  ICICLE_CRASH = 'ICE02',
  ICE_FANG = 'ICE03',
  DRAGON_CLAW = 'DRAGON01',
  ATTACK = 'ATTACK01',
}

export enum PetType {
  NORMAL = 'normal',
  FIRE = 'fire',
  ICE = 'ice',
  WATER = 'water',
  ELECTRIC = 'electric',
  GRASS = 'grass',
  DRAGON = 'dragon',
}

export enum AnimalRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface PetsDto {
  id: string;
  species: string;
  type: PetType;
  rarity: AnimalRarity;
}

export interface UserDto {
  id: string;
  username: string;
}

export interface PetPlayers {
  id: string;
  name: string | null;
  level: number;
  stars: number;
  is_caught: boolean;
  equipped_skill_codes: (SkillCode | null)[];
  user: UserDto | null;
  pet: PetsDto;
  created_at: string;
}

export interface PetPlayersFilterParams {
  rarity: string;
  pet_type: string;
  species: string;
  is_caught: boolean;
}
