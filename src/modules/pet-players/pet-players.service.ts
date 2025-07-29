import { configEnv } from '@config/env.config';
import { MAX_EQUIPPED_PETS_FOR_BATTLE } from '@constant';
import { BaseService } from '@libs/base/base.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetSkillsService } from '@modules/pet-skills/pet-skills.service';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { error } from 'node:console';
import { EntityManager, FindOptionsWhere, In, Repository } from 'typeorm';
import {
  BringPetPlayersDtoList,
  PetPlayersInfoDto,
  PetPlayersWithSpeciesDto,
  SelectPetPlayersListDto,
  SpawnPetPlayersDto,
  UpdatePetPlayersDto,
} from './dto/pet-players.dto';
import { PetPlayersEntity } from './entity/pet-players.entity';
import { PetSkillUsageEntity } from '@modules/pet-skill-usages/entity/pet-skill-usages.entity';

const SELECTED_PETS_FOR_BATTLE = 3;

@Injectable()
export class PetPlayersService extends BaseService<PetPlayersEntity> {
  private readonly catchChanceBase;
  constructor(
    @InjectRepository(PetPlayersEntity)
    private readonly petPlayersRepository: Repository<PetPlayersEntity>,
    @InjectRepository(PetsEntity)
    private readonly petsRepository: Repository<PetsEntity>,
    @InjectRepository(PetSkillUsageEntity)
    private readonly skillUsagesRepository: Repository<PetSkillUsageEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private manager: EntityManager,
  ) {
    super(petPlayersRepository, PetPlayersEntity.name);
    this.catchChanceBase = configEnv().CATCH_CHANCE_BASE;
  }

  async findPetPlayersByUserId(user_id: string) {
    const pets = await this.find({
      where: { user: { id: user_id } },
      relations: [
        'pet',
        'skill_slot_1',
        'skill_slot_2',
        'skill_slot_3',
        'skill_slot_4',
      ],
    });

    return plainToInstance(PetPlayersInfoDto, pets);
  }

  async findPetPlayersWithPet(where: FindOptionsWhere<PetPlayersEntity>) {
    const pets = await this.find({
      where,
      relations: ['pet'],
    });

    return plainToInstance(PetPlayersInfoDto, pets, {});
  }

  async getAvailablePetPlayersWithRoom(room_code: string) {
    const pets = await this.findPetPlayersWithPet({
      room_code,
      is_caught: false,
    });
    return pets;
  }

  async getPetPlayersById(id: string) {
    const pet = await this.findPetPlayersWithPet({ id });
    if (!pet) {
      throw new Error('Pet-player not found');
    }
    return pet;
  }

  async createPetPlayers(payload: SpawnPetPlayersDto) {
    const pet = await this.petsRepository.findOne({
      where: { species: payload.species, rarity: payload.rarity },
    });

    if (!pet) {
      throw new NotFoundException(
        `Pet ${payload.species} with rarity is ${payload.rarity} not found`,
      );
    }

    const petPlayer = this.petPlayersRepository.create({
      pet,
      // skill_slot_1,skill_slot_2
      individual_value: this.generateIndividualValue(),
      attack: pet.base_attack,
      defense: pet.base_defense,
      hp: pet.base_hp,
      speed: pet.base_speed,
      room_code: `${payload.map}${payload.sub_map ? `-${payload.sub_map}` : ''}`,
    });

    return await this.save(petPlayer);
  }

  async updatePetPlayers(
    updatePetPlayers: UpdatePetPlayersDto,
    pet_id: string,
  ) {
    const existedPetPlayers = await this.petPlayersRepository.findOne({
      where: {
        id: pet_id,
      },
    });

    if (!existedPetPlayers) {
      throw new NotFoundException(`Pet-player ${pet_id} not found`);
    }

    Object.assign(existedPetPlayers, updatePetPlayers);

    await this.petPlayersRepository.update(pet_id, {
      ...updatePetPlayers,
      room_code: `${updatePetPlayers.map}${updatePetPlayers.sub_map ? `-${updatePetPlayers.sub_map}` : ''}`,
    });
    return plainToInstance(PetPlayersWithSpeciesDto, existedPetPlayers);
  }

  async deletePetPlayers(id: string) {
    const result = await this.petPlayersRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Pet-player not found');
    }
    return { deleted: true };
  }

  async catchPetPlayers(
    pet_id: string,
    user: UserEntity,
    food_id?: string,
  ): Promise<boolean> {
    const pet = await this.petPlayersRepository.findOne({
      where: {
        id: pet_id,
        is_caught: false,
      },
      relations: ['pet'],
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
        error('Food isnt existed or not enough to feed!');
        return false;
      }
    }

    const randomValue = Math.random() * 100;
    const petCatchChance = pet.pet?.catch_chance ?? 10;
    const chanceToCatch =
      ((this.catchChanceBase * foodChanceBonus) / petCatchChance) * 100;

    if (randomValue <= chanceToCatch) {
      pet.is_caught = true;
      pet.user = user;
      await this.petPlayersRepository.save(pet);
      return true;
    }

    return false;
  }

  async bringPetPlayers(
    user: UserEntity,
    { pets: petsDto }: BringPetPlayersDtoList,
  ) {
    const allIds = petsDto.map((d) => d.id);
    const existing = await this.petPlayersRepository.find({
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
        `Pet-player not found or not owned: ${missing.join(', ')}`,
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
      message: 'Pet-players bring‐status updated.',
      updated: {
        brought: trueIds,
        unbrought: falseIds,
      },
    };
  }

  async selectPetPlayers(
    user: UserEntity,
    { pets: petsDto }: SelectPetPlayersListDto,
  ) {
    const allIds = petsDto.map((d) => d.id);
    const existing = await this.petPlayersRepository.find({
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
        `Pet-player not found or not owned: ${missing.join(', ')}`,
      );
    }

    const trueIds = petsDto
      .filter((d) => d.is_selected_battle)
      .map((d) => d.id);
    const falseIds = petsDto
      .filter((d) => !d.is_selected_battle)
      .map((d) => d.id);

    if (trueIds.length > MAX_EQUIPPED_PETS_FOR_BATTLE) {
      throw new BadRequestException(
        `You can only equip up to ${MAX_EQUIPPED_PETS_FOR_BATTLE} pet-players for battle. You selected ${trueIds.length}.`,
      );
    }

    await this.manager.transaction(async (em) => {
      if (trueIds.length) {
        await em
          .getRepository(PetPlayersEntity)
          .update(
            { id: In(trueIds), user: { id: user.id } },
            { is_selected_battle: true },
          );
      }
      if (falseIds.length) {
        await em
          .getRepository(PetPlayersEntity)
          .update(
            { id: In(falseIds), user: { id: user.id } },
            { is_selected_battle: false },
          );
      }
    });

    return {
      message: 'Pet-players selected‐status updated.',
      updated: {
        selected: trueIds,
      },
    };
  }

  async selectOnePetPlayer(
    user: UserEntity,
    petId: string,
    isSelected: boolean = true,
  ) {
    const petPlayer = await this.findOne({
      where: {
        id: petId,
        user: { id: user.id },
      },
    });

    if (!petPlayer) {
      throw new NotFoundException('Pet-player not found');
    }

    await this.petPlayersRepository.update(petId, {
      is_selected_battle: isSelected,
    });
  }

  // async unlockSkills(
  //   user: UserEntity,
  //   pet_player_id: string,
  //   { unlocked_skill_indexes }: PetPlayerSkillsDto,
  // ) {
  //   if (
  //     !Array.isArray(unlocked_skill_indexes) ||
  //     unlocked_skill_indexes.length === 0
  //   ) {
  //     throw new BadRequestException('No skills provided for unlocking.');
  //   }

  //   const petPlayer = await this.findOne({
  //     where: {
  //       id: pet_player_id,
  //       user: { id: user.id },
  //     },
  //   });

  //   if (!petPlayer) {
  //     throw new NotFoundException('Pet-player not found or not owned by user.');
  //   }

  //   const currentSkills = petPlayer.unlocked_skill_indexes ?? [];
  //   const maxSkills =
  //     2 + (petPlayer.level >= 40 ? 1 : 0) + (petPlayer.level >= 70 ? 1 : 0);

  //   if (currentSkills.length >= maxSkills) {
  //     throw new BadRequestException(
  //       `All available skill slots are already used. Level ${petPlayer.level} allows max ${maxSkills} skills.`,
  //     );
  //   }

  //   const newSkills = unlocked_skill_indexes.filter(
  //     (code) => !currentSkills.includes(code),
  //   );

  //   const totalSkills = currentSkills.length + newSkills.length;
  //   if (totalSkills > maxSkills) {
  //     throw new BadRequestException(
  //       `You can only unlock ${maxSkills - currentSkills.length} more skill(s) at level ${petPlayer.level}.`,
  //     );
  //   }

  //   petPlayer.unlocked_skill_indexes = [...currentSkills, ...newSkills];

  //   await this.save(petPlayer);

  //   return {
  //     message: 'Skills successfully unlocked.',
  //     skills: petPlayer.unlocked_skill_indexes,
  //   };
  // }

  generateIndividualValue(): number {
    return Math.floor(Math.random() * 31) + 1;
  }
}
