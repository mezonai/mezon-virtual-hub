import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RewardItemEntity } from './entity/reward-item.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { BaseService } from '@libs/base/base.service';
import { RewardItemDto, UpdateRewardItemDto } from './dto/reward-item.dto';
import { RewardItemType } from '@enum';

@Injectable()
export class RewardItemService extends BaseService<RewardItemEntity> {
  constructor(
    @InjectRepository(RewardItemEntity)
    private readonly rewardItemRepo: Repository<RewardItemEntity>,

    @InjectRepository(RewardEntity)
    private readonly rewardRepo: Repository<RewardEntity>,

    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,

    @InjectRepository(FoodEntity)
    private readonly foodRepo: Repository<FoodEntity>,
  ) {
    super(rewardItemRepo, RewardItemEntity.name);
  }

  async getAll() {
    const rewardItems = await this.rewardItemRepo.find({
      relations: ['item', 'food', 'reward'],
    });

    return rewardItems.map((rewardItem) => ({
      id: rewardItem.id,
      type: rewardItem.type,
      quantity: rewardItem.quantity,
      reward: rewardItem.reward
        ? { id: rewardItem.reward.id, name: rewardItem.reward.name }
        : undefined,
      item: rewardItem.item
        ? { id: rewardItem.item.id, name: rewardItem.item.name }
        : undefined,
      food: rewardItem.food
        ? {
            id: rewardItem.food.id,
            name: rewardItem.food.name,
            type: rewardItem.food.type,
          }
        : undefined,
    }));
  }

  async upsertRewardItem(
    where: FindOptionsWhere<RewardItemEntity>,
    data: Partial<RewardItemEntity>,
    quantity: number,
  ): Promise<RewardItemEntity> {
    let rewardItem = await this.rewardItemRepo.findOne({ where });
    if (rewardItem) {
      if (quantity <= 0)
        throw new BadRequestException('Quantity must be greater than 0');
      rewardItem.quantity += quantity;
    } else {
      rewardItem = this.rewardItemRepo.create({ ...data, quantity });
    }

    return this.rewardItemRepo.save(rewardItem);
  }

  async createRewardItems(
    rewardId: string,
    dtos: RewardItemDto[],
  ): Promise<RewardItemEntity[]> {
    const reward = await this.rewardRepo.findOne({ where: { id: rewardId } });
    if (!reward) throw new NotFoundException('Reward not found');
    const results = await Promise.all(
      dtos.map((dto) => {
        dto.reward_id = rewardId;
        return this.createReward(dto);
      }),
    );

    return results;
  }

  async createReward(dto: RewardItemDto): Promise<RewardItemEntity> {
    const reward = await this.rewardRepo.findOne({
      where: { id: dto.reward_id },
    });
    if (!reward) throw new NotFoundException('Reward not found');

    switch (dto.type) {
      case RewardItemType.ITEM: {
        if (!dto.item_id) {
          throw new BadRequestException(
            'item_id is required when type is ITEM',
          );
        }
        const item = await this.itemRepo.findOne({
          where: { id: dto.item_id },
        });
        if (!item) throw new NotFoundException('Item not found');

        return this.upsertRewardItem(
          { item: { id: dto.item_id }, reward: { id: reward.id } },
          { reward, type: dto.type, item },
          dto.quantity,
        );
      }

      case RewardItemType.FOOD: {
        if (!dto.food_id) {
          throw new BadRequestException(
            'food_id is required when type is FOOD',
          );
        }
        const food = await this.foodRepo.findOne({
          where: { id: dto.food_id },
        });
        if (!food) throw new NotFoundException('Food not found');

        return this.upsertRewardItem(
          { food: { id: dto.food_id }, reward: { id: reward.id } },
          { reward, type: dto.type, food },
          dto.quantity,
        );
      }

      case RewardItemType.DIAMOND:
      case RewardItemType.GOLD: {
        return this.upsertRewardItem(
          { type: dto.type, reward: { id: reward.id } },
          { reward, type: dto.type },
          dto.quantity,
        );
      }

      default:
        throw new BadRequestException(`Invalid reward type: ${dto.type}`);
    }
  }

  async updateRewardItem(
    id: string,
    payload: UpdateRewardItemDto,
  ): Promise<RewardItemEntity> {
    const rewardItem = await this.rewardItemRepo.findOne({
      where: { id },
      relations: ['reward', 'item', 'food'],
    });
    if (!rewardItem) throw new NotFoundException('Reward Item not found');

    if (rewardItem.reward.id != payload.reward_id) {
      const reward = await this.rewardRepo.findOne({
        where: { id: payload.reward_id },
      });
      if (!reward) throw new NotFoundException('Reward not found');

      const existed_reward_item = await this.rewardItemRepo.findOne({
        where: {
          reward: { id: reward.id },
          food: { id: rewardItem.food?.id },
          item: { id: rewardItem.item?.id },
          type: rewardItem.type,
        },
      });
      if (existed_reward_item)
        throw new NotFoundException(`Reward item with type: ${rewardItem.type} of Reward: ${reward.type} is already existed!`);
      rewardItem.reward = reward;
    }
    rewardItem.quantity = payload.quantity;
    return this.rewardItemRepo.save(rewardItem);
  }

  async deleteRewardItem(id: string): Promise<void> {
    const rewardItem = await this.rewardItemRepo.findOne({ where: { id } });
    if (!rewardItem) throw new NotFoundException('Reward Item not found');

    await this.rewardItemRepo.remove(rewardItem);
  }
}
