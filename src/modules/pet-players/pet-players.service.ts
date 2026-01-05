import { configEnv } from '@config/env.config';
import {
  BASE_EXP_MAP,
  MERGE_PET_DIAMOND_COST,
  RARITY_CARD_REQUIREMENTS,
  RARITY_ORDER,
  STAR_MULTIPLIER,
  UPGRADE_PET_RATES
} from '@constant';
import { AnimalRarity, PetType, SkillCode } from '@enum';
import { BaseService } from '@libs/base/base.service';
import { Logger } from '@libs/logger';
import { getExpForNextLevel, getRarityUpgradeMultiplier, serializeDto } from '@libs/utils';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetSkillsResponseDto } from '@modules/pet-skills/dto/pet-skills.dto';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { error } from 'node:console';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import {
  BattlePetPlayersDto,
  BringPetPlayersDtoList,
  MergedPetPlayerDto,
  MergePetsDto,
  PetPlayersInfoDto,
  PetPlayersWithSpeciesDto,
  SpawnPetPlayersDto,
  UpdateBattleSkillsDto,
  UpdatePetBattleSlotDto,
  UpdatePetPlayersDto,
  UpgradedRarityPetPlayerDto,
} from './dto/pet-players.dto';
import { PetPlayersEntity } from './entity/pet-players.entity';

@Injectable()
export class PetPlayersService extends BaseService<PetPlayersEntity> {
  private readonly catchChanceBase: number;
  private readonly unlockSkillSlot3Level: number;
  private readonly unlockSkillSlot4Level: number;
  constructor(
    @InjectRepository(PetPlayersEntity)
    private readonly petPlayersRepository: Repository<PetPlayersEntity>,
    @InjectRepository(PetsEntity)
    private readonly petsRepository: Repository<PetsEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
    private manager: EntityManager,
    private readonly logger: Logger,
  ) {
    super(petPlayersRepository, PetPlayersEntity.name);
    this.catchChanceBase = configEnv().CATCH_CHANCE_BASE;
    this.unlockSkillSlot3Level = configEnv().PET_UNLOCK_SKILL_SLOT_LEVEL_3;
    this.unlockSkillSlot4Level = configEnv().PET_UNLOCK_SKILL_SLOT_LEVEL_4;
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

  async createPetPlayers(payload: Partial<SpawnPetPlayersDto>, quantity = 1) {
    const pet = await this.petsRepository.findOne({
      where: {
        ...(payload.pet_id
          ? { id: payload.pet_id }
          : {
            species: payload.species,
            type: payload.type,
          }),
      },
      relations: ['skill_usages', 'skill_usages.skill'],
    });

    if (!pet) {
      throw new NotFoundException(
        `Pet ${payload.species} with Rarity: ${payload.current_rarity} and Type ${payload.type} or Id: ${payload.pet_id} not found`,
      );
    }

    if (!pet.skill_usages?.length) {
      throw new BadRequestException(
        `Pet ${payload.species} did not set up any skills`,
      );
    }

    const skill1 = pet.skill_usages.find(
      ({ skill_index }) => skill_index === 1,
    );
    const skill2 = pet.skill_usages.find(
      ({ skill_index }) => skill_index === 2,
    );

    const petPlayers: PetPlayersEntity[] = [];

    for (let i = 0; i < quantity; i++) {
      const newPetPlayer = this.petPlayersRepository.create({
        pet,
        current_rarity: payload.current_rarity,
        name: pet.species,
        skill_slot_1: { skill_code: skill1?.skill.skill_code },
        skill_slot_2: { skill_code: skill2?.skill.skill_code },
        equipped_skill_codes: [
          skill1?.skill.skill_code ?? null,
          skill2?.skill.skill_code ?? null,
        ],
        individual_value: this.generateIndividualValue(),
        room_code: payload.room_code,
        ...(payload.user_id && {
          user: { id: payload.user_id },
          is_caught: true,
        }),
      });
      this.recalculateStats(newPetPlayer);
      petPlayers.push(newPetPlayer);
    }

    return await this.petPlayersRepository.save(petPlayers);
  }

  private async getRandomType(rarity: AnimalRarity) {
    const pets = await this.petsRepository.find({
      where: { rarity },
      select: ['type'],
    });

    if (!pets.length) {
      throw new Error(`No pet found with rarity=${rarity}`);
    }

    return this.randomItem(pets).type;
  }

  private async getRandomSpecies(rarity: AnimalRarity, type: PetType) {
    const pets = await this.petsRepository.find({
      where: { rarity, type },
      select: ['species'],
    });

    if (!pets.length) {
      throw new Error(`No pet found with rarity=${rarity} and type=${type}`);
    }

    return this.randomItem(pets).species;
  }

  async fillMissingPetsByRoom(room_code: string, common: number, rare: number, epic: number, legendary: number) {
    const pets = await this.getAvailablePetPlayersWithRoom(room_code);

    const countByRarity: Record<AnimalRarity, number> = {
      [AnimalRarity.COMMON]: 0,
      [AnimalRarity.RARE]: 0,
      [AnimalRarity.EPIC]: 0,
      [AnimalRarity.LEGENDARY]: 0,
    };

    for (const pet of pets) {
      countByRarity[pet.current_rarity]++;
    }

    const targetRarity = {
      [AnimalRarity.COMMON]: common,
      [AnimalRarity.RARE]: rare,
      [AnimalRarity.EPIC]: epic,
      [AnimalRarity.LEGENDARY]: legendary,
    };

    for (const [rarity, target] of Object.entries(targetRarity)) {
      const current = countByRarity[rarity as AnimalRarity];
      const missing = target - current;

      if (missing <= 0) continue;

      for (let i = 0; i < missing; i++) {
        const randomType = await this.getRandomType(rarity as AnimalRarity);
        const randomSpecies = await this.getRandomSpecies(
          rarity as AnimalRarity,
          randomType as PetType,
        );

        await this.createPetPlayers(
          {
            room_code,
            current_rarity: rarity as AnimalRarity,
            type: randomType as PetType,
            species: randomSpecies,
          },
          1,
        );
      }
    }
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

    this.checkIsValidSkills(petPlayer, equipped_skill_codes);

    return await this.save({ ...petPlayer, equipped_skill_codes });
  }

  checkIsValidSkills(
    petPlayer: PetPlayersEntity,
    equippedSkills: (SkillCode | null)[],
  ) {
    const allowedCodes = [
      petPlayer.skill_slot_1?.skill_code,
      petPlayer.skill_slot_2?.skill_code,
      petPlayer.skill_slot_3?.skill_code,
      petPlayer.skill_slot_4?.skill_code,
    ].filter(Boolean);

    for (const skillCode of equippedSkills) {
      if (skillCode && !allowedCodes.includes(skillCode)) {
        throw new BadRequestException(
          `Skill code ${skillCode} is not assigned to this pet`,
        );
      }
    }
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

  async finalizeBattleResult(winnerIds: string[], loserIds: string[]) {
    const [winners, losers] = await Promise.all([
      this.petPlayersRepository.find({
        where: { id: In(winnerIds) },
        relations: ['pet'],
      }),
      this.petPlayersRepository.find({
        where: { id: In(loserIds) },
        relations: ['pet'],
      }),
    ]);

    if (!winners.length || !losers.length) {
      throw new Error('Invalid battle participants');
    }

    // Calculate total EXP from all losers
    let totalExp = 0;
    for (const loser of losers) {
      const baseExp = this.getBaseExp(loser.pet?.rarity);
      totalExp += this.calculateExp(baseExp, loser.level);
    }

    // Divide EXP evenly among winners
    const expPerWinner = Math.floor(totalExp / winners.length);

    for (const winner of winners) {
      await this.recalculateStats(winner, expPerWinner);
      await this.updateUnlockedSkills(winner);
    }

    // Give losers half of expPerWinner each
    const expPerLoser = Math.floor(expPerWinner / 2);
    for (const loser of losers) {
      await this.recalculateStats(loser, expPerLoser);
      await this.updateUnlockedSkills(loser);
    }

    await this.petPlayersRepository.save([...winners, ...losers]);

    return {
      winners: serializeDto(PetPlayersInfoDto, winners),
      losers: serializeDto(PetPlayersInfoDto, losers),
      expPerLoser,
      expPerWinner,
    };
  }

  private calculateExp(b: number, level: number): number {
    return Math.floor((1.5 * b * level) / 7);
  }

  private getBaseExp(
    rarity?: AnimalRarity | null,
    fallback: number = 20,
  ): number {
    if (!rarity) return fallback;
    return BASE_EXP_MAP[rarity] ?? fallback;
  }

  recalculateStats(petPlayer: PetPlayersEntity, expGain: number = 0) {
    const base = petPlayer.pet; // base stats from pet relation
    if (!base) return;

    const iv = petPlayer.individual_value ?? 0;

    // 1️⃣ Add experience and handle level ups
    petPlayer.exp += expGain;
    while (petPlayer.exp >= getExpForNextLevel(petPlayer.level)) {
      petPlayer.exp -= getExpForNextLevel(petPlayer.level);
      petPlayer.level++;
    }

    const level = petPlayer.level;

    // 2️⃣ Base stat formulas (Pokémon style)
    const hp =
      base.base_hp +
      Math.floor(((base.base_hp * 2 + iv) * level) / 100 + level + 10);
    const attack =
      base.base_attack +
      Math.floor(((base.base_attack * 2 + iv) * level) / 100 + 5);
    const defense =
      base.base_defense +
      Math.floor(((base.base_defense * 2 + iv) * level) / 100 + 5);
    const speed =
      base.base_speed +
      Math.floor(((base.base_speed * 2 + iv) * level) / 100 + 5);

    const rarityMultiplier = getRarityUpgradeMultiplier(
      petPlayer.pet.rarity,
      petPlayer.current_rarity,
      petPlayer.stars,
    );

    const starMultiplier = STAR_MULTIPLIER[petPlayer.stars] ?? 1.0;

    const multiplier = rarityMultiplier * starMultiplier;

    petPlayer.hp = Math.floor(hp * multiplier);
    petPlayer.attack = Math.floor(attack * multiplier);
    petPlayer.defense = Math.floor(defense * multiplier);
    petPlayer.speed = Math.floor(speed * multiplier);
  }

  async updateUnlockedSkills(petPlayer: PetPlayersEntity) {
    const level = petPlayer.level;
    const base = petPlayer.pet;
    if (!base) return;

    // Only check skills if level is high enough
    if (
      level < this.unlockSkillSlot3Level &&
      level < this.unlockSkillSlot4Level
    ) {
      return;
    }

    const pet = await this.petsRepository.findOne({
      where: { id: base.id },
      relations: ['skill_usages', 'skill_usages.skill'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet ${base.id} not found`);
    }

    if (!pet.skill_usages?.length) {
      throw new BadRequestException(
        `Pet ${base.species} did not set up any skills`,
      );
    }

    // Assign skill slots
    const skill3 = pet.skill_usages.find(
      ({ skill_index }) => skill_index === 3,
    )?.skill;

    const skill4 = pet.skill_usages.find(
      ({ skill_index }) => skill_index === 4,
    )?.skill;

    if (skill3 && level >= this.unlockSkillSlot3Level) {
      petPlayer.skill_slot_3 = skill3;
    }

    if (skill4 && level >= this.unlockSkillSlot4Level) {
      petPlayer.skill_slot_4 = skill4;
    }
  }

  async mergePets(
    userId: string,
    dto: MergePetsDto,
  ): Promise<MergedPetPlayerDto> {
    const { pet_ids, keep_highest_iv } = dto;

    return this.dataSource.transaction(async (manager) => {
      // 1. Find pets with a pessimistic lock
      const pets = await manager.getRepository(PetPlayersEntity).find({
        where: { id: In(pet_ids), user: { id: userId } },
        relations: ['pet'],
        lock: { mode: 'pessimistic_write', tables: ['pet_players'] },
      });

      if (pets.length !== 3) {
        throw new BadRequestException(
          'You must provide exactly 3 valid pets belonging to the user.',
        );
      }

      // 3. Choose base pet using the first pet id in payload
      const basePetId = pet_ids[0];
      const basePet = pets.find((p) => p.id === basePetId);

      if (!basePet) {
        throw new BadRequestException(
          `Base pet with id ${basePetId} not found or does not belong to user.`,
        );
      }

      // 4. Validate same pet type
      const petTypeId = basePet.pet.id;
      if (!pets.every((p) => p.pet.id === petTypeId)) {
        throw new BadRequestException('All pets must be of the same type.');
      }

      // 5. Validate same stars
      const baseStars = basePet.stars;
      if (!pets.every((p) => p.stars === baseStars)) {
        throw new BadRequestException(
          'All pets must have the same star level.',
        );
      }

      // 6. Prevent exceeding max stars
      if (baseStars >= 3) {
        throw new BadRequestException('Base pet already has max stars (3).');
      }

      const user = await manager.getRepository(UserEntity).findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write', tables: ['user'] },
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      let updatedDiamond: number = user.diamond;

      // 7. Handle IV + diamonds
      if (keep_highest_iv) {
        const highestIv = Math.max(...pets.map((p) => p.individual_value));

        if (user.diamond < MERGE_PET_DIAMOND_COST) {
          throw new BadRequestException(
            'Not enough diamonds to keep highest IV (requires 10,000).',
          );
        }

        user.diamond -= MERGE_PET_DIAMOND_COST;
        updatedDiamond = user.diamond;
        await manager.getRepository(UserEntity).save(user);
        basePet.individual_value = highestIv;
      }

      const successRate = UPGRADE_PET_RATES[basePet.pet.rarity];
      const roll = Math.random() * 100;

      // 8. Find other two pet ids will be deleted
      const removeIds = pet_ids.slice(1);

      if (roll > successRate) {
        await manager.getRepository(PetPlayersEntity).softDelete(removeIds);

        return plainToInstance(MergedPetPlayerDto, {
          pet: basePet,
          user_diamond: updatedDiamond,
          success: false,
        });
      }

      // 9. Increase stars
      basePet.stars += 1;

      // 10. Recalculate stats
      this.recalculateStats(basePet);

      // 11. Save and remove pet synchronously

      await Promise.all([
        manager.getRepository(PetPlayersEntity).save(basePet),
        manager.getRepository(PetPlayersEntity).softDelete(removeIds),
      ]);

      return plainToInstance(MergedPetPlayerDto, {
        pet: basePet,
        user_diamond: updatedDiamond,
        success: true,
      });
    });
  }

  async upgradePetPlayerRarity(
    userId: string,
    petPlayerId: string,
  ): Promise<UpgradedRarityPetPlayerDto> {
    return this.dataSource.transaction(async (manager) => {
      const petPlayerRepo = manager.getRepository(PetPlayersEntity);
      const inventoryRepo = manager.getRepository(Inventory);

      // 1. Find pet player (with pet relation)
      const petPlayer = await petPlayerRepo.findOne({
        where: { id: petPlayerId, user: { id: userId } },
        relations: ['pet'],
        lock: { mode: 'pessimistic_write', tables: ['pet_players'] },
      });

      if (!petPlayer) {
        throw new NotFoundException('Pet player not found');
      }

      // 2. Must have 3 stars
      if (petPlayer.stars < 3) {
        throw new BadRequestException(
          'Pet must reach 3 stars before upgrading',
        );
      }

      const basePet = petPlayer.pet;
      if (!basePet) {
        throw new BadRequestException('Pet player has no base pet');
      }

      // 3. Determine next rarity
      const currentIdx = RARITY_ORDER.indexOf(petPlayer.current_rarity);
      if (currentIdx === -1 || currentIdx === RARITY_ORDER.length - 1) {
        throw new BadRequestException('Pet is already at max rarity');
      }

      const nextRarity = RARITY_ORDER[currentIdx + 1];

      if (
        RARITY_ORDER.indexOf(nextRarity) >
        RARITY_ORDER.indexOf(basePet.max_rarity)
      ) {
        throw new BadRequestException(
          `This pet cannot be upgraded beyond ${basePet.max_rarity}`,
        );
      }

      // 4. Check required item
      const requiredItemCode = RARITY_CARD_REQUIREMENTS[nextRarity];
      if (!requiredItemCode) {
        throw new BadRequestException(
          `No rarity card requirement defined for ${nextRarity}`,
        );
      }

      // Deduct one card in a separate transaction (committed no matter what)
      const inventoryItem = await inventoryRepo.findOne({
        where: {
          user: { id: userId },
          item: { item_code: requiredItemCode },
          quantity: MoreThan(0),
        },
        relations: ['item'],
        lock: { mode: 'pessimistic_write', tables: ['inventory'] },
      });

      if (!inventoryItem) {
        throw new BadRequestException(
          `You need a ${requiredItemCode} to upgrade to ${nextRarity}`,
        );
      }

      inventoryItem.quantity -= 1;
      await inventoryRepo.save(inventoryItem);
      // Roll success
      const nextRaritySuccessRate = UPGRADE_PET_RATES[nextRarity];
      const roll = Math.random() * 100;

      if (roll > nextRaritySuccessRate) {
        return plainToInstance(UpgradedRarityPetPlayerDto, {
          pet: petPlayer,
          success: false,
        });
      }

      // 6. Apply upgrade
      petPlayer.current_rarity = nextRarity;
      petPlayer.stars = 1;
      this.recalculateStats(petPlayer);

      await petPlayerRepo.save(petPlayer);

      return plainToInstance(UpgradedRarityPetPlayerDto, {
        pet: petPlayer,
        success: true,
      });
    });
  }

  async compensateUpdateRarityPetPlayersToUser(pet_id: string, rarity: AnimalRarity) {
    const petPlayers = await this.petPlayersRepository.find({
      where: {
        pet: { id: pet_id },
        current_rarity: AnimalRarity.COMMON,
      },
      relations: ['user', 'pet'],
    });

    const users: string[] = [];

    if (!petPlayers) {
      throw new NotFoundException(`Pet-player not found for pet ${pet_id}`);
    }

    for (const petPlayer of petPlayers) {
      petPlayer.current_rarity = rarity;

      this.recalculateStats(petPlayer);

      await this.petPlayersRepository.save(petPlayer);
      if (!petPlayer.user?.display_name) throw new NotFoundException(`User not found for pet-player ${petPlayer.user?.display_name}`);
      users.push(petPlayer.user.display_name);
    }

    return { updated: users };
  }

  generateIndividualValue(): number {
    return Math.floor(Math.random() * 31) + 1;
  }

  randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
