import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClanAnimalEntity } from './entity/clan-animal.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { PetClanEntity } from '@modules/pet-clan/entity/pet-clan.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { BuyAnimalForClanDto, GetListClanAnimalsDto } from '@modules/clan-animals/dto/clan-animals.dto';
import { RecipeService } from '@modules/recipe/recipe.service';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { ClanActivityService } from '@modules/clan-activity/clan-activity.service';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanActivityActionType } from '@enum';

@Injectable()
export class ClanAnimalsService {
  constructor(
    @InjectRepository(ClanAnimalEntity)
    private readonly clanAnimalRepository: Repository<ClanAnimalEntity>,

    @InjectRepository(ClanEntity)
    private readonly clanRepository: Repository<ClanEntity>,

    @InjectRepository(PetClanEntity)
    private readonly petClanRepository: Repository<PetClanEntity>,

    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,

    @InjectRepository(ClanWarehouseEntity)
    private readonly clanWarehouseRepo: Repository<ClanWarehouseEntity>,

    private readonly clanActivityService: ClanActivityService,

    private readonly recipeService: RecipeService,
  ) {}

  async buyAnimalForClan(user: UserEntity, dto: BuyAnimalForClanDto) {
    if (!user.clan_id) {
      throw new BadRequestException('User does not belong to any clan');
    }

    const recipePetClan = await this.recipeService.getRecipeById(dto.recipe_id);
    if (!recipePetClan) {
      throw new NotFoundException('Recipe not found');
    }

    const petClan = await this.petClanRepository.findOne({
      where: { id: recipePetClan.pet_clan_id },
    });

    if (!petClan) {
      throw new NotFoundException('Pet clan not found');
    }

    const existed = await this.clanAnimalRepository.findOne({
      where: {
        clan_id: user.clan_id,
        pet_clan_id: recipePetClan.pet_clan_id,
      },
    });

    if (existed) {
      throw new BadRequestException('Clan already has this pet');
    }

    const clanFund = await this.clanFundRepo.findOne({
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
        await this.clanFundRepo.save(clanFund);
        continue;
      }

      if (ingredient.item_id || ingredient.plant_id) {
        const clanWarehouse = await this.clanWarehouseRepo.findOne({
          where: { clan_id: user.clan_id, item_id: ingredient.item_id, plant_id: ingredient.plant_id },
        });

        if (!clanWarehouse || clanWarehouse.quantity < ingredient.required_quantity) {
          throw new BadRequestException('Insufficient items in clan warehouse');
        }

        clanWarehouse.quantity -= ingredient.required_quantity;
        await this.clanWarehouseRepo.save(clanWarehouse);
        continue;
      }
    }
    
    await this.clanActivityService.logActivity({
          clanId: user.clan_id,
          userId: user.id,
          actionType: ClanActivityActionType.PURCHASE,
          itemName: recipePetClan?.pet_clan!.name,
          officeName: user.clan?.farm.name
        });
    const clanAnimal = this.clanAnimalRepository.create({
      clan_id: user.clan_id,
      pet_clan_id: recipePetClan.pet_clan_id,
      is_active: false,
      level: 1,
      exp: 0,
    });

    return this.clanAnimalRepository.save(clanAnimal);
  }

  async activateClanAnimal(user: UserEntity, clanAnimalId: string) {
    if (!user.clan_id) {
      throw new BadRequestException('User does not belong to any clan');
    }

    const clan = await this.clanRepository.findOne({
      where: { id: user.clan_id },
    });

    if (!clan) {
      throw new NotFoundException('Clan not found');
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

    if (clanAnimal.is_active) {
      return clanAnimal;
    }

    const activeCount = await this.clanAnimalRepository.count({
      where: {
        clan_id: user.clan_id,
        is_active: true,
      },
    });

    if (activeCount >= clan.max_slot_pet_active) {
      throw new BadRequestException(
        `Maximum ${clan.max_slot_pet_active} active pets allowed`,
      );
    }

    const slotIndex = await this.getNextAvailableSlot(
      user.clan_id,
      clan.max_slot_pet_active,
    );

    if (!slotIndex) {
      throw new BadRequestException('No available slot');
    }

    clanAnimal.is_active = true;
    clanAnimal.slot_index = slotIndex;

    return this.clanAnimalRepository.save(clanAnimal);
  }

  async deactivateClanAnimal(user: UserEntity, clanAnimalId: string) {
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

    if (!clanAnimal.is_active) {
      return clanAnimal;
    }

    clanAnimal.is_active = false;
    clanAnimal.slot_index = null!;

    return this.clanAnimalRepository.save(clanAnimal);
  }

  async getDogBiteInterruptRate(clanAnimalId: string, targetClanId: string) {
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

    if (clanAnimal.clan_id === targetClanId) return 0;

    const baseRate = clanAnimal.pet_clan?.base_rate_affect ?? 0;
    const bonusRate = clanAnimal.bonus_rate_affect ?? 0;

    return Math.min(baseRate + bonusRate, 1);
  }

  async getListClanAnimalsByClanId(query: GetListClanAnimalsDto) {
    return this.clanAnimalRepository.find({
      where: { ...query },
      relations: ['pet_clan'],
      order: { created_at: 'ASC' },
    });
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

  private async getNextAvailableSlot(clanId: string, maxSlot: number) {
    const actives = await this.clanAnimalRepository.find({
      where: {
        clan_id: clanId,
        is_active: true,
      },
      select: ['slot_index'],
    });

    const usedSlots = new Set(
      actives.map((a) => a.slot_index).filter(Boolean),
    );

    for (let i = 1; i <= maxSlot; i++) {
      if (!usedSlots.has(i)) {
        return i;
      }
    }

    return null;
  }
}
