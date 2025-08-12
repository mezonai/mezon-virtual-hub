import { configEnv } from '@config/env.config';
import { BaseService } from '@libs/base/base.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetSkillUsageEntity } from '@modules/pet-skill-usages/entity/pet-skill-usages.entity';
import { PetSkillsResponseDto } from '@modules/pet-skills/dto/pet-skills.dto';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { error } from 'node:console';
import { EntityManager, FindOptionsWhere, In, Not, Repository } from 'typeorm';
import {
  BattlePetPlayersDto,
  BringPetPlayersDtoList,
  PetPlayersInfoDto,
  PetPlayersWithSpeciesDto,
  SpawnPetPlayersDto,
  UpdateBattleSkillsDto,
  UpdatePetBattleSlotDto,
  UpdatePetPlayersDto,
} from './dto/pet-players.dto';
import { PetPlayersEntity } from './entity/pet-players.entity';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';

const SELECTED_PETS_FOR_BATTLE = 3;

@Injectable()
export class PetPlayersService extends BaseService<PetPlayersEntity> {
  private readonly catchChanceBase;
  constructor(
    @InjectRepository(PetPlayersEntity)
    private readonly petPlayersRepository: Repository<PetPlayersEntity>,
    @InjectRepository(PetsEntity)
    private readonly petsRepository: Repository<PetsEntity>,
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

  async createPetPlayers(payload: SpawnPetPlayersDto, quantity = 1) {
    const pet = await this.petsRepository.findOne({
      where: { species: payload.species, rarity: payload.rarity },
      relations: ['skill_usages', 'skill_usages.skill'],
    });

    if (!pet) {
      throw new NotFoundException(
        `Pet ${payload.species} with rarity ${payload.rarity} not found`,
      );
    }

    if (!pet.skill_usages?.length) {
      throw new BadRequestException(
        `Pet ${payload.species} did not set up any skills`,
      );
    }

    const skill1 = pet.skill_usages.find(({ skill_index }) => skill_index === 1);
    const skill2 = pet.skill_usages.find(({ skill_index }) => skill_index === 2);

    const petPlayers: PetPlayersEntity[] = [];

    for (let i = 0; i < quantity; i++) {
      petPlayers.push(
        this.petPlayersRepository.create({
          pet,
          skill_slot_1: { skill_code: skill1?.skill.skill_code },
          skill_slot_2: { skill_code: skill2?.skill.skill_code },
          individual_value: this.generateIndividualValue(),
          attack: pet.base_attack,
          defense: pet.base_defense,
          hp: pet.base_hp,
          speed: pet.base_speed,
          room_code: `${payload.map}${payload.sub_map ? `-${payload.sub_map}` : ''}`,
        }),
      );
    }

    return await this.petPlayersRepository.save(petPlayers);
  }

  async updatePetPlayers(
    updatePetPlayers: UpdatePetPlayersDto,
    pet_id: string,
  ) {
    const { map, sub_map, ...restUpdate } = updatePetPlayers;
    const existedPetPlayers = await this.petPlayersRepository.findOne({
      where: {
        id: pet_id,
      },
    });

    if (!existedPetPlayers) {
      throw new NotFoundException(`Pet-player ${pet_id} not found`);
    }

    Object.assign(existedPetPlayers, updatePetPlayers);

    const updatedPet = await this.petPlayersRepository.save({
      ...existedPetPlayers,
      ...restUpdate,
      room_code: `${map}${sub_map ? `-${sub_map}` : ''}`,
    });

    return plainToInstance(PetPlayersWithSpeciesDto, updatedPet);
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

  async bulkUpdateBattleSlots(
    userId: string,
    petsToUpdate: UpdatePetBattleSlotDto[],
  ) {
    const assignedSlots = new Map<number, string>();

    for (const { id, battle_slot } of petsToUpdate) {
      if (battle_slot > 0) {
        if (assignedSlots.has(battle_slot)) {
          throw new ConflictException(
            `Duplicate battle_slot ${battle_slot} in request for pets ${assignedSlots.get(
              battle_slot,
            )} and ${id}`,
          );
        }
        assignedSlots.set(battle_slot, id);
      }
    }

    const petIds = petsToUpdate.map((p) => p.id);

    const userPets = await this.find({
      where: {
        id: In(petIds),
        user: { id: userId },
      },
    });

    if (userPets.length !== petsToUpdate.length) {
      throw new NotFoundException(`Pet-player not found or not owned`);
    }

    const dbConflicts = await this.find({
      where: {
        user: { id: userId },
        battle_slot: In([...assignedSlots.keys()]),
        id: Not(In(petIds)),
      },
    });

    if (dbConflicts.length > 0) {
      const used = dbConflicts.map((c) => c.battle_slot).join(', ');
      throw new ConflictException(`Battle slot(s) ${used} already assigned`);
    }

    const updateMap = new Map(petsToUpdate.map((p) => [p.id, p.battle_slot]));
    for (const pet of userPets) {
      pet.battle_slot = updateMap.get(pet.id) ?? 0;
    }

    return await this.saveAll(userPets);
  }

  async selectOnePetPlayer(
    user: UserEntity,
    petId: string,
    battleSlot: number = 0,
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

    const dbConflicts = await this.find({
      where: {
        user: { id: user.id },
        battle_slot: battleSlot,
      },
    });

    if (dbConflicts.length > 0) {
      const used = dbConflicts.map((c) => c.battle_slot).join(', ');
      throw new ConflictException(`Battle slot(s) ${used} already assigned`);
    }

    await this.petPlayersRepository.update(petId, {
      battle_slot: battleSlot,
    });
  }

  async updateSelectedBattleSkills(
    user: UserEntity,
    { equipped_skill_codes }: UpdateBattleSkillsDto,
    petId: string,
  ) {
    const petPlayer = await this.findOne({
      where: {
        id: petId,
        user: { id: user.id },
      },
      relations: [
        'skill_slot_1',
        'skill_slot_2',
        'skill_slot_3',
        'skill_slot_4',
      ],
    });

    if (!petPlayer) {
      throw new NotFoundException('Pet-player not found');
    }

    const allowedCodes = [
      petPlayer.skill_slot_1?.skill_code,
      petPlayer.skill_slot_2?.skill_code,
      petPlayer.skill_slot_3?.skill_code,
      petPlayer.skill_slot_4?.skill_code,
    ].filter(Boolean);

    for (const skillCode of equipped_skill_codes) {
      if (skillCode && !allowedCodes.includes(skillCode)) {
        throw new BadRequestException(
          `Skill code ${skillCode} is not assigned to this pet`,
        );
      }
    }

    return await this.save({ ...petPlayer, equipped_skill_codes });
  }

  async getPetsForBattle(userId: string) {
    const petPlayers = await this.find({
      where: {
        user: { id: userId },
        battle_slot: Not(0),
      },
      relations: [
        'skill_slot_1',
        'skill_slot_2',
        'skill_slot_3',
        'skill_slot_4',
        'pet',
      ],
      order: {
        battle_slot: 'ASC',
      },
    });

    const battlePets = petPlayers.map((pet) => {
      const equippedCodes = pet.equipped_skill_codes || [];

      const allSkills = [
        pet.skill_slot_1,
        pet.skill_slot_2,
        pet.skill_slot_3,
        pet.skill_slot_4,
      ].filter(Boolean) as PetSkillsResponseDto[];

      const equippedSkills = allSkills.filter((skill) =>
        equippedCodes.includes(skill?.skill_code),
      );

      return {
        ...pet,
        equipped_skills: equippedSkills,
      };
    });

    return plainToInstance(BattlePetPlayersDto, battlePets);
  }

  generateIndividualValue(): number {
    return Math.floor(Math.random() * 31) + 1;
  }
}
