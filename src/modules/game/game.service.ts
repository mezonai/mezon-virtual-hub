import { InventoryService } from '@modules/inventory/inventory.service';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ItemService } from '@modules/item/item.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwardResponseDto, RewardDataType } from './dto/game.dto';
import { plainToInstance } from 'class-transformer';
import { configEnv } from '@config/env-config/env.config';
import { FoodService } from '@modules/food/food.service';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { FoodType, RewardType } from '@enum';

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
  ) {
    this.itemPercent = configEnv().REWARD_ITEM_PERCENT;
    this.coinPercent = configEnv().REWARD_COIN_PERCENT;
    this.highCoinPercent = configEnv().REWARD_HIGH_COIN_PERCENT;

    this.foodNormalPercent = configEnv().REWARD_FOOD_NORMAL_PERCENT;
    this.foodPremiumPercent = configEnv().REWARD_FOOD_PREMIUM_PERCENT;
    this.foodUltraPercent = configEnv().REWARD_FOOD_ULTRA_PREMIUM_PERCENT;
  }

  private readonly SLOT_COUNT = 3;
  private readonly SPIN_COST = 10;

  async spinForRewards(user: UserEntity) {
    if (user.gold < this.SPIN_COST) {
      throw new BadRequestException('Not enough coins to spin');
    }

    user.gold -= this.SPIN_COST;
    await this.userRepository.update(user.id, user);

    const inventoryItems = await this.inventoryService.getUserInventory(
      user.id,
    );
    const availableItems = await this.itemService.getAvailableItems(
      user.gender,
      inventoryItems,
    );

    const rewards =  await this.generateRandomRewards(availableItems);

    const { result, user_gold } = await this.processRewards(user, rewards);

    return { rewards: result, user_gold };
  }

  private async generateRandomRewards(
    availableItems: ItemEntity[],
  ): Promise<RewardDataType> {
    const rewards: RewardDataType = [];
    const groupedFoods = await this.foodService.getAllFoodsGroupedByType();

    const thresholds = {
      coin: 
        this.coinPercent +
        this.itemPercent +
        this.foodNormalPercent +
        this.foodPremiumPercent,
      item:
        this.itemPercent +
        this.foodNormalPercent +
        this.foodPremiumPercent,
      normalFood: this.foodNormalPercent + this.foodPremiumPercent,
      premiumFood: this.foodPremiumPercent,
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


  private async processRewards(
    user: UserEntity,
    rewards: RewardDataType,
  ) {
    const result: (AwardResponseDto | null)[] = [];

    for (const reward of rewards) {
      if (reward === 'coin') {
        const coinRand = Math.random() * 100;
        let coinReward = 0;

        if (coinRand < this.highCoinPercent) {
          coinReward = Math.floor(Math.random() * 10) + 11;
        } else {
          coinReward = Math.floor(Math.random() * 10) + 1;
        }

        user.gold += coinReward;
        result.push({ type: RewardType.GOLD, amount: coinReward });
      } else if (reward instanceof ItemEntity) {
        let inventoryItem = await this.inventoryService.getUserInventoryItem(
          user.id,
          reward.id,
        );

        if (!inventoryItem) {
          inventoryItem = await this.inventoryService.addItemToInventory(
            user,
            reward,
          );
          result.push({ type: RewardType.ITEM, item: reward, quantity: 1 });
        } else if (reward.is_stackable) {
          inventoryItem.quantity += 1;
          await this.inventoryService.save(inventoryItem);
          result.push({
            type: RewardType.ITEM,
            item: reward,
            quantity: inventoryItem.quantity,
          });
        } else {
          result.push(null);
        }
      }  else if (reward instanceof FoodEntity) {
        const inventoryFood = await this.inventoryService.addFoodToInventory(
          user,
          reward,
        );

        result.push({
          type: RewardType.FOOD,
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
}
