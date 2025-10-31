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

export const FARM_CONFIG = {
  HARVEST: {
    DELAY_MS: 10000,
  },
  PLANT: {
    MAX_HARVEST: 10, 
    DEATH_HOURS: 24,
    get DEATH_MS() {
      return this.DEATH_HOURS * 60 * 60 * 1000; // convert giờ -> ms
    },
  },
};
