import { AnimalRarity } from '@enum';

export const MAX_EQUIPPED_PETS_FOR_BATTLE = 3;

export const BASE_EXP_MAP: Record<AnimalRarity, number> = {
  [AnimalRarity.COMMON]: 20,
  [AnimalRarity.RARE]: 40,
  [AnimalRarity.EPIC]: 60,
  [AnimalRarity.LEGENDARY]: 80,
};

export const STAR_BONUS: Record<number, number> = {
  1: 1.0,
  2: 1.15,
  3: 1.35,
};
