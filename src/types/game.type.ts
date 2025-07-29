import { Schema, type } from '@colyseus/schema';
import { PetType } from '@enum';
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
}

export class SkillData extends Schema {
  @type("string") id: string = "";
  @type("number") attack: number = 0;
  @type("number") accuracy: number = 0;
  @type("number") powerPoint: number = 0;
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
  @type([SkillData]) skills: SkillData[] = [];
  @type("boolean") isDead: boolean = false;
}
export class PlayerBattleInfo extends Schema {
  @type("string") id: string = "";
  @type("string") user_id: string = "";
  @type("string") name: string = "";
  @type([PetState]) pets: PetState[] = [];
  @type("number") activePetIndex: number = 0;
}

export interface WithdrawPayload
  extends Pick<TokenSentEvent, 'amount' | 'note'> { }

export interface AuthenticatedClient extends ColyseusClient {
  userData?: UserWithPetPlayers;
}
