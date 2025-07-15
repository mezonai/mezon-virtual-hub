import { BaseService } from '@libs/base/base.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PetSkillsEntity } from './entity/pet-skills.entity';
import { CreatePetSkillsDto, UpdatePetSkillsDto } from './dto/pet-skills.dto';

@Injectable()
export class PetSkillsService extends BaseService<PetSkillsEntity> {
  constructor(
    @InjectRepository(PetSkillsEntity)
    private readonly petSkillsRepository: Repository<PetSkillsEntity>,
    private manager: EntityManager,
  ) {
    super(petSkillsRepository, PetSkillsEntity.name);
  }

  async getAll() {
    const petSkills = await this.find();
    return petSkills;
  }

  async checkExistedSkills(skill: string) {
    const existedPet = await this.findOne({
      where: { skill_code: skill },
    });

    if (existedPet) {
      throw new BadRequestException(`Pet skills '${skill}' is already existed`);
    }
  }

  async createPetSkills(payload: CreatePetSkillsDto) {
    await this.checkExistedSkills(payload.skill_code);

    const newSkills = this.create(payload);

    return await this.save(newSkills);
  }

  async updatePetSkills(skill_code: string, payload: UpdatePetSkillsDto) {
    const petSkills = await this.findOne({
      where: { skill_code },
    });

    if (!petSkills) {
      throw new NotFoundException(`Pet skills not found`);
    }

    await this.petSkillsRepository.update(skill_code, payload);

    Object.assign(petSkills, payload);
    return petSkills;
  }

  async deletePetSkills(id: string) {
    const result = await this.petSkillsRepository.softDelete(id);
    if (result.affected === 0) {
      throw new Error('Pet skills not found');
    }
    return { deleted: true };
  }
}
