import { BaseService } from '@libs/base/base.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PetSpeciesDtoRequest } from './dto/pet-species.dto';
import { PetSpeciesEntity } from './entity/pet-species.entity';
import { PetSkillsService } from '@modules/pet-skills/pet-skills.service';

@Injectable()
export class PetSpeciesService extends BaseService<PetSpeciesEntity> {
  constructor(
    @InjectRepository(PetSpeciesEntity)
    private readonly petSpeciesRepository: Repository<PetSpeciesEntity>,
    private readonly petSkillsService: PetSkillsService,
    private manager: EntityManager,
  ) {
    super(petSpeciesRepository, PetSpeciesEntity.name);
  }

  async getAll() {
    const petSpecies = await this.find({ relations: ['pet_skills'] });
    return petSpecies;
  }

  async checkExistedSpecies(species: string) {
    const existedPet = await this.findOne({
      where: { species },
    });

    if (existedPet) {
      throw new BadRequestException(
        `Pet species '${species}' is already existed`,
      );
    }
  }

  async createPetSpecies(payload: PetSpeciesDtoRequest) {
    await this.checkExistedSpecies(payload.species);

    const newSpecies = this.create(payload);

    if (payload.skill_codes?.length) {
      const petSkills = await this.petSkillsService.find({
        where: { skill_code: In(payload.skill_codes) },
      });
      newSpecies.pet_skills = petSkills;
    }

    return await this.save(newSpecies);
  }

  async updatePetSpecies(id: string, payload: PetSpeciesDtoRequest) {
    const petSpecies = await this.findOne({
      where: { id },
    });

    if (!petSpecies) {
      throw new NotFoundException(`Pet species not found`);
    }

    if (payload.species !== petSpecies.species) {
      await this.checkExistedSpecies(payload.species);
    }

    await this.petSpeciesRepository.update(id, payload);

    Object.assign(petSpecies, payload);
    return petSpecies;
  }

  async deletePetSpecies(id: string) {
    const result = await this.petSpeciesRepository.softDelete(id);
    if (result.affected === 0) {
      throw new Error('Pet species not found');
    }
    return { deleted: true };
  }
}
