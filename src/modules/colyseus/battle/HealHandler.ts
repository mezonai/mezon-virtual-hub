import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { PlayerAction } from "./PlayerAction";

export class HealHandler implements ISkillHandler {
    handle(
        attacker: PetState,
        defender: PetState,
        attackerAction: PlayerAction,
        defenderAction: PlayerAction,
        skill: SkillState
    ): { damage: number } {
        // Absorb – hồi 50% max máu
        if (skill.id === "GRASS02") {
            return this.handleAbsorb(attacker, skill);
        }

        // Mặc định: hồi 30 máu
        return this.handleDefaultHeal(attacker);
    }

    private handleAbsorb(attacker: PetState, skill: SkillState): { damage: number } {
        const healAmount = Math.floor(attacker.totalHp * 0.5);
        attacker.currentHp = Math.min(attacker.totalHp, attacker.currentHp + healAmount);
        return { damage: healAmount };
    }

    private handleDefaultHeal(attacker: PetState): { damage: number } {
        const healAmount = 30;
        attacker.currentHp = Math.min(attacker.totalHp, attacker.currentHp + healAmount);
        return { damage: healAmount };
    }
}