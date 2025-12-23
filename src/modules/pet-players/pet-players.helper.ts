import { AnimalRarity } from "@enum";

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const TARGET_BY_RARITY: Record<AnimalRarity, number> = {
  [AnimalRarity.COMMON]: 6,
  [AnimalRarity.RARE]: 3,
  [AnimalRarity.EPIC]: 1,
  [AnimalRarity.LEGENDARY]: 0,
};