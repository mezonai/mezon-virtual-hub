import { GameConfigKey } from "@constant/game-config.keys";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameConfigStore {
  private readonly store = new Map<GameConfigKey, any>();

  set<T>(key: GameConfigKey, value: T) {
    this.store.set(key, value);
  }

  get<T>(key: GameConfigKey): T | null {
    return this.store.get(key) ?? null;
  }

  has(key: GameConfigKey): boolean {
    return this.store.has(key);
  }

  clear() {
    this.store.clear();
  }
}
