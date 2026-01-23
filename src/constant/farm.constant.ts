import { InventoryClanType, ItemCode } from "@enum";

export const CLAN_WAREHOUSE = {
  ITEM_TYPE: {
    SEED: false,
    HARVESTED: true,
  },
  QUANTITY: {
    USE_ONE_SEED: -1,
    ADD_ONE_SEED: 1,
    ADD_ONE_HARVEST: 1,
  },
};

type ClanItemCode =
  | ItemCode.HARVEST_TOOL_1
  | ItemCode.HARVEST_TOOL_2
  | ItemCode.HARVEST_TOOL_3
  | ItemCode.HARVEST_TOOL_4
  | ItemCode.HARVEST_TOOL_5
  | ItemCode.GROWTH_PLANT_TOOL_1
  | ItemCode.GROWTH_PLANT_TOOL_2
  | ItemCode.GROWTH_PLANT_TOOL_3
  | ItemCode.GROWTH_PLANT_TOOL_4
  | ItemCode.GROWTH_PLANT_TOOL_5
  | ItemCode.INTERRUPT_HARVEST_TOOL_1
  | ItemCode.INTERRUPT_HARVEST_TOOL_2
  | ItemCode.INTERRUPT_HARVEST_TOOL_3
  | ItemCode.INTERRUPT_HARVEST_TOOL_4
  | ItemCode.INTERRUPT_HARVEST_TOOL_5

export const ITEM_CODE_TO_INVENTORY_TYPE: Record<ClanItemCode, InventoryClanType> = {
  [ItemCode.HARVEST_TOOL_1]: InventoryClanType.HARVEST_TOOL_1,
  [ItemCode.HARVEST_TOOL_2]: InventoryClanType.HARVEST_TOOL_2,
  [ItemCode.HARVEST_TOOL_3]: InventoryClanType.HARVEST_TOOL_3,
  [ItemCode.HARVEST_TOOL_4]: InventoryClanType.HARVEST_TOOL_4,
  [ItemCode.HARVEST_TOOL_5]: InventoryClanType.HARVEST_TOOL_5,

  [ItemCode.GROWTH_PLANT_TOOL_1]: InventoryClanType.GROWTH_PLANT_TOOL_1,
  [ItemCode.GROWTH_PLANT_TOOL_2]: InventoryClanType.GROWTH_PLANT_TOOL_2,
  [ItemCode.GROWTH_PLANT_TOOL_3]: InventoryClanType.GROWTH_PLANT_TOOL_3,
  [ItemCode.GROWTH_PLANT_TOOL_4]: InventoryClanType.GROWTH_PLANT_TOOL_4,
  [ItemCode.GROWTH_PLANT_TOOL_5]: InventoryClanType.GROWTH_PLANT_TOOL_5,

  [ItemCode.INTERRUPT_HARVEST_TOOL_1]: InventoryClanType.INTERRUPT_HARVEST_TOOL_1,
  [ItemCode.INTERRUPT_HARVEST_TOOL_2]: InventoryClanType.INTERRUPT_HARVEST_TOOL_2,
  [ItemCode.INTERRUPT_HARVEST_TOOL_3]: InventoryClanType.INTERRUPT_HARVEST_TOOL_3,
  [ItemCode.INTERRUPT_HARVEST_TOOL_4]: InventoryClanType.INTERRUPT_HARVEST_TOOL_4,
  [ItemCode.INTERRUPT_HARVEST_TOOL_5]: InventoryClanType.INTERRUPT_HARVEST_TOOL_5,
}

export const TOOL_RATE_MAP: Partial<Record<string, number>> = {
  // Harvest
  'harvest_tool_1': 0.1,
  'harvest_tool_2': 0.2,
  'harvest_tool_3': 0.3,
  'harvest_tool_4': 0.4,
  'harvest_tool_5': 0.5,

  // Growth plant
  'growth_plant_tool_1': 0.1,
  'growth_plant_tool_2': 0.2,
  'growth_plant_tool_3': 0.3,
  'growth_plant_tool_4': 0.4,
  'growth_plant_tool_5': 0.5,

  // Interrupt harvest
  'interrupt_harvest_tool_1': 0.1,
  'interrupt_harvest_tool_2': 0.2,
  'interrupt_harvest_tool_3': 0.3,
  'interrupt_harvest_tool_4': 0.4,
  'interrupt_harvest_tool_5': 0.5,
};

export const FARM_CONFIG = {
  HARVEST: {
    ENABLE_LIMIT: false,
    UNLIMITED: -1,
    DELAY_MS: 10000,
    INTERRUPT_RATE: 0.2,
    MAX_HARVEST: 100,
    MAX_INTERRUPT: 100,
    RESET_HARVEST_HOURS: 24,
    FORMULA: {
      MIN_MULTIPLIER: 0.6, // hệ số tối thiểu khi không chăm cây
      CARE_FACTOR: 0.4, // hệ số cộng thêm theo tỉ lệ chăm sóc
      WATER_WEIGHT: 0.5, // tỉ trọng nước trong careRatio
      BUG_WEIGHT: 0.5, // tỉ trọng bọ trong careRatio
      MY_CLAN: 2, // hệ số thu hoạch clan của bản thân
      OTHER_CLAN: 1, // hệ số thu hoạch clan của người khác
      DEFAULT_FACTOR: 1, // hệ số thu hoạch clan của người khác
    },
  },
  PLANT: {
    ENABLE_LIMIT: false,
    UNLIMITED: -1,
    MAX_HARVEST: 100,
    RESET_PLANT_HOURS: 24,
    get DEATH_MS() {
      return this.RESET_PLANT_HOURS * 60 * 60 * 1000; // convert giờ -> ms
    },
    FORMULA: {
      growTimeSeconds: (grow_time_minutes: number) => grow_time_minutes * 60,
      harvestPoint: (grow_time_minutes: number) =>
        Math.round(grow_time_minutes * 1.5),
      buyPrice: (grow_time_minutes: number) =>
        Math.round(grow_time_minutes * 2),
      isDead: (plantedAt: number, now: number) =>
        now - plantedAt >= FARM_CONFIG.PLANT.DEATH_MS, // kiểm tra cây đã chết chưa
    },
  },
  FARM: {
    DEFAULT_SLOT_COUNT: 60, // ✅ số lượng ô đất mặc định
  }
};
