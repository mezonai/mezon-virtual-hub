import { InventoryService } from '@modules/inventory/inventory.service';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ItemService } from '@modules/item/item.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwardResponseDto } from './dto/game.dto';
import { plainToInstance } from 'class-transformer';
import { configEnv } from '@config/env.config';

@Injectable()
export class GameService {
  private readonly ITEM_PERCENT: number;
  private readonly COIN_PERCENT: number;
  private readonly HIGH_COIN_PERCENT: number;
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly itemService: ItemService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    this.ITEM_PERCENT = configEnv().REWARD_ITEM_PERCENT;
    this.COIN_PERCENT = configEnv().REWARD_COIN_PERCENT;
    this.HIGH_COIN_PERCENT = configEnv().REWARD_HIGH_COIN_PERCENT;
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

    const rewards = this.generateRandomRewards(availableItems);

    const { result, user_gold } = await this.processRewards(user, rewards);

    return { rewards: result, user_gold };
  }

  private generateRandomRewards(
    availableItems: ItemEntity[],
  ): (ItemEntity | 'coin' | null)[] {
    const rewards: (ItemEntity | 'coin' | null)[] = [];
    for (let i = 0; i < this.SLOT_COUNT; i++) {
      const rand = Math.random() * 100; // Convert to percentage

      if (rand < this.ITEM_PERCENT && availableItems.length > 0) {
        // Item reward
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        rewards.push(availableItems[randomIndex]);
      } else if (rand < this.ITEM_PERCENT + this.COIN_PERCENT) {
        // Gold reward
        rewards.push('coin');
      } else {
        // No reward
        rewards.push(null);
      }
    }
    return rewards;
  }

  private async processRewards(
    user: UserEntity,
    rewards: (ItemEntity | 'coin' | null)[],
  ) {
    const result: (AwardResponseDto | null)[] = [];

    for (const reward of rewards) {
      if (reward === 'coin') {
        const coinRand = Math.random() * 100;
        let coinReward = 0;

        if (coinRand < this.HIGH_COIN_PERCENT) {
          coinReward = Math.floor(Math.random() * 10) + 11;
        } else {
          coinReward = Math.floor(Math.random() * 10) + 1;
        }

        result.push({ type: 'gold', amount: coinReward });
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
          result.push({ type: 'item', item: reward, quantity: 1 });
        } else if (reward.is_stackable) {
          inventoryItem.quantity += 1;
          await this.inventoryService.save(inventoryItem);
          result.push({
            type: 'item',
            item: reward,
            quantity: inventoryItem.quantity,
          });
        } else {
          result.push(null);
        }
      } else {
        result.push(null);
      }
    }

    await this.userRepository.update(user.id, user);
    return { result, user_gold: user.gold };
  }
}
