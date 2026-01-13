export enum MapKey {
  HN1 = 'hn1',
  HN2 = 'hn2',
  HN3 = 'hn3',
  VINH = 'vinh',
  DN = 'dn',
  QN = 'qn',
  SG = 'sg',
}

export enum SubMap {
  OFFICE = 'office',
  OFFICE_MEETING_ROOM1 = 'office-meeting-room1',
  SHOP1 = 'shop1',
}

export enum ItemType {
  HAIR = 'hair',
  HAT = 'hat',
  FACE = 'face',
  EYES = 'eyes',
  UPPER = 'upper',
  LOWER = 'lower',
  GLASSES = 'glasses',
  PET_CARD = 'pet_card',
  PET_FOOD = 'pet_food',
  FARM_TOOL = 'farm_tool',
}

export enum ItemTypeCloth {
  Hair = 1,
  Hat = 2,
  Face = 3,
  Eyes = 4,
  Upper = 5,
  Lower = 6,
  Glasses = 7,
  UpgradeCard = 8,

}

export enum ItemCode {
  RARITY_CARD_RARE = 'rarity_card_rare',
  RARITY_CARD_EPIC = 'rarity_card_epic',
  RARITY_CARD_LEGENDARY = 'rarity_card_legendary',
  HARVEST_TOOL_1 = 'harvest_tool_1',
  HARVEST_TOOL_2 = 'harvest_tool_2',
  HARVEST_TOOL_3 = 'harvest_tool_3',
  HARVEST_TOOL_4 = 'harvest_tool_4',
  HARVEST_TOOL_5 = 'harvest_tool_5',
  GROWTH_PLANT_TOOL_1 = 'growth_plant_tool_1',
  GROWTH_PLANT_TOOL_2 = 'growth_plant_tool_2',
  GROWTH_PLANT_TOOL_3 = 'growth_plant_tool_3',
  GROWTH_PLANT_TOOL_4 = 'growth_plant_tool_4',
  GROWTH_PLANT_TOOL_5 = 'growth_plant_tool_5',
  INTERRUPT_HARVEST_TOOL_1 = 'interrupt_harvest_tool_1',
  INTERRUPT_HARVEST_TOOL_2 = 'interrupt_harvest_tool_2',
  INTERRUPT_HARVEST_TOOL_3 = 'interrupt_harvest_tool_3',
  INTERRUPT_HARVEST_TOOL_4 = 'interrupt_harvest_tool_4',
  INTERRUPT_HARVEST_TOOL_5 = 'interrupt_harvest_tool_5',
  // Cosmetic items ....
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NOT_SPECIFIED = 'not specified',
}

export enum ActionKey {
  RPS = 1,
  Punch = 2,
  SendCoin = 3,
  CatchUser = 4,
  Battle = 5,
}

export enum FoodType {
  NORMAL = 'normal',
  PREMIUM = 'premium',
  ULTRA_PREMIUM = 'ultra-premium',
}

export enum PurchaseMethod {
  GOLD = 'gold',
  DIAMOND = 'diamond',
  SLOT = 'slot',
}

export enum InventoryType {
  ITEM = 'item',
  FOOD = 'food',
}

export enum InventoryClanType {
  PLANT = 'plant',

  HARVEST_TOOL_1 = 'harvest_tool_1',
  HARVEST_TOOL_2 = 'harvest_tool_2',
  HARVEST_TOOL_3 = 'harvest_tool_3',
  HARVEST_TOOL_4 = 'harvest_tool_4',
  HARVEST_TOOL_5 = 'harvest_tool_5',

  GROWTH_PLANT_TOOL_1 = 'growth_plant_tool_1',
  GROWTH_PLANT_TOOL_2 = 'growth_plant_tool_2',
  GROWTH_PLANT_TOOL_3 = 'growth_plant_tool_3',
  GROWTH_PLANT_TOOL_4 = 'growth_plant_tool_4',
  GROWTH_PLANT_TOOL_5 = 'growth_plant_tool_5',

  INTERRUPT_HARVEST_TOOL_1 = 'interrupt_harvest_tool_1',
  INTERRUPT_HARVEST_TOOL_2 = 'interrupt_harvest_tool_2',
  INTERRUPT_HARVEST_TOOL_3 = 'interrupt_harvest_tool_3',
  INTERRUPT_HARVEST_TOOL_4 = 'interrupt_harvest_tool_4',
  INTERRUPT_HARVEST_TOOL_5 = 'interrupt_harvest_tool_5',
  
  LOCK_PLANT_TOOL = 'lock_plant_tool',
  LOCK_PICK_TOOL = 'lock_pick_tool',
}

export enum AnimalRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum PetType {
  NORMAL = 'normal',
  FIRE = 'fire',
  ICE = 'ice',
  WATER = 'water',
  ELECTRIC = 'electric',
  GRASS = 'grass',
  DRAGON = 'dragon',
}

export enum SkillType {
  ATTACK = 'attack',
  DEFENSE = 'defense',
  DECREASE_ATTACK = 'decrease_attack',
  INCREASE_ATTACK = 'increase_attack',
  HEAL = 'heal',
}

export enum SkillCode {
  GROWL = 'NOR01',
  PROTECT = 'NOR02',
  REST = 'NOR03',
  CONFUSION = 'NOR04',
  CUT = 'NOR05',
  POUND = 'NOR06',
  DOUBLE_KICK = 'NOR07',
  BITE = 'NOR08',
  CRUSH_CLAW = 'NOR09',
  WING_ATTACK = 'NOR10',
  FLY = 'NOR11',
  FURY_PUNCH = 'NOR12',
  EARTHQUAKE = 'GRASS01',
  RAZOR_LEAF = 'GRASS01',
  WHIP_WIRE = 'GRASS03',
  ABSORB = 'GRASS02',
  THUNDERBOLT = 'ELECTRIC01',
  THUNDER_WAVE = 'ELECTRIC02',
  ELECTRO_BALL = 'ELECTRIC03',
  WATER_GUN = 'WATER01',
  BUBBLE = 'WATER02',
  AQUA_CUTTER = 'WATER03',
  EMBER = 'FIRE01',
  FIRE_BLAST = 'FIRE02',
  OVERHEAT = 'FIRE03',
  ICE_BALL = 'ICE01',
  ICICLE_CRASH = 'ICE02',
  ICE_FANG = 'ICE03',
  DRAGON_CLAW = 'DRAGON01',
  ATTACK = 'ATTACK01',
}

export enum EviromentType {
  ICE = 'ice',
  WATER = 'water',
  GRASS = 'grass',
}

export enum Role {
  USER,
  ADMIN,
}

export enum TransactionType {
  BUY = 'buy',
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
}

export enum TransactionCurrency {
  TOKEN = 'token',
  GOLD = 'gold',
  DIAMOND = 'diamond',
}

export enum QuestType {
  NEWBIE_LOGIN = 'newbie_login',
  NEWBIE_LOGIN_SPECIAL = 'newbie_login_special',
  EVENT_LOGIN_PLANT = 'event_login_plant',
  EVENT_LOGIN_PET = 'event_login_pet',
  EVENT_LOGIN_CLAN = 'event_login_clan',
  VISIT_OFFICE = 'visit_office',
  SPIN_LUCKY_WHEEL = 'spin_lucky_wheel',
  BUY_FOOD = 'buy_food',
  CATCH_PETS = 'catch_pet',
  PLAY_RPS = 'play_rps',
  PET_BATTLE = 'pet_battle',
  LOGIN_DAYS = 'login_days',
}

export enum EventType {
  LOGIN_REWARD = 'login_reward',
  LOGIN_REWARD_SPECIAL = 'login_reward_special',
}


export enum RewardType {
  EVENT_LOGIN_DAY_1 = 'event_login_day_1',
  EVENT_LOGIN_DAY_2 = 'event_login_day_2',
  EVENT_LOGIN_DAY_3 = 'event_login_day_3',
  EVENT_LOGIN_DAY_4 = 'event_login_day_4',
  EVENT_LOGIN_DAY_5 = 'event_login_day_5',
  EVENT_LOGIN_DAY_6 = 'event_login_day_6',
  EVENT_LOGIN_DAY_7 = 'event_login_day_7',

  NEWBIE_DAILY1 = 'newbie_daily1',
  NEWBIE_DAILY2 = 'newbie_daily2',
  NEWBIE_DAILY3 = 'newbie_daily3',
  NEWBIE_DAILY4 = 'newbie_daily4',
  NEWBIE_DAILY5 = 'newbie_daily5',
  NEWBIE_DAILY6 = 'newbie_daily6',
  NEWBIE_DAILY_SPECIAL = 'newbie_daily_special',

  QUEST_DAILY1 = 'quest_daily1',
  QUEST_DAILY2 = 'quest_daily2',
  QUEST_DAILY3 = 'quest_daily3',
  QUEST_DAILY4 = 'quest_daily4',
  QUEST_DAILY5 = 'quest_daily5',
  QUEST_DAILY6 = 'quest_daily6',

  QUEST_WEEKLY1 = 'quest_weekly1',
  QUEST_WEEKLY2 = 'quest_weekly2',
  QUEST_WEEKLY3 = 'quest_weekly3',
  QUEST_WEEKLY4 = 'quest_weekly4',
  QUEST_WEEKLY5 = 'quest_weekly5',
  QUEST_WEEKLY6 = 'quest_weekly6',

  WEEKLY_RANKING_MEMBER_1 = 'weekly_ranking_member_1',
  WEEKLY_RANKING_MEMBER_2 = 'weekly_ranking_member_2',
  WEEKLY_RANKING_MEMBER_3 = 'weekly_ranking_member_3',
  WEEKLY_RANKING_MEMBER_TOP_10 = 'weekly_ranking_member_top_10',

  WEEKLY_RANKING_CLAN_1 = 'weekly_ranking_clan_1',
  WEEKLY_RANKING_CLAN_2 = 'weekly_ranking_clan_2',
  WEEKLY_RANKING_CLAN_3 = 'weekly_ranking_clan_3',
}

export enum QuestFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ONCE = 'once'
}

export enum SlotWheelType {
  NORMAL_WHEEL = 'normal_wheel',
}

export enum RewardItemType {
  GOLD = 'gold',
  DIAMOND = 'diamond',
  FOOD = 'food',
  ITEM = 'item',
  PET = 'pet',
  PLANT = 'plant',
}

export enum ClanFundType {
  GOLD = 'gold',
  DIAMOND = 'diamond',
}

export enum ClanRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancel',
}

export enum PlantState {
  NONE = 0,
  SEED = 1,
  SMALL = 2,
  GROWING = 3,
  HARVESTABLE = 4,
}

export enum ClanActivityActionType {
  HARVEST = 'harvest',
  HARVEST_INTRUDER = 'harvest_intruder',
  HARVESTED_OTHER_FARM = 'harvest_other_farm',
  PURCHASE = 'purchase',
  FUND = 'fund',
  JOIN = 'join',
  LEAVE = 'leave',
  
  WEEKLY_RANKING_MEMBER_1 = 'weekly_ranking_member_1',
  WEEKLY_RANKING_MEMBER_2 = 'weekly_ranking_member_2',
  WEEKLY_RANKING_MEMBER_3 = 'weekly_ranking_member_3',
  WEEKLY_RANKING_MEMBER_TOP_10 = 'weekly_ranking_member_top_10',

  WEEKLY_RANKING_CLAN_1 = 'weekly_ranking_clan_1',
  WEEKLY_RANKING_CLAN_2 = 'weekly_ranking_clan_2',
  WEEKLY_RANKING_CLAN_3 = 'weekly_ranking_clan_3',
}
