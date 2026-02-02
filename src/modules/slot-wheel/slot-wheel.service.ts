import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSlotWheelDto, SlotWheelQueryDto, UpdateSlotWheelDto } from '@modules/slot-wheel/dto/slot-wheel.dto';
import { BaseService } from '@libs/base/base.service';
import { SlotWheelEntity } from '@modules/slot-wheel/entity/slot-wheel.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemType, QuestType, RewardItemType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { InventoryService } from '@modules/inventory/inventory.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { WheelEntity } from '@modules/wheel/entity/wheel.entity';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';
import { QuestEventEmitter } from '@modules/player-quest/events/quest.events';

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

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(WheelEntity)
    private readonly wheelRepo: Repository<WheelEntity>,

    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,

    private readonly inventoryService: InventoryService,
  ) {
    super(slotWheelRepo, SlotWheelEntity.name);
  }

  async getAll(query: SlotWheelQueryDto) {
    const slotWheelItems = await this.slotWheelRepo.find({
      where: { ...query },
      relations: ['item', 'food', 'pet', 'plant'],
    });

    for (const slot of slotWheelItems) {
      slot["rate"] = (slot.weight_point / slotWheelItems.reduce((sum, s) => sum + s.weight_point, 0)) * 100;
    }

    return slotWheelItems;
  }

  async spinWheel(user: UserEntity, wheelId: string, quantity = 1) {
    const wheel = await this.wheelRepo.findOne({
      where: { id: wheelId },
    });

    if (!wheel) {
      throw new NotFoundException('Wheel not found');
    }

    if (user.gold < wheel.base_fee * quantity) {
      throw new BadRequestException('Not enough gold');
    }

    const slots = await this.slotWheelRepo.find({
      where: { wheel_id: wheelId },
      relations: ['item', 'food', 'pet', 'plant'],
    });

    if (!slots.length) {
      throw new NotFoundException('No slot wheel items found');
    }

    const totalWeight = slots.reduce(
      (sum, s) => sum + s.weight_point,
      0,
    );

    if (totalWeight <= 0) {
      throw new BadRequestException('Invalid weight config');
    }

    const rewards: SlotWheelEntity[] = [];

    for (let i = 0; i < quantity; i++) {
      const random = Math.random() * totalWeight;

      let current = 0;
      for (const slot of slots) {
        current += slot.weight_point;
        if (random <= current) {
          rewards.push(slot);
          break;
        }
      }
    }
    const fragmentIndexMap = new Map<string, number>();

    const fragmentRecipes = await this.recipeRepo.find({
      where: { ingredients: { item: { type: ItemType.PET_FRAGMENT } } },
      relations: ['ingredients', 'ingredients.item'],
    });

    for (const recipe of fragmentRecipes) {
      for (const ing of recipe.ingredients ?? []) {
        if (!ing.item) continue;
        
        fragmentIndexMap.set(ing.item.id, ing.part);
      }
    }

    for (const reward of rewards) {
      if (!reward) {
        throw new NotFoundException('Reward item not found');
      }

      if (reward.item?.type === ItemType.PET_FRAGMENT) {
        const index = fragmentIndexMap.get(reward.item.id);
        reward.item['index'] = index;
      }
    }

    await this.inventoryService.awardSpinItemToUser(user, rewards);

    user.gold -= wheel.base_fee * quantity;
    await this.userRepository.save(user);

    QuestEventEmitter.emitProgress(user.id, QuestType.SPIN_LUCKY_WHEEL, quantity);

    return {
      wheel_type: wheel.type,
      rewards,
      user_balance: user.gold,
    };
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
          wheel_id: dto.wheel_id,
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
          wheel_id: dto.wheel_id,
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
          wheel_id: dto.wheel_id,
          type_item: dto.type_item,
          quantity: dto.quantity,
          weight_point: dto.weight_point,
          pet_id: dto.pet_id,
        });
      }

      case RewardItemType.GOLD: {
        return this.slotWheelRepo.save({
          wheel_id: dto.wheel_id,
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
          wheel_id: dto.wheel_id,
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
