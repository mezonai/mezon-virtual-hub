import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { PlayerAction } from "../rooms/battle.room";
import { isAttackAction } from "./PlayerAction";
import { SkillType } from "@enum";

export class AttackHandler implements ISkillHandler {
    constructor(private calculateDamage: (atk: PetState, def: PetState, skill: SkillState) => number) { }

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
        if (this.isFuryPunch(skill)) {
            return this.handleFuryPunch(attacker, defender, skill, isDefending);
        }
        if (isDefending) {
            return { damage: 0 };
        }

        const damage = this.calculateDamage(attacker, defender, skill);
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        if (defender.currentHp === 0) defender.isDead = true;
        return { damage };
    }

    private isFuryPunch(skill: SkillState): boolean {
        return skill.id === "NOR12";
    }

    private handleFuryPunch(
        attacker: PetState,
        defender: PetState,
        skill: SkillState,
        isDefending: boolean
    ): { damage: number } {
        const accuracy = skill.accuracy ?? 100;
        const hitRoll = Math.random() * 100;
        const isHit = hitRoll < accuracy;

        if (!isHit) {
            // Đánh hụt: không gây damage, không mất máu
            return { damage: 0 };
        }

        // Nếu trúng: luôn mất 50% máu bản thân
        const selfDamage = Math.floor(attacker.currentHp / 2);
        attacker.currentHp = Math.max(0, attacker.currentHp - selfDamage);
        if (attacker.currentHp === 0) attacker.isDead = true;

        if (isDefending) {
            // Đối thủ phòng thủ → không gây damage
            return { damage: 0 };
        }

        // Đối thủ không phòng thủ → gây damage
        const damage = this.calculateDamage(attacker, defender, skill);
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        if (defender.currentHp === 0) defender.isDead = true;

        return { damage: damage };
    }
}
