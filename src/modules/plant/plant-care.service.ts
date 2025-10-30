import { PlantState } from '@enum';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';

export class PlantCareUtils {
  private static readonly baseGrowTime = 600; // 10 phút
  private static readonly baseWaterCount = 2;
  private static readonly baseBugCount = 1;

  static calculateCareNeeds(growTimeSeconds: number) {
    const totalWater = Math.max(
      1,
      Math.round(this.baseWaterCount * (growTimeSeconds / this.baseGrowTime)),
    );
    const totalBug = Math.max(
      1,
      Math.round(this.baseBugCount * (growTimeSeconds / this.baseGrowTime)),
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
    const now = new Date();
    return (
      p.total_water_count < totalWater &&
      (!p.need_water_until || p.need_water_until < now)
    );
  }

  static checkHasBug(p: SlotsPlantEntity): boolean {
    if (this.checkCanHarvest(p.created_at, p.grow_time)) return false;
    const { totalBug } = this.calculateCareNeeds(p.grow_time);
    const now = new Date();
    return p.total_bug_caught < totalBug && (!p.bug_until || p.bug_until < now);
  }

  static getNextCareInterval(
    growTimeSeconds: number,
    totalCareActions: number,
  ) {
    return growTimeSeconds / totalCareActions;
  }

  static isFullyCared(currentCount: number, maxCount: number) {
    return currentCount >= maxCount;
  }

  static applyWater(p: SlotsPlantEntity): Date {
    const { totalWater } = this.calculateCareNeeds(p.grow_time);
    const now = new Date();

    if (this.isFullyCared(p.total_water_count, totalWater))
      throw new Error('Plant already fully watered');

    if (p.need_water_until && p.need_water_until > now) {
      const remain = Math.ceil(
        (p.need_water_until.getTime() - now.getTime()) / 1000,
      );
      throw new Error(`You can water again in ${remain}s`);
    }

    const nextInterval = this.getNextCareInterval(
      p.grow_time,
      totalWater,
    );
    p.total_water_count += 1;
    p.last_watered_at = now;
    p.need_water_until = new Date(now.getTime() + nextInterval * 1000);
    return p.need_water_until;
  }

  static applyCatchBug(p: SlotsPlantEntity): Date {
    const { totalBug } = this.calculateCareNeeds(p.grow_time);
    const now = new Date();

    if (this.isFullyCared(p.total_bug_caught, totalBug))
      throw new Error('All bugs already caught');

    if (p.bug_until && p.bug_until > now) {
      const remain = Math.ceil((p.bug_until.getTime() - now.getTime()) / 1000);
      throw new Error(`No bugs to catch yet, wait ${remain}s`);
    }

    const nextInterval = this.getNextCareInterval(
      p.grow_time,
      totalBug,
    );
    p.total_bug_caught += 1;
    p.last_bug_caught_at = now;
    p.bug_until = new Date(now.getTime() + nextInterval * 1000);

    return p.bug_until;
  }

  static getNextWaterTime(p: SlotsPlantEntity): {
    nextWaterTime: Date | null;
    needWaterUpdated: boolean;
  } {
    const canHarvest = this.checkCanHarvest(p.created_at, p.grow_time);
    if (canHarvest) return { nextWaterTime: null, needWaterUpdated: false };

    const { totalWater } = this.calculateCareNeeds(p.grow_time);
    const interval = this.getNextCareInterval(p.grow_time, totalWater);
    const lastWatered = p.last_watered_at || p.created_at;
    const nextWaterTime = new Date(lastWatered.getTime() + interval * 1000);

    let needWaterUpdated = false;
    if (
      !p.need_water_until ||
      p.need_water_until.getTime() !== nextWaterTime.getTime()
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
    const canHarvest = this.checkCanHarvest(p.created_at, p.grow_time);
    if (canHarvest) return { nextBugTime: null, hasBugUpdated: false };

    const { totalBug } = this.calculateCareNeeds(p.grow_time);
    const interval = this.getNextCareInterval(p.grow_time, totalBug);
    const lastBugCaught = p.last_bug_caught_at || p.created_at;
    const nextBugTime = new Date(lastBugCaught.getTime() + interval * 1000);

    let hasBugUpdated = false;
    if (!p.bug_until || p.bug_until.getTime() !== nextBugTime.getTime()) {
      p.bug_until = nextBugTime;
      hasBugUpdated = true;
    }
    return { nextBugTime, hasBugUpdated };
  }
}
