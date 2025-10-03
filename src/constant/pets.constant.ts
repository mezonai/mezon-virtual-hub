import { AnimalRarity, ItemCode } from '@enum';

export const MAX_EQUIPPED_PETS_FOR_BATTLE = 3;

export const BASE_EXP_MAP: Record<AnimalRarity, number> = {
  [AnimalRarity.COMMON]: 20,
  [AnimalRarity.RARE]: 40,
  [AnimalRarity.EPIC]: 60,
  [AnimalRarity.LEGENDARY]: 80,
};

export const STAR_MULTIPLIER: Record<number, number> = {
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

const RARITY_TIER_BONUS: Record<AnimalRarity, number> = {
  common: 0,
  rare: 0.15,
  epic: 0.35,
  legendary: 0.6,
};

export const RARITY_MULTIPLIER: Record<AnimalRarity, number> = {
  common: 1.0 + RARITY_TIER_BONUS['common'],
  rare: STAR_MULTIPLIER[3] + RARITY_TIER_BONUS['rare'], // > 1.35, so rare1★ > common3★
  epic: STAR_MULTIPLIER[3] + RARITY_TIER_BONUS['epic'], // > rare3★
  legendary: STAR_MULTIPLIER[3] + RARITY_TIER_BONUS['legendary'], // > epic3★
};
// Dynamically calculate the base multiplier for each rarity (1★)
export const RARITY_BASE: Record<AnimalRarity, number> = {} as any;

RARITY_ORDER.forEach((rarity, index) => {
  if (index === 0) {
    // Common starts at 1.0
    RARITY_BASE[rarity] = 1.0;
  } else {
    const prevRarity = RARITY_ORDER[index - 1];
    // Previous rarity max 3★
    const prevMax3Star = RARITY_BASE[prevRarity] * STAR_MULTIPLIER[3];
    // Current rarity 1★ = previous 3★ + tier bonus
    RARITY_BASE[rarity] = prevMax3Star + RARITY_TIER_BONUS[rarity];
  }
});

export const RARITY_CARD_REQUIREMENTS: Record<AnimalRarity, ItemCode | null> = {
  [AnimalRarity.COMMON]: null,
  [AnimalRarity.RARE]: ItemCode.RARITY_CARD_RARE,
  [AnimalRarity.EPIC]: ItemCode.RARITY_CARD_EPIC,
  [AnimalRarity.LEGENDARY]: ItemCode.RARITY_CARD_LEGENDARY,
};

export const UPGRADE_PET_RATES: Record<AnimalRarity, number> = {
  [AnimalRarity.COMMON]: 100,
  [AnimalRarity.RARE]: 80,
  [AnimalRarity.EPIC]: 60,
  [AnimalRarity.LEGENDARY]: 40,
};

export const MERGE_PET_DIAMOND_COST = 10000;
