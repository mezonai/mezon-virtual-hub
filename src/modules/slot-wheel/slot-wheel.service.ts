import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSlotWheelDto, SlotWheelQueryDto, UpdateSlotWheelDto } from '@modules/slot-wheel/dto/slot-wheel.dto';
import { BaseService } from '@libs/base/base.service';
import { SlotWheelEntity } from '@modules/slot-wheel/entity/slot-wheel.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardItemType, SlotWheelType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { InventoryService } from '@modules/inventory/inventory.service';
import { UserEntity } from '@modules/user/entity/user.entity';

@Injectable()
export class SlotWheelService extends BaseService<SlotWheelEntity> {
  constructor(
    @InjectRepository(SlotWheelEntity)
    private readonly slotWheelRepo: Repository<SlotWheelEntity>,

    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,

    @InjectRepository(FoodEntity)
    private readonly foodRepo: Repository<FoodEntity>,

    @InjectRepository(PetsEntity)
    private readonly petRepo: Repository<PetsEntity>,

    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,

    private readonly inventoryService: InventoryService,
  ) {
    super(slotWheelRepo, SlotWheelEntity.name);
  }

  async getAll(query: SlotWheelQueryDto) {
    const slotWheelItems = await this.slotWheelRepo.find({
      where: { ...query },
      relations: ['item', 'food', 'pet', 'plant'],
    });

    return slotWheelItems;
  }

  async getRandomItems(
    user: UserEntity,
    type: SlotWheelType,
    count = 3,
  ) {
    const items = await this.slotWheelRepo.find({
      where: { type },
      relations: ['item', 'food', 'pet', 'plant'],
    });

    if (!items.length) {
      throw new NotFoundException('No slot wheel items found');
    }

    const totalWeight = items.reduce(
      (sum, item) => sum + item.weight_point,
      0,
    );

    if (totalWeight <= 0) {
      throw new BadRequestException('Total weight_point must be greater than 0');
    }

    const rewards: SlotWheelEntity[] = [];

    for (let i = 0; i < count; i++) {
      const random = Math.random() * totalWeight;

      let cumulativeWeight = 0;
      let rewardItem: SlotWheelEntity | null = null;

      for (const item of items) {
        cumulativeWeight += item.weight_point;
        if (random < cumulativeWeight) {
          rewardItem = item;
          break;
        }
      }

      if (!rewardItem) {
        rewardItem = items[items.length - 1];
      }

      rewards.push(rewardItem);
    }

    for (const reward of rewards) {
      await this.inventoryService.awardSpinItemToUser(user, reward);
    }

    return rewards;
  }

  async createSlotWheelItem(dto: CreateSlotWheelDto) {
    switch (dto.type_item) {
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

        return this.slotWheelRepo.save({
          type: dto.type,
          type_item: dto.type_item,
          quantity: dto.quantity,
          weight_point: dto.weight_point,
          item_id: dto.item_id,
        });
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

        return this.slotWheelRepo.save({
          type: dto.type,
          type_item: dto.type_item,
          quantity: dto.quantity,
          weight_point: dto.weight_point,
          food_id: dto.food_id,
        });
      }

      case RewardItemType.PET: {
        if (!dto.pet_id) {
          throw new BadRequestException(
            'pet_id is required when type is PET',
          );
        }
        const pet = await this.petRepo.findOne({
          where: { id: dto.pet_id },
        });
        if (!pet) throw new NotFoundException('Pet not found');

        return this.slotWheelRepo.save({
          type: dto.type,
          type_item: dto.type_item,
          quantity: dto.quantity,
          weight_point: dto.weight_point,
          pet_id: dto.pet_id,
        });
      }

      case RewardItemType.GOLD: {
        return this.slotWheelRepo.save({
          type: dto.type,
          type_item: dto.type_item,
          quantity: dto.quantity,
          weight_point: dto.weight_point,
        });
      }

      case RewardItemType.PLANT: {
        if (!dto.plant_id) {
          throw new BadRequestException('plant_id is required when type is PLANT');
        }
        const plant = await this.plantRepo.findOne({
          where: { id: dto.plant_id },
        });
        if (!plant) throw new NotFoundException('Plant not found');
        return this.slotWheelRepo.save({
          type: dto.type,
          type_item: dto.type_item,
          quantity: dto.quantity,
          weight_point: dto.weight_point,
          plant_id: dto.plant_id,
        });
      }

      default:
        throw new BadRequestException(`Invalid slot wheel item type: ${dto.type_item}`);
    }
  }

  async updateSlotWheelItem(id: string, updateSlotWheelDto: UpdateSlotWheelDto) {
    const slotWheelItem = await this.slotWheelRepo.findOne({
      where: { id },
      relations: ['item', 'food', 'pet', 'plant'],
    });

    if (!slotWheelItem) {
      throw new NotFoundException('Reward Item not found');
    }

    const updated = this.slotWheelRepo.merge(slotWheelItem, updateSlotWheelDto);
    return this.slotWheelRepo.save(updated);
  }

  async deleteSlotWheelItem(id: string) {
    const slotWheel = await this.slotWheelRepo.findOne({ where: { id } });
    if (!slotWheel) throw new NotFoundException('Reward Item not found');

    await this.slotWheelRepo.remove(slotWheel);
  }
}
