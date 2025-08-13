import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { PlayerAction } from "./PlayerAction";

export class DefenseHandler implements ISkillHandler {
    handle(
        attacker: PetState,
        defender: PetState,
        attackerAction: PlayerAction,
        defenderAction: PlayerAction,
        skill: SkillState
    ): {
        damage: number;
        effectValue: number;
    } {
        // Kỹ năng phòng thủ không gây damage, chỉ dùng để ngăn chặn tấn công ở lượt đối thủ
        return { damage: 0, effectValue: 0 };
    }
}