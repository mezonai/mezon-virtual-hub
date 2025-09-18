import { AnimalRarity, ItemCode } from '@enum';

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

export const RARITY_ORDER = [
  AnimalRarity.COMMON,
  AnimalRarity.RARE,
  AnimalRarity.EPIC,
  AnimalRarity.LEGENDARY,
];

export const RARITY_CARD_REQUIREMENTS: Record<AnimalRarity, ItemCode | null> = {
  [AnimalRarity.COMMON]: null,
  [AnimalRarity.RARE]: ItemCode.RARITY_CARD_RARE,
  [AnimalRarity.EPIC]: ItemCode.RARITY_CARD_EPIC,
  [AnimalRarity.LEGENDARY]: ItemCode.RARITY_CARD_LEGENDARY,
};

export const RARITY_UPGRADE_RATES: Record<AnimalRarity, number> = {
  [AnimalRarity.COMMON]: 1.0, // 100%
  [AnimalRarity.RARE]: 0.8, // 80%
  [AnimalRarity.EPIC]: 0.6, // 60%
  [AnimalRarity.LEGENDARY]: 0.4, // 40%
};
