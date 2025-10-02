import { configEnv } from '@config/env.config';
import {
  MERGE_PET_DIAMOND_COST,
  NEW_USER_FOOD_REWARD_QUANTITY,
  UPGRADE_PET_RATES,
} from '@constant';
import {
  FoodType,
  Gender,
  QuestType,
  RewardConfig,
  RewardSlotType,
} from '@enum';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { FoodService } from '@modules/food/food.service';
import { InventoryService } from '@modules/inventory/inventory.service';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ItemService } from '@modules/item/item.service';
import { GameConfigResponseDto } from '@modules/pet-players/dto/pet-players.dto';
import { QuestEventEmitter } from '@modules/player-quest/events/quest.events';
import { UserEntity } from '@modules/user/entity/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AwardResponseDto, RewardDataType } from './dto/game.dto';

@Injectable()
export class GameService {
  private readonly itemPercent: number;
  private readonly coinPercent: number;
  private readonly highCoinPercent: number;
  private readonly foodNormalPercent: number;
  private readonly foodPremiumPercent: number;
  private readonly foodUltraPercent: number;
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly itemService: ItemService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly foodService: FoodService,
    private readonly dataSource: DataSource,
  ) {
    this.itemPercent = configEnv().REWARD_ITEM_PERCENT;
    this.coinPercent = configEnv().REWARD_COIN_PERCENT;
    this.highCoinPercent = configEnv().REWARD_HIGH_COIN_PERCENT;

    this.foodNormalPercent = configEnv().REWARD_FOOD_NORMAL_PERCENT;
    this.foodPremiumPercent = configEnv().REWARD_FOOD_PREMIUM_PERCENT;
    this.foodUltraPercent = configEnv().REWARD_FOOD_ULTRA_PREMIUM_PERCENT;
  }

  private readonly SLOT_COUNT = 3;
  private readonly SPIN_COST = 100;

  async spinForRewards(user: UserEntity) {
    if (user.gold < this.SPIN_COST) {
      throw new BadRequestException('Not enough coins to spin');
    }
    user.gold -= this.SPIN_COST;
    await this.userRepository.save(user);

    const inventoryItems = await this.inventoryService.getUserInventory(
      user.id,
    );

    const availableItems = await this.itemService.getSpinAvailableItems(
      user.gender ?? Gender.MALE,
      inventoryItems,
    );

    const rewards = await this.generateRandomRewards(availableItems);

    const { result, user_gold } = await this.processRewards(user, rewards);

    QuestEventEmitter.emitProgress(user.id, QuestType.SPIN_LUCKY_WHEEL, 1);

    return { rewards: result, user_gold };
  }

  private async generateRandomRewards(
    availableItems: ItemEntity[],
  ): Promise<RewardDataType> {
    const rewards: RewardDataType = [];
    const groupedFoods = await this.foodService.getAllFoodsGroupedByType();

    const thresholds = {
      item: this.coinPercent,
      coin: this.coinPercent + this.itemPercent,
      normalFood: this.coinPercent + this.itemPercent + this.foodNormalPercent,
      premiumFood:
        this.coinPercent +
        this.itemPercent +
        this.foodNormalPercent +
        this.foodPremiumPercent,
      // ultraFood:
      //   this.itemPercent +
      //   this.coinPercent +
      //   this.foodNormalPercent +
      //   this.foodPremiumPercent +
      //   this.foodUltraPercent,
    };

    for (let i = 0; i < this.SLOT_COUNT; i++) {
      const rand = Math.random() * 100;

      switch (true) {
        case rand < thresholds.item && availableItems.length > 0:
          const randomItem =
            availableItems[Math.floor(Math.random() * availableItems.length)];
          rewards.push(randomItem ?? null);
          break;

        case rand < thresholds.coin:
          rewards.push('coin');
          break;

        case rand < thresholds.normalFood:
          rewards.push(groupedFoods[FoodType.NORMAL] || null);
          break;

        case rand < thresholds.premiumFood:
          rewards.push(groupedFoods[FoodType.PREMIUM] || null);
          break;

        // case rand < thresholds.ultraFood:
        //   rewards.push(groupedFoods[FoodType.ULTRA_PREMIUM] || null);
        //   break;

        default:
          rewards.push(null);
          break;
      }
    }

    return rewards;
  }

  async processRewards(user: UserEntity, rewards: RewardDataType) {
    const result: (AwardResponseDto | null)[] = [];

    for (const reward of rewards) {
      if (reward === 'coin') {
        const coinRand = Math.random() * 100;
        let coinReward = 0;

        if (coinRand < this.highCoinPercent) {
          coinReward =
            Math.floor(
              Math.random() *
                (RewardConfig.HIGH_COIN_MAX - RewardConfig.HIGH_COIN_MIN + 1),
            ) + RewardConfig.HIGH_COIN_MIN;
        } else {
          coinReward =
            Math.floor(
              Math.random() *
                (RewardConfig.LOW_COIN_MAX - RewardConfig.LOW_COIN_MIN + 1),
            ) + RewardConfig.LOW_COIN_MIN;
        }

        user.gold += coinReward;
        result.push({ type: RewardSlotType.GOLD, quantity: coinReward });
      } else if (reward instanceof ItemEntity) {
        let inventoryItem = await this.inventoryService.getUserInventoryItem(
          user.id,
          reward.id,
        );

        if (!inventoryItem) {
          inventoryItem = await this.inventoryService.addItemToInventory(
            user,
            reward.id,
          );
          result.push({ type: RewardSlotType.ITEM, item: reward, quantity: 1 });
        } else if (reward.is_stackable) {
          inventoryItem.quantity += 1;
          await this.inventoryService.save(inventoryItem);
          result.push({
            type: RewardSlotType.ITEM,
            item: reward,
            quantity: inventoryItem.quantity,
          });
        } else {
          result.push(null);
        }
      } else if (reward instanceof FoodEntity) {
        const inventoryFood = await this.inventoryService.addFoodToInventory(
          user,
          reward.id,
        );

        result.push({
          type: RewardSlotType.FOOD,
          food: reward,
          quantity: inventoryFood.quantity,
        });
      } else {
        result.push(null);
      }
    }

    await this.userRepository.update(user.id, user);
    return { result, user_gold: user.gold };
  }

  async giveInitialReward(user: UserEntity) {
    if (user.has_first_reward) {
      return {
        success: false,
        message: 'Initial reward has already been claimed.',
      };
    }

    const foodReward = await this.foodService.findOne({
      where: { type: FoodType.NORMAL },
    });

    if (!foodReward) {
      return { success: false, message: 'No food reward available.' };
    }

    await this.inventoryService.addFoodToInventory(
      user,
      foodReward.id,
      NEW_USER_FOOD_REWARD_QUANTITY,
    );

    user.has_first_reward = true;
    await this.userRepository.save(user);

    const rewards: AwardResponseDto[] = [
      {
        type: RewardSlotType.FOOD,
        quantity: NEW_USER_FOOD_REWARD_QUANTITY,
        food: foodReward,
      },
    ];

    return { rewards };
  }

  getGameConfig(): GameConfigResponseDto {
    const totalRewardPercent =
      this.itemPercent +
      this.coinPercent +
      this.foodNormalPercent +
      this.foodPremiumPercent +
      this.foodUltraPercent;

    return {
      costs: {
        spinGold: this.SPIN_COST,
        upgradeStarsDiamond: MERGE_PET_DIAMOND_COST,
      },
      percent: {
        upgradeStars: {
          common: UPGRADE_PET_RATES.common,
          rare: UPGRADE_PET_RATES.rare,
          epic: UPGRADE_PET_RATES.epic,
          legendary: UPGRADE_PET_RATES.legendary,
        },
        upgradeRarity: {
          rare: UPGRADE_PET_RATES.rare,
          epic: UPGRADE_PET_RATES.epic,
          legendary: UPGRADE_PET_RATES.legendary,
        },
        spinRewards: {
          item: this.itemPercent,
          gold: this.coinPercent,
          food: {
            normal: this.foodNormalPercent,
            premium: this.foodPremiumPercent,
            ultra: this.foodUltraPercent,
          },
          none: 100 - totalRewardPercent,
        },
      },
    };
  }
}
