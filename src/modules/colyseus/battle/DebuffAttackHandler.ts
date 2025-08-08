import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { isAttackAction, PlayerAction } from "./PlayerAction";
import { SkillCode, SkillType } from "@enum";

export class DebuffAttackHandler implements ISkillHandler {
    valueffectGrowl: number = 5;
    constructor(
        private calculateDamage: (attacker: PetState, defender: PetState, skill: SkillState) => number
    ) { }

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
        const skillDefender =
            isAttackAction(defenderAction) ? defender.skills[defenderAction.skillIndex] : undefined;

        const isDefending = skillDefender?.skillType === SkillType.DEFENSE;
        if (isDefending) {
            return { damage: 0, effectValue: 0 };
        }

        if (skill.id === SkillCode.GROWL) {
            return this.handleGrowl(attacker, defender, skill);;
        }

        if (skill.id == SkillCode.CONFUSION) {
            return this.handleConfusion(attacker, defender, skill);;
        }
        // Giảm chỉ số tấn công của đối thủ
        return { damage: 0, effectValue: 0 };
    }

    private handleGrowl(attacker: PetState, defender: PetState, skill: SkillState): {
        damage: number;
        effectValue: number;
    } {
        const damage = this.calculateDamage(attacker, defender, skill);
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        if (defender.currentHp <= 0) defender.isDead = true;
        defender.attack -= this.valueffectGrowl;
        if (defender.attack < 1) defender.attack = 1;
        return { damage: damage, effectValue: this.valueffectGrowl };
    }

    private handleConfusion(attacker: PetState, defender: PetState, skill: SkillState): {
        damage: number;
        effectValue: number;
    } {
        const damage = this.calculateDamage(attacker, defender, skill);
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        if (defender.currentHp <= 0) defender.isDead = true;
        const valueEffect = defender.attack / 2;
        defender.attack -= valueEffect;
        if (defender.attack < 1) defender.attack = 1;
        return { damage: damage, effectValue: valueEffect };
    }
}