import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WheelEntity } from './entity/wheel.entity';
import { CreateWheelDto, UpdateWheelDto, WheelQueryDto } from './dto/wheel.dto';
import { BaseService } from '@libs/base/base.service';
import { ItemType } from '@enum';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';

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
      for (const slot of w.slots) {
        slot["rate"] = (slot.weight_point / w.slots.reduce((sum, s) => sum + s.weight_point, 0)) * 100;

        if (slot.item && slot.item.type === ItemType.PET_FRAGMENT) {
          slot.item['index'] = fragmentIndexMap.get(slot.item.id);
        }
      }
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
}
