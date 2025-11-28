import { AnimalRarity } from '@enum';
import { BaseService } from '@libs/base/base.service';
import { PetSkillsService } from '@modules/pet-skills/pet-skills.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PetsDtoRequest } from './dto/pets.dto';
import { PetsEntity } from './entity/pets.entity';

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

  async checkExistedSpecies(species: string, rarity: AnimalRarity) {
    const existedPet = await this.findOne({
      where: { species, rarity },
    });

    if (existedPet) {
      throw new BadRequestException(
        `Pet with Species:'${species}' and Rarity:'${rarity}' is already existed`,
      );
    }
  }

  async createPets(payload: PetsDtoRequest) {
    const { skill_codes, ...pet } = payload;
    await this.checkExistedSpecies(payload.species, payload.rarity);

    const newSpecies = this.create(pet);

    if (skill_codes?.length) {
      const petSkills = await this.petSkillsService.find({
        where: { skill_code: In(skill_codes) },
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
      await this.checkExistedSpecies(payload.species, payload.rarity);
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

    async getById(id: string): Promise<PetsEntity> {
    const pet = await this.findOne({
      where: { id },
      relations: ['pet_skills'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }
    return pet;
  }

}
