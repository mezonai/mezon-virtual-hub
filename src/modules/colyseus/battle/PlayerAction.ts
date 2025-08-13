export type PlayerAction =
  | { type: "attack"; skillIndex: number }
  | { type: "switch"; newPetIndex: number };

// 🔍 Hàm type guard để xác định action có phải là "attack"
export function isAttackAction(action: PlayerAction): action is { type: "attack"; skillIndex: number } {
  return action.type === "attack";
}