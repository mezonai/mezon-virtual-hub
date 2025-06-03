import { configEnv } from '@config/env.config';
import { BaseService } from '@libs/base/base.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { error } from 'node:console';
import { EntityManager, In, Repository } from 'typeorm';
import { AnimalDtoRequest, AnimalDtoResponse, BringPetsDtoList } from './dto/animal.dto';
import { AnimalEntity } from './entity/animal.entity';

@Injectable()
export class AnimalService extends BaseService<AnimalEntity> {
  private readonly catchChanceBase
  constructor(
    @InjectRepository(AnimalEntity)
    private readonly animalRepository: Repository<AnimalEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private manager: EntityManager,
  ) {
    super(animalRepository, AnimalEntity.name);
    this.catchChanceBase = configEnv().CATCH_CHANCE_BASE;
  }

  async getAnimals(user_id: string) {
    const animals = await this.find({ where: { user: { id: user_id } } });
    return plainToInstance(AnimalDtoResponse, animals);
  }

  async getAvailableAnimalsWithRoom(room_code: string) {
    const animals = await this.find({ where: { room_code, is_caught: false } });
    return animals;
  }

  async getAnimalById(id: string) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('Animal not found');
    }
    return item;
  }

  async createAnimal(payload: AnimalDtoRequest) {
    const animal = this.animalRepository.create({
      ...payload,
      room_code: `${payload.map}${payload.sub_map ? `-${payload.sub_map}` : ''}`,
    });

    return await this.save(animal);
  }

  async updateAnimal(updateAnimal: AnimalDtoRequest, animal_id: string) {
    const existedAnimal = await this.animalRepository.findOne({
      where: {
        id: animal_id,
      },
    });

    if (!existedAnimal) {
      throw new NotFoundException(`Animal ${animal_id} not found`);
    }

    Object.assign(existedAnimal, updateAnimal);

    await this.save({
      ...existedAnimal,
      room_code: `${updateAnimal.map}${updateAnimal.sub_map ? `-${updateAnimal.sub_map}` : ''}`,
    });
    return plainToInstance(AnimalDtoResponse, existedAnimal);
  }

  async deleteAnimal(id: string) {
    const result = await this.animalRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Animal not found');
    }
    return { deleted: true };
  }

  async catchAnimal(animal_id: string, user: UserEntity, food_id?: string) : Promise<boolean> {
    const animal = await this.animalRepository.findOne({
      where: {
        id: animal_id,
        is_caught: false,
      },
    });

    if (!animal) {
      return false;
    }

    let foodChanceBonus = 0;

    if (food_id) {
      const inventory = await this.inventoryRepository.findOne({
        where: {
          food: { id: food_id },
          user: { id: user.id },
        },
        relations: ['food'],
      });

      if (inventory?.food && (inventory?.quantity > 0)) {
        foodChanceBonus = inventory.food.catch_rate_bonus
        inventory.quantity -= 1;
        this.inventoryRepository.save(inventory);
      } else {
        error('Food isnt exsited or not enough to feed!');
        return false;
      }
    }

    const randomValue = Math.random() * 100;
    const petCatchChance = animal.catch_chance;
    const chanceToCatch = this.catchChanceBase * foodChanceBonus / petCatchChance * 100;

    if (randomValue <= chanceToCatch) {
      animal.is_caught = true;
      animal.user = user;
      await this.animalRepository.save(animal);
      return true;  
    }

    return false;
  }

  async bringPets(user: UserEntity, { pets: petsDto }: BringPetsDtoList) {
    const allIds = petsDto.map((d) => d.id);
    const existing = await this.animalRepository.find({
      where: { 
        id: In(allIds), 
        user: { id: user.id } 
      },
      select: ['id'],
    });

    if (existing.length !== allIds.length) {
      const foundIds = new Set(existing.map((p) => p.id));
      const missing = allIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Pets not found or not owned: ${missing.join(', ')}`);
    }

    const trueIds  = petsDto.filter((d) => d.is_brought).map((d) => d.id);
    const falseIds = petsDto.filter((d) => !d.is_brought).map((d) => d.id);

    await this.manager.transaction(async (em) => {
      if (trueIds.length) {
        await em.getRepository(AnimalEntity).update(
          { id: In(trueIds), user: { id: user.id } },
          { is_brought: true },
        );
      }
      if (falseIds.length) {
        await em.getRepository(AnimalEntity).update(
          { id: In(falseIds), user: { id: user.id } },
          { is_brought: false },
        );
      }
    });

    return {
      message: 'Pets bring‐status updated.',
      updated: {
        brought:  trueIds,
        unbrought: falseIds,
      },
    };
  }
}
