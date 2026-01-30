import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetClanEntity } from './entity/pet-clan.entity';
import { BaseService } from '@libs/base/base.service';
import {
  CreatePetClanDto,
  getListPetClansDto,
  UpdatePetClanDto,
} from '@modules/pet-clan/dto/pet-clan.dto';

@Injectable()
export class PetClanService extends BaseService<PetClanEntity> {
  constructor(
    @InjectRepository(PetClanEntity)
    private readonly petClanRepository: Repository<PetClanEntity>,
  ) {
    super(petClanRepository, PetClanEntity.name);
  }

  async createPetClan(dto: CreatePetClanDto) {
    const existingPetClan = await this.petClanRepository.findOne({
      where: { name: dto.name },
    });

    if (existingPetClan) {
      throw new NotFoundException('Pet clan with this name already exists');
    }

    const petClan = this.petClanRepository.create(dto);
    return await this.petClanRepository.save(petClan);
  }

  async getlistPetClans(query: getListPetClansDto) {
    return await this.petClanRepository.find({
      where: { ...query },
      order: { created_at: 'ASC' },
    });
  }

  async getPetClanDetail(petClanId: string) {
    const petClan = await this.petClanRepository.findOne({
      where: { id: petClanId },
    });

    if (!petClan) {
      throw new NotFoundException('Pet clan not found');
    }

    return petClan;
  }

  async updatePetClan(petClanId: string, dto: UpdatePetClanDto,) {
    const petClan = await this.getPetClanDetail(petClanId);

    Object.assign(petClan, dto);

    return this.petClanRepository.save(petClan);
  }

  async deletePetClan(petClanId: string) {
    const petClan = await this.getPetClanDetail(petClanId);

    await this.petClanRepository.remove(petClan);

    return {
      success: true,
      message: 'Pet clan deleted successfully',
    };
  }
}
