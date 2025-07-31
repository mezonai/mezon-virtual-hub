import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { isAttackAction, PlayerAction } from "./PlayerAction";
import { SkillType } from "@enum";

export class DebuffAttackHandler implements ISkillHandler {
    constructor(
        private calculateDamage: (attacker: PetState, defender: PetState, skill: SkillState) => number
    ) { }

    handle(
        attacker: PetState,
        defender: PetState,
        attackerAction: PlayerAction,
        defenderAction: PlayerAction,
        skill: SkillState
    ): { damage: number } {
        const skillDefender =
            isAttackAction(defenderAction) ? defender.skills[defenderAction.skillIndex] : undefined;

        const isDefending = skillDefender?.skillType === SkillType.DEFENSE;
        if (isDefending) {
            return { damage: 0 };
        }

        // Tính sát thương
        const damage = this.calculateDamage(attacker, defender, skill);
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        if (defender.currentHp === 0) defender.isDead = true;

        // Giảm chỉ số tấn công của đối thủ
        defender.attack -= skill.effectValue;
        if (defender.attack < 1) defender.attack = 1;

        return { damage };
    }
}