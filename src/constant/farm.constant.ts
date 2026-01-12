import { InventoryClanType } from "@enum";

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

export const TOOL_RATE_MAP: Partial<Record<InventoryClanType, number>> = {
  // Harvest
  [InventoryClanType.HARVEST_TOOL_1]: 0.1,
  [InventoryClanType.HARVEST_TOOL_2]: 0.2,
  [InventoryClanType.HARVEST_TOOL_3]: 0.3,
  [InventoryClanType.HARVEST_TOOL_4]: 0.4,
  [InventoryClanType.HARVEST_TOOL_5]: 0.5,

  // Growth plant
  [InventoryClanType.GROWTH_PLANT_TOOL_1]: 0.1,
  [InventoryClanType.GROWTH_PLANT_TOOL_2]: 0.2,
  [InventoryClanType.GROWTH_PLANT_TOOL_3]: 0.3,
  [InventoryClanType.GROWTH_PLANT_TOOL_4]: 0.4,
  [InventoryClanType.GROWTH_PLANT_TOOL_5]: 0.5,

  // Interrupt harvest
  [InventoryClanType.INTERRUPT_HARVEST_TOOL_1]: 0.1,
  [InventoryClanType.INTERRUPT_HARVEST_TOOL_2]: 0.2,
  [InventoryClanType.INTERRUPT_HARVEST_TOOL_3]: 0.3,
  [InventoryClanType.INTERRUPT_HARVEST_TOOL_4]: 0.4,
  [InventoryClanType.INTERRUPT_HARVEST_TOOL_5]: 0.5,
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
