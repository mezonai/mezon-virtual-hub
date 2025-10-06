import { STAR_MULTIPLIER, RARITY_BASE } from '@constant';
import { AnimalRarity } from '@enum';

export const getExpForNextLevel = (level: number): number => {
  return Math.pow(level + 1, 3) - Math.pow(level, 3);
};

export const getRarityUpgradeMultiplier = (
  baseRarity: AnimalRarity,
  currentRarity: AnimalRarity,
  stars: number,
) => {
  const baseStarMultiplier = STAR_MULTIPLIER[stars] ?? 1.0;
  const baseMultiplier = RARITY_BASE[baseRarity] * baseStarMultiplier;
  const currentMultiplier = RARITY_BASE[currentRarity] * baseStarMultiplier;
  return currentMultiplier / baseMultiplier;
};
