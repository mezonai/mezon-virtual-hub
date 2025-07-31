import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { PlayerAction } from "./PlayerAction";

export class BuffAttackHandler implements ISkillHandler {
  handle(
    attacker: PetState,
    defender: PetState,
    attackerAction: PlayerAction,
    defenderAction: PlayerAction,
    skill: SkillState
  ): { damage: number } {
    // Tăng chỉ số tấn công cho pet dùng kỹ năng
    attacker.attack += skill.effectValue;

    return { damage: 0 }; // Kỹ năng buff không gây sát thương
  }
}