import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WheelEntity } from './entity/wheel.entity';
import { CreateWheelDto, UpdateWheelDto, WheelQueryDto } from './dto/wheel.dto';
import { BaseService } from '@libs/base/base.service';
import { ItemType, RewardItemType, SlotWheelType } from '@enum';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';
import { FOOD_TYPE_ORDER, ITEM_TYPE_ORDER, PET_CARD_RARITY_ORDER, SLOT_TYPE_ORDER } from '@constant/slot-wheel.constant';
import { SlotWheelEntity } from '@modules/slot-wheel/entity/slot-wheel.entity';

@Injectable()
export class WheelService extends BaseService<WheelEntity> {
  constructor(
    @InjectRepository(WheelEntity)
    private readonly wheelRepo: Repository<WheelEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
  ) {
    super(wheelRepo, WheelEntity.name);
  }

  async getAllWheels(query: WheelQueryDto) {
    const wheel = await this.wheelRepo.find({
      where: { ...query },
      relations: ['slots', 'slots.item', 'slots.food', 'slots.pet', 'slots.plant'],
    });

    const recipes = await this.recipeRepo.find({
      where: { ingredients: { item: { type: ItemType.PET_FRAGMENT } } },
      relations: ['ingredients', 'ingredients.item'],
    });

    const fragmentIndexMap = new Map<string, number>();

    for (const recipe of recipes) {
      for (const ing of recipe.ingredients ?? []) {
        if (!ing.item) continue;
        fragmentIndexMap.set(ing.item.id, ing.part);
      }
    }

    for (const w of wheel) {
      const totalWeight = w.slots.reduce(
        (sum, s) => sum + s.weight_point,
        0,
      );

      for (const slot of w.slots) {
        slot['rate'] = (slot.weight_point / totalWeight) * 100;

        if (
          slot.item &&
          slot.item.type === ItemType.PET_FRAGMENT
        ) {
          slot.item['index'] =
            fragmentIndexMap.get(slot.item.id) ?? null;
        }
      }

      w.slots.sort((a, b) => {
        const typeOrderA = this.getSlotTypeOrder(a);
        const typeOrderB = this.getSlotTypeOrder(b);

        if (typeOrderA !== typeOrderB) {
          return typeOrderA - typeOrderB;
        }

        if (a.type_item === 'gold' && b.type_item === 'gold') {
          return a.quantity - b.quantity;
        }

        if (a.food && b.food) {
          return (
            FOOD_TYPE_ORDER[a.food.type] -
            FOOD_TYPE_ORDER[b.food.type]
          );
        }

        if (
          a.item?.type === ItemType.PET_FRAGMENT &&
          b.item?.type === ItemType.PET_FRAGMENT
        ) {
          return (a.item['index'] ?? 0) - (b.item['index'] ?? 0);
        }

        if (
          a.item?.type === ItemType.PET_CARD &&
          b.item?.type === ItemType.PET_CARD
        ) {
          const orderA = PET_CARD_RARITY_ORDER[a.item.item_code!] ?? 999;
          const orderB = PET_CARD_RARITY_ORDER[b.item.item_code!] ?? 999;
          return orderA - orderB;
        }

        if (a.item && b.item) {
          return (
            ITEM_TYPE_ORDER[a.item.type] -
            ITEM_TYPE_ORDER[b.item.type]
          );
        }

        return 0;
      });
    }

    return wheel;
  }

  async getWheelById(id: string) {
    const wheel = await this.wheelRepo.findOne({
      where: { id },
      relations: ['slots', 'slots.item', 'slots.food', 'slots.pet', 'slots.plant'],
    });

    if (!wheel) {
      throw new NotFoundException('Wheel not found');
    }

    for (const slot of wheel.slots) {
      slot["rate"] = (slot.weight_point / wheel.slots.reduce((sum, s) => sum + s.weight_point, 0)) * 100;
    }

    return wheel;
  }

  async createWheel(dto: CreateWheelDto) {
    return this.wheelRepo.save({
      type: dto.type,
      base_fee: dto.base_fee ?? 0,
    });
  }

  async updateWheel(id: string, dto: UpdateWheelDto) {
    const wheel = await this.wheelRepo.findOne({ where: { id } });
    if (!wheel) throw new NotFoundException('Wheel not found');

    const updated = this.wheelRepo.merge(wheel, dto);
    return this.wheelRepo.save(updated);
  }

  async deleteWheel(id: string) {
    const wheel = await this.wheelRepo.findOne({ where: { id } });
    if (!wheel) throw new NotFoundException('Wheel not found');

    await this.wheelRepo.remove(wheel);
  }

  private getSlotTypeOrder(slot: SlotWheelEntity) {
    switch (slot.type_item) {
      case RewardItemType.GOLD:
        return SLOT_TYPE_ORDER.gold;
      case RewardItemType.FOOD:
        return SLOT_TYPE_ORDER.food;
      case RewardItemType.PLANT:
        return SLOT_TYPE_ORDER.plant;
      case RewardItemType.ITEM:
        return SLOT_TYPE_ORDER.item;
      case RewardItemType.PET:
        return SLOT_TYPE_ORDER.pet;
      default:
        return 999;
    }
  }
}
