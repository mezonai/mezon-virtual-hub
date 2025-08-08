import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { PlayerAction } from "./PlayerAction";
import { SkillCode } from "@enum";

export class HealHandler implements ISkillHandler {
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
        // Absorb – hồi 50% max máu
        if (skill.id === SkillCode.ABSORB) {
            return this.handleAbsorb(attacker);
        }

        if (skill.id === SkillCode.REST) {
            return this.handleRest(attacker);
        }
        // Mặc định: hồi 30 máu
        return this.handleDefaultHeal(attacker);
    }

    private handleAbsorb(attacker: PetState): {
        damage: number;
        effectValue: number;
    } {
        const healAmount = Math.floor(attacker.totalHp * 0.5);
        attacker.currentHp = Math.min(attacker.totalHp, attacker.currentHp + healAmount);
        return { damage: 0, effectValue: healAmount };
    }

    private handleDefaultHeal(attacker: PetState): {
        damage: number;
        effectValue: number;
    } {
        const healAmount = 30;
        attacker.currentHp = Math.min(attacker.totalHp, attacker.currentHp + healAmount);
        return { damage: 0, effectValue: healAmount };
    }

    private handleRest(attacker: PetState): {
        damage: number;
        effectValue: number;
    } {
        const healAmount = Math.ceil(attacker.totalHp / 2);
        attacker.currentHp = Math.min(attacker.totalHp, attacker.currentHp + healAmount);

        // Gán trạng thái ngủ trong 2 lượt
        attacker.sleepTurns = 1;
        return { damage: 0, effectValue: healAmount };
    }
}