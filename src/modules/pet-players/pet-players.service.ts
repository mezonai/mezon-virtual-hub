import { configEnv } from '@config/env.config';
import { BaseService } from '@libs/base/base.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { error } from 'node:console';
import { EntityManager, In, Repository } from 'typeorm';
import {
  SpawnPetPlayersDto,
  PetPlayersDtoResponse,
  BringPetPlayersDtoList,
} from './dto/pet-players.dto';
import { PetPlayersEntity } from './entity/pet-players.entity';
import { PetSpeciesEntity } from '@modules/pet-species/entity/pet-species.entity';

@Injectable()
export class PetPlayerservice extends BaseService<PetPlayersEntity> {
  private readonly catchChanceBase;
  constructor(
    @InjectRepository(PetPlayersEntity)
    private readonly petRepository: Repository<PetPlayersEntity>,
    @InjectRepository(PetSpeciesEntity)
    private readonly petSpeciesRepository: Repository<PetSpeciesEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private manager: EntityManager,
  ) {
    super(petRepository, PetPlayersEntity.name);
    this.catchChanceBase = configEnv().CATCH_CHANCE_BASE;
  }

  async getPetPlayers(user_id: string) {
    const pets = await this.find({
      where: { user: { id: user_id } },
    });
    return plainToInstance(PetPlayersDtoResponse, pets);
  }

  async getAvailablePetPlayersWithRoom(room_code: string) {
    const pets = await this.find({ where: { room_code, is_caught: false } });
    return pets;
  }

  async getPetPlayersById(id: string) {
    const pet = await this.findById(id);
    if (!pet) {
      throw new Error('PetPlayers not found');
    }
    return pet;
  }

  async createPetPlayers(payload: SpawnPetPlayersDto) {
    const petSpecies = await this.petSpeciesRepository.findOne({
      where: { species: payload.species },
    });

    if (!petSpecies) {
      throw new NotFoundException(
        `PetPlayers Species ${payload.species} not found`,
      );
    }

    const pet = this.petRepository.create({
      pet_species: petSpecies,
      individual_value: this.generateIndividualValue(),
      attack: petSpecies.base_attack,
      defense: petSpecies.base_defense,
      hp: petSpecies.base_hp,
      speed: petSpecies.base_speed,
      room_code: `${payload.map}${payload.sub_map ? `-${payload.sub_map}` : ''}`,
    });

    return await this.save(pet);
  }

  async updatePetPlayers(updatePetPlayers: SpawnPetPlayersDto, pet_id: string) {
    const existedPetPlayers = await this.petRepository.findOne({
      where: {
        id: pet_id,
      },
    });

    if (!existedPetPlayers) {
      throw new NotFoundException(`PetPlayers ${pet_id} not found`);
    }

    Object.assign(existedPetPlayers, updatePetPlayers);

    await this.save({
      ...existedPetPlayers,
      room_code: `${updatePetPlayers.map}${updatePetPlayers.sub_map ? `-${updatePetPlayers.sub_map}` : ''}`,
    });
    return plainToInstance(PetPlayersDtoResponse, existedPetPlayers);
  }

  async deletePetPlayers(id: string) {
    const result = await this.petRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('PetPlayers not found');
    }
    return { deleted: true };
  }

  async catchPetPlayers(
    pet_id: string,
    user: UserEntity,
    food_id?: string,
  ): Promise<boolean> {
    const pet = await this.petRepository.findOne({
      where: {
        id: pet_id,
        is_caught: false,
      },
      relations: ['pet_species'],
    });

    if (!pet) {
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

      if (inventory?.food && inventory?.quantity > 0) {
        foodChanceBonus = inventory.food.catch_rate_bonus;
        inventory.quantity -= 1;
        this.inventoryRepository.save(inventory);
      } else {
        error('Food isnt exsited or not enough to feed!');
        return false;
      }
    }

    const randomValue = Math.random() * 100;
    const petCatchChance = pet.pet_species?.catch_chance ?? 10;
    const chanceToCatch =
      ((this.catchChanceBase * foodChanceBonus) / petCatchChance) * 100;

    if (randomValue <= chanceToCatch) {
      pet.is_caught = true;
      pet.user = user;
      await this.petRepository.save(pet);
      return true;
    }

    return false;
  }

  async bringPetPlayers(
    user: UserEntity,
    { pets: petsDto }: BringPetPlayersDtoList,
  ) {
    const allIds = petsDto.map((d) => d.id);
    const existing = await this.petRepository.find({
      where: {
        id: In(allIds),
        user: { id: user.id },
      },
      select: ['id'],
    });

    if (existing.length !== allIds.length) {
      const foundIds = new Set(existing.map((p) => p.id));
      const missing = allIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `PetPlayers not found or not owned: ${missing.join(', ')}`,
      );
    }

    const trueIds = petsDto.filter((d) => d.is_brought).map((d) => d.id);
    const falseIds = petsDto.filter((d) => !d.is_brought).map((d) => d.id);

    await this.manager.transaction(async (em) => {
      if (trueIds.length) {
        await em
          .getRepository(PetPlayersEntity)
          .update(
            { id: In(trueIds), user: { id: user.id } },
            { is_brought: true },
          );
      }
      if (falseIds.length) {
        await em
          .getRepository(PetPlayersEntity)
          .update(
            { id: In(falseIds), user: { id: user.id } },
            { is_brought: false },
          );
      }
    });

    return {
      message: 'PetPlayers bring‐status updated.',
      updated: {
        brought: trueIds,
        unbrought: falseIds,
      },
    };
  }

  generateIndividualValue(): number {
    return Math.floor(Math.random() * 31) + 1;
  }
}
