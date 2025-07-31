import { SkillType } from "@enum";
import { ISkillHandler } from "./ISkillHandler";
import { AttackHandler } from "./AttackHandler";
import { PetState, SkillState } from "@types";
import { HealHandler } from "./HealHandler";
import { DefenseHandler } from "./DefenseHandler";
import { BuffAttackHandler } from "./BuffAttackHandler";
import { DebuffAttackHandler } from "./DebuffAttackHandler";

export class SkillHandlerFactory {
    static create(
        skillType: SkillType,
        calculateDamage: (atk: PetState, def: PetState, skill: SkillState) => number
    ): ISkillHandler {
        switch (skillType) {
            case SkillType.ATTACK:
                return new AttackHandler(calculateDamage);
            case SkillType.DEFENSE:
                return new DefenseHandler();
            case SkillType.HEAL:
                return new HealHandler();
            case SkillType.INCREASE_ATTACK:
                return new BuffAttackHandler();
            case SkillType.DECREASE_ATTACK:
                return new DebuffAttackHandler(calculateDamage);
            default:
                throw new Error(`Unsupported skill type: ${skillType}`);
        }
    }
}