import { BaseService } from '@libs/base/base.service';
import { PetPlayersEntity } from '@modules/pet-players/entity/pet-players.entity';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '@types';
import { plainToInstance } from 'class-transformer';
import { isNumber } from 'class-validator';
import { EntityManager, FindOptionsWhere, ILike, Repository } from 'typeorm';
import {
  PetPlayersInfoDto,
  PetPlayersListDto,
  PetPlayersQueryDto,
  SpawnPetPlayersDto,
  UpdatePetPlayersDto,
} from './dto/pet-players.dto';

@Injectable()
export class AdminPetPlayersService extends BaseService<PetPlayersEntity> {
  constructor(
    @InjectRepository(PetPlayersEntity)
    private readonly petPlayersRepository: Repository<PetPlayersEntity>,
    @InjectRepository(PetsEntity)
    private readonly petsRepository: Repository<PetsEntity>,
    private readonly petPlayersService: PetPlayersService,
    private readonly userService: UserService,
    private manager: EntityManager,
  ) {
    super(petPlayersRepository, PetPlayersEntity.name);
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

  async getPetPlayerList(query: PetPlayersQueryDto) {
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      order = 'DESC',
      search,
      is_caught,
      pet_type,
      rarity,
      species,
    } = query;

    const orConditions: FindOptionsWhere<PetPlayersEntity>[] = [];

    const petConditions: FindOptionsWhere<PetsEntity> = {};
    if (pet_type) petConditions.type = pet_type;
    if (rarity) petConditions.rarity = rarity;
    if (species) petConditions.species = ILike(`%${species}%`);

    const commonConditions: FindOptionsWhere<PetPlayersEntity> = {
      ...(isNumber(search) ? { level: +search } : {}),
      ...(isNumber(search) ? { stars: +search } : {}),
      ...(is_caught !== undefined ? { is_caught } : {}),
      ...(Object.keys(petConditions).length > 0 ? { pet: petConditions } : {}),
    };

    if (search) {
      orConditions.push(
        { name: ILike(`%${search}%`), ...commonConditions },
        { user: { username: ILike(`%${search}%`) }, ...commonConditions },
      );
    }

    const [pets, total] = await this.petPlayersRepository.findAndCount({
      where: orConditions.length > 0 ? orConditions : commonConditions,
      relations: ['pet', 'user'],
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sort_by]: order,
      },
    });

    const transformedPets = plainToInstance(PetPlayersListDto, pets);

    return new Pageable(transformedPets, {
      size: limit,
      page,
      total,
    });
  }

  async getOnePetPlayer(id: string) {
    const pet = await this.findOne({
      where: { id },
      relations: [
        'pet',
        'user',
        'skill_slot_1',
        'skill_slot_2',
        'skill_slot_3',
        'skill_slot_4',
      ],
    });

    if (!pet) {
      throw new NotFoundException('Pet-player not found');
    }

    return plainToInstance(PetPlayersInfoDto, pet);
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

  async createPetPlayers(payload: Partial<SpawnPetPlayersDto>, quantity = 1) {
    const pet = await this.petsRepository.findOne({
      where: {
        species: payload.species,
        rarity: payload.rarity,
        type: payload.type,
      },
      relations: ['skill_usages', 'skill_usages.skill'],
    });

    if (!pet) {
      throw new NotFoundException(
        `Pet ${payload.species} with Rarity: ${payload.rarity} and Type ${payload.type} not found`,
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
        name: pet.species,
        skill_slot_1: { skill_code: skill1?.skill.skill_code },
        skill_slot_2: { skill_code: skill2?.skill.skill_code },
        equipped_skill_codes: [
          skill1?.skill.skill_code ?? null,
          skill2?.skill.skill_code ?? null,
        ],
        individual_value: this.petPlayersService.generateIndividualValue(),
        room_code: payload.room_code,
      });
      this.petPlayersService.recalculateStats(newPetPlayer);
      petPlayers.push(newPetPlayer);
    }

    return await this.petPlayersRepository.save(petPlayers);
  }

  async updatePetPlayers(
    updatePetPlayers: UpdatePetPlayersDto,
    pet_id: string,
  ) {
    const { user, ...payload } = updatePetPlayers;
    const existedPetPlayers = await this.petPlayersRepository.findOne({
      where: {
        id: pet_id,
      },
      relations: [
        'skill_slot_1',
        'skill_slot_2',
        'skill_slot_3',
        'skill_slot_4',
        'user',
      ],
    });

    if (!existedPetPlayers) {
      throw new NotFoundException(`Pet-player ${pet_id} not found`);
    }

    if (user?.username && user.username !== existedPetPlayers.user?.username) {
      const addedUser = await this.userService.findOne({
        where: { username: user.username },
      });

      if (!addedUser) {
        throw new NotFoundException(`User ${user.username} not found`);
      }

      existedPetPlayers.user = addedUser;
    }

    if (!!payload.equipped_skill_codes.length) {
      this.petPlayersService.checkIsValidSkills(
        existedPetPlayers,
        payload.equipped_skill_codes,
      );
    }

    Object.assign(existedPetPlayers, payload);

    const updatedPet = await this.petPlayersRepository.save(existedPetPlayers);

    return plainToInstance(PetPlayersInfoDto, updatedPet);
  }

  async deletePetPlayers(id: string) {
    const result = await this.petPlayersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new Error('Pet-player not found');
    }
    return { deleted: true };
  }
}
