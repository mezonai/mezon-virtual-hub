import { PetState, SkillState } from "@types";
import { ISkillHandler } from "./ISkillHandler";
import { isAttackAction, PlayerAction } from "./PlayerAction";
import { SkillType } from "@enum";

export class BuffAttackHandler implements ISkillHandler {
  valueffect: number = 5;
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

    const damage = this.calculateDamage(attacker, defender, skill);
    defender.currentHp = Math.max(0, defender.currentHp - damage);
    if (defender.currentHp <= 0) defender.isDead = true;
    attacker.attack += this.valueffect;
    return { damage, effectValue: this.valueffect };
  }
}