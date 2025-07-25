import { BaseService } from '@libs/base/base.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PetsDtoRequest } from './dto/pets.dto';
import { PetsEntity } from './entity/pets.entity';
import { PetSkillsService } from '@modules/pet-skills/pet-skills.service';

@Injectable()
export class PetsService extends BaseService<PetsEntity> {
  constructor(
    @InjectRepository(PetsEntity)
    private readonly petsRepository: Repository<PetsEntity>,
    private readonly petSkillsService: PetSkillsService,
    private manager: EntityManager,
  ) {
    super(petsRepository, PetsEntity.name);
  }

  async getAll() {
    const pets = await this.find({ relations: ['pet_skills'] });
    return pets;
  }

  async checkExistedSpecies(species: string) {
    const existedPet = await this.findOne({
      where: { species },
    });

    if (existedPet) {
      throw new BadRequestException(
        `Pet '${species}' is already existed`,
      );
    }
  }

  async createPets(payload: PetsDtoRequest) {
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

  async updatePets(id: string, payload: PetsDtoRequest) {
    const pets = await this.findOne({
      where: { id },
    });

    if (!pets) {
      throw new NotFoundException(`Pet not found`);
    }

    if (payload.species !== pets.species) {
      await this.checkExistedSpecies(payload.species);
    }

    await this.petsRepository.update(id, payload);

    Object.assign(pets, payload);
    return pets;
  }

  async deletePets(id: string) {
    const result = await this.petsRepository.softDelete(id);
    if (result.affected === 0) {
      throw new Error('Pet not found');
    }
    return { deleted: true };
  }
}
