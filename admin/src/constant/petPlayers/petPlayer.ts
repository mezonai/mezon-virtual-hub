import { MapKey } from '@/type/enum';
import { SkillCode, SubMap } from '@/type/pet-players/petPlayers';

export const MAP_KEY_FIELD: Record<MapKey, string> = {
  [MapKey.HN1]: 'HN1',
  [MapKey.HN2]: 'HN2',
  [MapKey.HN3]: 'HN3',
  [MapKey.VINH]: 'Vinh',
  [MapKey.DN]: 'DN',
  [MapKey.QN]: 'QN',
  [MapKey.SG]: 'SG',
} as const;

export const SUB_MAP_FIELD: Record<SubMap, string> = {
  [SubMap.OFFICE]: 'Office',
  [SubMap.OFFICE_MEETING_ROOM1]: 'Office Meeting Room1',
  [SubMap.SHOP1]: 'Shop1',
} as const;

export const SKILL_CODE_FIELD: Record<SkillCode, string> = {
  [SkillCode.GROWWL]: 'NOR01',
  [SkillCode.PROTECT]: 'NOR02',
  [SkillCode.REST]: 'NOR03',
  [SkillCode.CONFUSION]: 'NOR04',
  [SkillCode.CUT]: 'NOR05',
  [SkillCode.POUND]: 'NOR06',
  [SkillCode.DOUBLE_KICK]: 'NOR07',
  [SkillCode.BITE]: 'NOR08',
  [SkillCode.CRUSH_CLAW]: 'NOR09',
  [SkillCode.WING_ATTACK]: 'NOR10',
  [SkillCode.FLY]: 'NOR11',
  [SkillCode.FURY_PUNCH]: 'NOR12',
  [SkillCode.EARTHQUAKE]: 'GRASS01',
  [SkillCode.WHIP_WIRE]: 'GRASS03',
  [SkillCode.ABSORB]: 'GRASS02',
  [SkillCode.THUNDERBOLT]: 'ELECTRIC01',
  [SkillCode.THUNDER_WAVE]: 'ELECTRIC02',
  [SkillCode.ELECTRO_BALL]: 'ELECTRIC03',
  [SkillCode.WATER_GUN]: 'WATER01',
  [SkillCode.BUBBLE]: 'WATER02',
  [SkillCode.AQUA_CUTTER]: 'WATER03',
  [SkillCode.EMBER]: 'FIRE01',
  [SkillCode.FIRE_BLAST]: 'FIRE02',
  [SkillCode.OVERHEAT]: 'FIRE03',
  [SkillCode.ICE_BALL]: 'ICE01',
  [SkillCode.ICICLE_CRASH]: 'ICE02',
  [SkillCode.ICE_FANG]: 'ICE03',
  [SkillCode.DRAGON_CLAW]: 'DRAGON01',
  [SkillCode.ATTACK]: 'ATTACK01',
} as const;
