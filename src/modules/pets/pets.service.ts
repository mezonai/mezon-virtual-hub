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
import { PetsDtoRequest, UpdatePetSkillIndexItemDto } from './dto/pets.dto';
import { PetsEntity } from './entity/pets.entity';
import { PetSkillUsageEntity } from '@modules/pet-skill-usages/entity/pet-skill-usages.entity';

@Injectable()
export class PetsService extends BaseService<PetsEntity> {
  constructor(
    @InjectRepository(PetsEntity)
    private readonly petsRepository: Repository<PetsEntity>,
    @InjectRepository(PetSkillUsageEntity)
    private readonly petSkillUsageRepo: Repository<PetSkillUsageEntity>,
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

  async updateSkillIndexes(petId: string, skills: UpdatePetSkillIndexItemDto[]) {
    const indexes = skills.map(s => s.skill_index);
    if (new Set(indexes).size !== indexes.length) {
      throw new BadRequestException('Duplicate skill_index');
    }

    return await this.petSkillUsageRepo.manager.transaction(async (trx) => {
      for (const skill of skills) {
        await trx.update(
          PetSkillUsageEntity,
          {
            pet: { id: petId },
            skill: { skill_code: skill.skill_code },
          },
          {
            skill_index: skill.skill_index,
          },
        );
      }
    });
  }

  async updatePets(id: string, payload: PetsDtoRequest) {
    const { skill_codes, ...petData } = payload;

    const pet = await this.findOne({
      where: { id },
      relations: ['pet_skills'],
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (payload.species !== pet.species) {
      await this.checkExistedSpecies(payload.species, payload.rarity);
    }

    await this.petsRepository.update(id, petData);

    if (skill_codes) {
      const petSkills = await this.petSkillsService.find({
        where: { skill_code: In(skill_codes) },
      });

      pet.pet_skills = petSkills;
      await this.petsRepository.save(pet);
    }

    return pet;
  }

  async deletePets(id: string) {
    const result = await this.petsRepository.softDelete(id);
    if (result.affected === 0) {
      throw new Error('Pet not found');
    }
    return { deleted: true };
  }
}
