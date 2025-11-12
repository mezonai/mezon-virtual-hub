import { PlantState } from '@enum';
import { SlotWithStatusDto } from '@modules/farm-slots/dto/farm-slot.dto';
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
    if (!p.need_water_until || this.checkCanHarvest(p.created_at, p.grow_time))
      return false;
    const { totalWater } = this.calculateCareNeeds(p.grow_time);
    const now = new Date();
    return (
      p.total_water_count < (totalWater ?? 0) &&
      (!p.need_water_until || p.need_water_until < now)
    );
  }

  static checkHasBug(p: SlotsPlantEntity): boolean {
    if (!p.bug_until || this.checkCanHarvest(p.created_at, p.grow_time))
      return false;

    const totalBug =
      p.expected_bug_count ?? this.calculateCareNeeds(p.grow_time).totalBug;
    const now = new Date();
    return p.total_bug_caught < totalBug && p.bug_until <= now;
  }

  static isFullyCared(currentCount: number, maxCount: number) {
    return currentCount >= maxCount;
  }
  static getNextCareInterval(
    growTimeSeconds: number,
    totalCareActions: number,
  ) {
    return growTimeSeconds / (totalCareActions + 1);
  }

  static applyWater(p: SlotsPlantEntity): Date {
    const { totalWater } = this.calculateCareNeeds(p.grow_time);
    const now = new Date();

    if (p.total_water_count >= totalWater)
      throw new Error('Plant already fully watered');

    if (p.need_water_until && p.need_water_until > now) {
      const remain = Math.ceil(
        (p.need_water_until.getTime() - now.getTime()) / 1000,
      );
      throw new Error(`You can water again in ${remain}s`);
    }

    const nextInterval = this.getNextCareInterval(p.grow_time, totalWater);
    p.total_water_count += 1;
    p.last_watered_at = now;
    p.need_water_until = new Date(now.getTime() + nextInterval * 1000);

    return p.need_water_until;
  }

  static applyCatchBug(p: SlotsPlantEntity): Date {
    const totalBug =
      p.expected_bug_count ?? this.calculateCareNeeds(p.grow_time).totalBug;
    const now = new Date();

    if (p.total_bug_caught >= totalBug)
      throw new Error('All bugs already caught');

    if (p.bug_until && p.bug_until > now) {
      const remain = Math.ceil((p.bug_until.getTime() - now.getTime()) / 1000);
      throw new Error(`No bugs to catch yet, wait ${remain}s`);
    }

    const nextInterval = this.getNextCareInterval(p.grow_time, totalBug);
    p.total_bug_caught += 1;
    p.last_bug_caught_at = now;
    p.bug_until = new Date(now.getTime() + nextInterval * 1000);

    return p.bug_until;
  }

  static getNextWaterTime(p: SlotsPlantEntity): {
    nextWaterTime: Date | null;
    needWaterUpdated: boolean;
  } {
    const { totalWater } = this.calculateCareNeeds(p.grow_time);
    if (p.total_water_count >= totalWater)
      return { nextWaterTime: null, needWaterUpdated: false };

    const interval = p.grow_time / (totalWater + 1);
    const nextWaterTime = new Date(
      p.created_at.getTime() + interval * (p.total_water_count + 1) * 1000,
    );
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
    const { totalBug } = this.calculateCareNeeds(p.grow_time);
    if (p.total_bug_caught >= totalBug)
      return { nextBugTime: null, hasBugUpdated: false };

    const interval = p.grow_time / (totalBug + 1);
    const nextBugTime = new Date(
      p.created_at.getTime() + interval * (p.total_bug_caught + 1) * 1000,
    );
    let hasBugUpdated = false;
    if (!p.bug_until || p.bug_until.getTime() !== nextBugTime.getTime()) {
      p.bug_until = nextBugTime;
      hasBugUpdated = true;
    }

    return { nextBugTime, hasBugUpdated };
  }

   static updatePlantCareOffline(slot: SlotWithStatusDto) {
    const now = new Date();
    const plant = slot.currentPlant;
    if (!plant) return;

    const { totalWater, totalBug } = PlantCareUtils.calculateCareNeeds(
      plant.grow_time,
    );

    const waterInterval = plant.grow_time / (totalWater + 1);
    const bugInterval = plant.grow_time / (totalBug + 1);

    const nextWaterIndex = plant.total_water_count + 1;
    plant.need_water_until =
      nextWaterIndex > totalWater
        ? null
        : new Date(
            new Date(plant.created_at).getTime() +
              waterInterval * 1000 * nextWaterIndex,
          );

    const nextBugIndex = plant.total_bug_caught + 1;
    plant.bug_until =
      nextBugIndex > totalBug
        ? null
        : new Date(
            new Date(plant.created_at).getTime() +
              bugInterval * 1000 * nextBugIndex,
          );
  }
}
