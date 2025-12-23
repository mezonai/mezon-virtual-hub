export const GAME_CONFIG_KEYS = {
  FARM: 'farm.config',
} as const;

export type GameConfigKey =
  (typeof GAME_CONFIG_KEYS)[keyof typeof GAME_CONFIG_KEYS];
