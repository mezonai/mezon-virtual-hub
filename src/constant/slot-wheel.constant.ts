import { FoodType, ItemCode, ItemType } from "@enum";

export const SLOT_TYPE_ORDER = {
  gold: 1,
  food: 2,
  plant: 3,
  item: 4,
  pet: 5,
};

export const ITEM_TYPE_ORDER: Record<ItemType, number> = {
  [ItemType.HAIR]: 1,
  [ItemType.HAT]: 2,
  [ItemType.FACE]: 3,
  [ItemType.EYES]: 4,
  [ItemType.UPPER]: 5,
  [ItemType.LOWER]: 6,
  [ItemType.GLASSES]: 7,
  [ItemType.PET_CARD]: 8,
  [ItemType.PET_FOOD]: 9,
  [ItemType.FARM_TOOL]: 10,
  [ItemType.PET_FRAGMENT]: 11,
};

export const PET_CARD_RARITY_ORDER: Partial<Record<ItemCode, number>> = {
  [ItemCode.RARITY_CARD_RARE]: 1,
  [ItemCode.RARITY_CARD_EPIC]: 2,
  [ItemCode.RARITY_CARD_LEGENDARY]: 3,
};

export const FOOD_TYPE_ORDER: Record<FoodType, number> = {
  [FoodType.NORMAL]: 1,
  [FoodType.PREMIUM]: 2,
  [FoodType.ULTRA_PREMIUM]: 3,
};
