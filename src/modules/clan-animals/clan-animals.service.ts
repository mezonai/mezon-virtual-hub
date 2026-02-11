import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ClanAnimalEntity } from './entity/clan-animal.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { PetClanEntity } from '@modules/pet-clan/entity/pet-clan.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { GetListClanAnimalsDto } from '@modules/clan-animals/dto/clan-animals.dto';
import { RecipeService } from '@modules/recipe/recipe.service';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { ClanActivityService } from '@modules/clan-activity/clan-activity.service';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanActivityActionType, ClanFundType } from '@enum';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';

@Injectable()
export class ClanAnimalsService {
  constructor(
    @InjectRepository(ClanAnimalEntity)
    private readonly clanAnimalRepository: Repository<ClanAnimalEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
    @InjectRepository(ClanWarehouseEntity)
    private readonly warehouseRepo: Repository<ClanWarehouseEntity>,
    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,
    private readonly clanActivityService: ClanActivityService,
    private readonly recipeService: RecipeService,
  ) {}

  async buyAnimalForClan(user: UserEntity, recipe_id: string) {
    return this.clanAnimalRepository.manager.transaction(async (manager) => {
      const clanAnimalRepo = manager.getRepository(ClanAnimalEntity);
      const clanFundRepo = manager.getRepository(ClanFundEntity);
      const clanWarehouseRepo = manager.getRepository(ClanWarehouseEntity);
      const petClanRepo = manager.getRepository(PetClanEntity);

      if (!user.clan_id) {
        throw new BadRequestException('User does not belong to any clan');
      }

      const recipePetClan = await this.recipeService.getRecipeById(recipe_id);
      if (!recipePetClan) {
        throw new NotFoundException('Recipe not found');
      }

      const petClan = await petClanRepo.findOne({
        where: { id: recipePetClan.pet_clan_id },
      });
      if (!petClan) {
        throw new NotFoundException('Pet clan not found');
      }

      const existedPet = await clanAnimalRepo.findOne({
        where: {
          clan_id: user.clan_id,
          pet_clan_id: recipePetClan.pet_clan_id,
        },
      });
      if (existedPet) {
        throw new BadRequestException('Clan already has this pet');
      }

      const clanFund = await clanFundRepo.findOne({
        where: { clan_id: user.clan_id },
      });
      if (!clanFund) {
        throw new NotFoundException('Clan fund not found');
      }

      for (const ingredient of recipePetClan.ingredients) {
        if (ingredient.gold > 0) {
          if (clanFund.amount < ingredient.gold) {
            throw new BadRequestException('Insufficient clan fund');
          }
          clanFund.amount -= ingredient.gold;
          continue;
        }

        const clanWarehouse = await clanWarehouseRepo.findOne({ 
          where: {
            clan_id: user.clan_id,
            item_id: ingredient.item_id,
            plant_id: ingredient.plant_id,
            is_harvested: ingredient.plant_id ? true : false,
            quantity: MoreThan(0),
          }
         });

        if (!clanWarehouse || clanWarehouse.quantity < ingredient.required_quantity) {
          throw new BadRequestException('Insufficient items in clan warehouse');
        }

        clanWarehouse.quantity -= ingredient.required_quantity;
        await clanWarehouseRepo.save(clanWarehouse);
      }

      await clanFundRepo.save(clanFund);

      const clanAnimal = clanAnimalRepo.create({
        clan_id: user.clan_id,
        pet_clan_id: petClan.id,
        level: 1,
        exp: 0,
        is_active: false,
        bonus_rate_affect: 0,
      });

      const savedClanAnimal = await clanAnimalRepo.save(clanAnimal);

      await this.clanActivityService.logActivity({
        clanId: user.clan_id,
        userId: user.id,
        actionType: ClanActivityActionType.PURCHASE,
        quantity: 1,
        itemName: petClan.name,
        officeName: user.clan?.farm.name,
      });

      return {
        clan_id: user.clan_id,
        item: savedClanAnimal,
        fund: clanFund.amount,
      };
    });
  }

  async buyPetClanSlot(user: UserEntity, recipe_id: string) {
    if (!user.clan_id) throw new BadRequestException('User not found clan');

    if (!recipe_id) throw new BadRequestException('Recipe id is required');

    const clan = await this.clanRepo.findOne({
      where: { id: user.clan_id },
    });
    if (!clan) throw new NotFoundException('Clan not found');

    const recipe = await this.recipeRepo.findOne({
      where: { id: recipe_id },
      relations: ['decor_item', 'ingredients', 'ingredients.item', 'ingredients.plant'],
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const fundRecord = await this.clanFundRepo.findOne({
      where: { clan_id: user.clan_id, type: ClanFundType.GOLD },
    });
    if (!fundRecord) throw new NotFoundException('Clan fund record not found');

    for (const ingredient of recipe?.ingredients || []) {
      if (ingredient.item || ingredient.plant) {
        const requiredQuantity = ingredient.required_quantity * clan.max_slot_pet_active;
        const warehouseItem = await this.warehouseRepo.findOne({
          where: {
            clan_id: user.clan_id,
            plant_id: ingredient.plant_id,
            item_id: ingredient.item_id,
            is_harvested: ingredient.plant_id ? true : false,
            quantity: MoreThan(0),
          },
        });
        if (!warehouseItem || warehouseItem.quantity < requiredQuantity) {
          throw new BadRequestException(`Not enough ingredients in clan warehouse`);
        }
        warehouseItem.quantity -= requiredQuantity;
        await this.warehouseRepo.save(warehouseItem);
      }

      if (ingredient.gold > 0) {
        if (fundRecord.amount < ingredient.gold) {
          throw new BadRequestException('Not enough clan fund');
        }
        fundRecord.amount -= ingredient.gold;
        fundRecord.spent_amount += ingredient.gold;
        await this.clanFundRepo.save(fundRecord);
      }
    }

    clan.max_slot_pet_active += 1;
    const savedClan = await this.clanRepo.save(clan);

    return {
      clan_id: user.clan_id,
      item: savedClan,
      fund: fundRecord.amount,
    };
  }

  async activateClanAnimal(clan_id: string, clanAnimalId: string) {
    return this.clanAnimalRepository.manager.transaction(async (manager) => {
      const clanAnimalRepo = manager.getRepository(ClanAnimalEntity);
      const clanRepo = manager.getRepository(ClanEntity);

      if (!clan_id) {
        throw new BadRequestException('User does not belong to any clan');
      }

      const clan = await clanRepo.findOne({
        where: { id: clan_id },
      });
      if (!clan) {
        throw new NotFoundException('Clan not found');
      }

      const clanAnimal = await clanAnimalRepo.findOne({
        where: { id: clanAnimalId, clan_id: clan_id },
        relations: ['pet_clan'],
      });
      if (!clanAnimal) {
        throw new NotFoundException('Clan pet not found');
      }

      if (clanAnimal.is_active) return clanAnimal;

      const activePets = await clanAnimalRepo.find({
        where: { clan_id: clan_id, is_active: true },
        select: ['slot_index'],
      });

      if (activePets.length >= clan.max_slot_pet_active) {
        throw new BadRequestException('Maximum active pets reached');
      }

      const usedSlots = new Set(activePets.map(p => p.slot_index));
      let slotIndex: number | null = null;

      for (let i = 1; i <= clan.max_slot_pet_active; i++) {
        if (!usedSlots.has(i)) {
          slotIndex = i;
          break;
        }
      }

      if (!slotIndex) {
        throw new BadRequestException('No available slot');
      }

      clanAnimal.is_active = true;
      clanAnimal.slot_index = slotIndex;

      return clanAnimalRepo.save(clanAnimal);
    });
  }

  async deactivateClanAnimal(clan_id: string, clanAnimalId: string) {
    if (!clan_id) {
      throw new BadRequestException('User does not belong to any clan');
    }

    const clanAnimal = await this.clanAnimalRepository.findOne({
      where: {
        id: clanAnimalId,
        clan_id: clan_id,
      },
    });

    if (!clanAnimal) {
      throw new NotFoundException('Clan pet not found');
    }

    if (!clanAnimal.is_active) {
      return clanAnimal;
    }

    clanAnimal.is_active = false;
    clanAnimal.slot_index = null!;

    return this.clanAnimalRepository.save(clanAnimal);
  }

  async getPetRate(clanAnimalId: string) {
    const clanAnimal = await this.clanAnimalRepository.findOne({
      where: {
        id: clanAnimalId,
        is_active: true,
      },
      relations: ['pet_clan'],
    });

    if (!clanAnimal) {
      throw new NotFoundException('Clan animal not found or inactive');
    }

    const baseRate = clanAnimal.pet_clan?.base_rate_affect ?? 0;
    const bonusRate = clanAnimal.bonus_rate_affect ?? 0;

    return {
      pet: clanAnimal.pet_clan?.name,
      totalRate: baseRate + bonusRate
    }
  }

  async gainExpForActiveClanAnimals(clanId: string, expGain: number) {
    const activeAnimals = await this.clanAnimalRepository.find({
      where: {
        clan_id: clanId,
        is_active: true,
      },
      relations: ['pet_clan'],
    });

    for (const animal of activeAnimals) {
      const petClan = animal.pet_clan;

      if (animal.level >= petClan.max_level) continue;

      animal.exp += expGain;

      const requiredExp = this.getExpRequiredForNextLevel(
        animal.level,
        petClan,
      );

      if (animal.exp >= requiredExp) {
        animal.exp -= requiredExp;
        animal.level += 1;

        animal.bonus_rate_affect +=
          petClan.base_rate_affect *
          petClan.level_up_rate_multiplier;
      }

      await this.clanAnimalRepository.save(animal);
    }
  }

  async getListClanAnimalsByClanId(query: GetListClanAnimalsDto) {
    const pets = await this.clanAnimalRepository.find({
      where: { ...query },
      relations: ['pet_clan'],
      order: { slot_index: 'ASC' },
    });

    const clan = await this.clanRepo.findOne({
      where: { id: query.clan_id },
    });

    return pets.map(pet => ({
      ...pet,
      max_slot_pet_active: clan?.max_slot_pet_active,
      required_exp: this.getExpRequiredForNextLevel(pet.level, pet.pet_clan),
      total_rate_affect:
        (pet.pet_clan?.base_rate_affect ?? 0) +
        (pet.bonus_rate_affect ?? 0),
    }));
  }

  async deleteClanAnimal(user: UserEntity, clanAnimalId: string) {
    if (!user.clan_id) {
      throw new BadRequestException('User does not belong to any clan');
    }

    const clanAnimal = await this.clanAnimalRepository.findOne({
      where: {
        id: clanAnimalId,
        clan_id: user.clan_id,
      },
    });

    if (!clanAnimal) {
      throw new NotFoundException('Clan pet not found');
    }

    return this.clanAnimalRepository.remove(clanAnimal);
  }

  getExpRequiredForNextLevel(level: number, petClan: PetClanEntity) {
    if (level >= petClan.max_level) return Infinity;

    return level = Math.floor(
      petClan.base_exp_per_level *
      Math.pow(petClan.base_exp_increment_per_level, level - 1),
    );
  }
}
