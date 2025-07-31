import { PetState, SkillState } from "@types";
import { PlayerAction } from "../rooms/battle.room";

export interface ISkillHandler {
  handle(
    attacker: PetState,
    defender: PetState,
    attackerAction: PlayerAction,
    defenderAction: PlayerAction,
    skill: SkillState
  ): { damage: number };
}