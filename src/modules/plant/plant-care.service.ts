import { PlantState } from '@enum';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';

export class PlantCareUtils {
  private static readonly BASE_GROW_TIME = 600; // 10 phút
  private static readonly BASE_WATER_COUNT = 2; // số lần tưới cơ bản
  private static readonly BASE_BUG_COUNT = 1; // số lần bắt bọ cơ bản
  private static readonly MAX_CARE_COUNT = 10; // tối đa số lần tưới/bắt bọ
  private static readonly WATER_EXPONENT = 0.5; // mũ tăng số lần tưới theo thời gian
  private static readonly BUG_EXPONENT = 0.6; // mũ tăng số lần bắt bọ theo thời gian
  private static readonly BUG_VARIATION = 1; // ±1 ngẫu nhiên cho số bọ
  private static readonly BUG_VARIATIONS = 2; // ±1 ngẫu nhiên cho số bọ

  static calculateCareNeeds(growTimeSeconds: number) {
    const totalWater = Math.min(
      Math.max(
        Math.round(
          this.BASE_WATER_COUNT *
            Math.pow(
              growTimeSeconds / this.BASE_GROW_TIME,
              this.WATER_EXPONENT,
            ),
        ),
        1,
      ),
      this.MAX_CARE_COUNT,
    );

    const totalBug = Math.min(
      Math.max(
        Math.round(
          this.BASE_BUG_COUNT *
            Math.pow(growTimeSeconds / this.BASE_GROW_TIME, this.BUG_EXPONENT),
        ),
        1,
      ),
      this.MAX_CARE_COUNT,
    );

    return { totalWater, totalBug };
  }

  static calculatePlantStage(
    createdAt: Date,
    growTimeSeconds: number,
  ): PlantState {
    const elapsed = (Date.now() - createdAt.getTime()) / 1000;
    const ratio = Math.min(elapsed / growTimeSeconds, 1);
    if (ratio >= 1) return PlantState.HARVESTABLE;
    if (ratio >= 0.8) return PlantState.GROWING;
    if (ratio >= 0.3) return PlantState.SMALL;
    return PlantState.SEED;
  }

  static calculateGrowRemain(createdAt: Date, growTimeSeconds: number): number {
    const now = Date.now();
    const growEnd = createdAt.getTime() + growTimeSeconds * 1000;
    return Math.max(0, Math.ceil((growEnd - now) / 1000));
  }

  static checkCanHarvest(createdAt: Date, growTimeSeconds: number): boolean {
    return this.calculateGrowRemain(createdAt, growTimeSeconds) <= 0;
  }

  static checkNeedWater(p: SlotsPlantEntity): boolean {
    if (this.checkCanHarvest(p.created_at, p.grow_time)) return false;
    const { totalWater } = this.calculateCareNeeds(p.grow_time);
    const { nextWaterTime } = this.getNextWaterTime(p);
    const now = new Date();

    return p.total_water_count < totalWater &&
      nextWaterTime &&
      now >= nextWaterTime
      ? true
      : false;
  }

  static checkHasBug(p: SlotsPlantEntity): boolean {
    if (this.checkCanHarvest(p.created_at, p.grow_time)) return false;
    const totalBug = this.calculateCareNeeds(p.grow_time).totalBug;
    const { nextBugTime } = this.getNextBugTime(p);
    const now = new Date();
    return p.total_bug_caught < totalBug && nextBugTime && now >= nextBugTime
      ? true
      : false;
  }

  static getNextCareInterval(
    growTimeSeconds: number,
    totalCareActions: number,
  ) {
    return growTimeSeconds / (totalCareActions + 1);
  }

  static applyWater(p: SlotsPlantEntity): Date | null {
    const now = new Date();
    const { totalWater } = this.calculateCareNeeds(p.grow_time);

    if (p.total_water_count >= totalWater) {
      p.need_water_until = null;
      throw new Error('Plant already fully watered');
    }

    p.total_water_count += 1;
    p.last_watered_at = now;

    const waterInterval = p.grow_time / (totalWater + 1);
    p.need_water_until =
      p.total_water_count >= totalWater
        ? null
        : new Date(
            p.created_at.getTime() + waterInterval * 1000 * p.total_water_count,
          );

    return p.need_water_until;
  }

  static applyCatchBug(p: SlotsPlantEntity): Date | null {
    const now = new Date();
    const { totalBug } = this.calculateCareNeeds(p.grow_time);

    if (p.total_bug_caught >= totalBug) {
      p.bug_until = null;
      throw new Error('All bugs already caught');
    }

    p.total_bug_caught += 1;
    p.last_bug_caught_at = now;

    const bugInterval = p.grow_time / (totalBug + 1);
    p.bug_until =
      p.total_bug_caught >= totalBug
        ? null
        : new Date(
            p.created_at.getTime() + bugInterval * 1000 * p.total_bug_caught,
          );

    return p.bug_until;
  }

  static getNextWaterTime(p: SlotsPlantEntity): {
    nextWaterTime: Date | null;
    needWaterUpdated: boolean;
  } {
    const { totalWater } = this.calculateCareNeeds(p.grow_time);
    const now = new Date();

    const interval = p.grow_time / (totalWater + 1);
    const waterTimes = Array.from(
      { length: totalWater },
      (_, i) => new Date(p.created_at.getTime() + interval * 1000 * (i + 1)),
    );

    const remainingTimes = waterTimes.filter(
      (t) => !p.last_watered_at || t > p.last_watered_at,
    );

    let nextWaterTime: Date | null = null;
    if (remainingTimes.length > 0) {
      nextWaterTime = remainingTimes.reduce((prev, curr) =>
        Math.abs(curr.getTime() - now.getTime()) <
        Math.abs(prev.getTime() - now.getTime())
          ? curr
          : prev,
      );
    }

    let needWaterUpdated = false;
    if (
      !p.need_water_until ||
      (nextWaterTime &&
        p.need_water_until.getTime() !== nextWaterTime.getTime())
    ) {
      p.need_water_until = nextWaterTime;
      needWaterUpdated = true;
    }

    return { nextWaterTime, needWaterUpdated };
  }

  static getNextBugTime(p: SlotsPlantEntity): {
    nextBugTime: Date | null;
    hasBugUpdated: boolean;
  } {
    const { totalBug } = this.calculateCareNeeds(p.grow_time);
    const now = new Date();

    if (p.total_bug_caught >= totalBug) {
      return { nextBugTime: null, hasBugUpdated: false };
    }

    const interval = p.grow_time / (totalBug + 1);
    const bugTimes = Array.from(
      { length: totalBug },
      (_, i) => new Date(p.created_at.getTime() + interval * 1000 * (i + 1)),
    );

    const remainingTimes = bugTimes.filter(
      (t) => !p.last_bug_caught_at || t > p.last_bug_caught_at,
    );

    let nextBugTime: Date | null = null;
    if (remainingTimes.length > 0) {
      nextBugTime = remainingTimes.reduce((prev, curr) =>
        Math.abs(curr.getTime() - now.getTime()) <
        Math.abs(prev.getTime() - now.getTime())
          ? curr
          : prev,
      );
    }

    let hasBugUpdated = false;
    if (
      !p.bug_until ||
      (nextBugTime && p.bug_until.getTime() !== nextBugTime.getTime())
    ) {
      p.bug_until = nextBugTime;
      hasBugUpdated = true;
    }

    return { nextBugTime, hasBugUpdated };
  }
}
