import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { PetType, PlantState } from '@enum';
import { UserWithPetPlayers } from '@modules/user/dto/user.dto';
import { Client as ColyseusClient } from 'colyseus';
import { TokenSentEvent } from 'mezon-sdk/dist/cjs/api/api';

export class Player extends Schema {
  @type('string') id: string = '';
  @type('string') user_id: string = '';
  @type('boolean') is_show_name: boolean;
  @type('string') display_name: string = '';
  @type('string') skin_set: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') pet_players: string = '';
  @type('boolean') isInBattle: boolean;
  @type('boolean') isHarvesting: boolean;
  @type('string') clan_id: string = '';
}

export class SkillState extends Schema {
  @type("string") id: string = "";
  @type("number") damage: number = 0;
  @type("string") skillType: string = "";
  @type("string") type: string = "";
  @type("number") accuracy: number = 0;
  @type("number") totalPowerPoint: number = 0;
  @type("number") currentPowerPoint: number = 0;
}

export class PetState extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") species: string = "";
  @type("string") type: PetType | "";
  @type("number") attack: number = 100;
  @type("number") defense: number = 100;
  @type("number") currentHp: number = 100;
  @type("number") totalHp: number = 100;
  @type("number") level: number = 2;
  @type("number") currentExp: number = 20;
  @type("number") totalExp: number = 100;
  @type("number") speed: number = 10;
  @type("number") sleepTurns: number = 0;
  @type([SkillState]) skills: SkillState[] = [];
  @type("boolean") isDead: boolean = false;
  @type("boolean") isSleeping: boolean = false;
}
export class PlayerBattleInfo extends Schema {
  @type("string") id: string = "";
  @type("string") user_id: string = "";
  @type("string") name: string = "";
  @type([PetState]) pets: PetState[] = [];
  @type("number") activePetIndex: number = 0;
  @type("boolean") isEndTurn = false;
}

export class PlantDataSchema extends Schema {
  @type('string') id: string;
  @type('string') plant_id: string;
  @type('string') plant_name: string;
  @type('string') planted_by: string;
  @type('number') grow_time: number;
  @type('number') grow_time_remain: number;
  @type('number') stage: PlantState; 
  @type('boolean') can_harvest: boolean;
  @type('boolean') need_water: boolean;
  @type('boolean') has_bug: boolean;
  @type('string') harvest_at: string | null;
  @type('string') created_at: string;
  @type('string') updated_at: string;
}

export class FarmSlotState extends Schema {
  @type('string') id: string = '';
  @type('number') slot_index: number = 0;
  @type(PlantDataSchema) currentPlant?: PlantDataSchema | null;
  @type('string')  harvestingBy?: string;
  @type('number') harvestEndTime: number = 0;
  @type('number') harvest_count: number = 0;
  @type('number') harvest_count_max: number = 10;
}

export interface WithdrawMezonPayload
  extends Pick<TokenSentEvent, 'amount' | 'note'> { }

export interface AuthenticatedClient extends ColyseusClient {
  userData?: UserWithPetPlayers;
}

export interface WithdrawMezonResult {
  success: boolean;
  message?: string;
}
