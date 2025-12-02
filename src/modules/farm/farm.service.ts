import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmEntity } from './entity/farm.entity';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';
import {FarmResponseDto, UpdateSlotDto} from './dto/farm.dto';

@Injectable()
export class FarmService {
  constructor(
    @InjectRepository(FarmEntity)
    private readonly farmRepo: Repository<FarmEntity>,
    @InjectRepository(FarmSlotEntity)
    private readonly slotRepo: Repository<FarmSlotEntity>,
  ) {}

  async getFarmByClan(clan_id: string): Promise<FarmEntity> {
    if (!clan_id) throw new NotFoundException('clan_id is required');
    const farm = await this.farmRepo.findOne({
      where: { clan_id },
      relations: ['slots'],
    });
    if (!farm) {
      throw new NotFoundException(`Farm for clan_id ${clan_id} not found`);
    }
    farm.slots.sort((a, b) => a.slot_index - b.slot_index);
    return farm;
  }

  async getFarmById(id: string): Promise<FarmEntity> {
    const farm = await this.farmRepo.findOne({
      where: { id },
      relations: ['slots'],
    });
    if (!farm) throw new NotFoundException(`Farm with id ${id} not found`);
    return farm;
  }

  async updateSlotFarm(
    farm_id: string,
    dto: UpdateSlotDto,
  ): Promise<FarmResponseDto> {
    const farm = await this.getFarmById(farm_id);
    const newSlotCount = dto.quantity_slot;

    if (newSlotCount === undefined) {
      throw new BadRequestException('quantity_slot is required');
    }

    const currentSlotCount = farm.slots.length;

    if (newSlotCount > currentSlotCount) {
      const slotsToAdd: FarmSlotEntity[] = [];

      for (let i = currentSlotCount; i < newSlotCount; i++) {
        const newSlot = this.slotRepo.create({
          slot_index: i,
          farm,
        });
        slotsToAdd.push(newSlot);
      }

      if (slotsToAdd.length > 0) {
        const savedSlots = await this.slotRepo.save(slotsToAdd);
        farm.slots.push(...savedSlots);
      }
    }

    if (newSlotCount < currentSlotCount) {
      const slotsToRemove = farm.slots
        .sort((a, b) => b.slot_index - a.slot_index)
        .slice(0, currentSlotCount - newSlotCount);

      if (slotsToRemove.length > 0) {
        await this.slotRepo.remove(slotsToRemove);
        farm.slots = farm.slots.filter((s) => !slotsToRemove.includes(s));
      }
    }

    farm.quantity_slot = newSlotCount;
    const updatedFarm = await this.farmRepo.save(farm);

    return {
      id: updatedFarm.id,
      clan_id: updatedFarm.clan_id,
      name: updatedFarm.name,
      quantity_slot: updatedFarm.quantity_slot,
      slots: updatedFarm.slots.map((slot) => ({
        id: slot.id,
        slot_index: slot.slot_index,
        current_slot_plant_id: slot.current_slot_plant_id ?? null,
      })),
    };
  }
}
