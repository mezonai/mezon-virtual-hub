import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { ClanDecorInventoryEntity } from './entity/clan-decor-inventory.entity';
import { ClanDecorInventoryQueryDto } from './dto/clan-decor-inventory.dto';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapDecorConfigEntity } from '@modules/map-decor-config/entity/map-decor-config.entity';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanFundType } from '@enum';

@Injectable()
export class ClanDecorInventoryService extends BaseService<ClanDecorInventoryEntity> {
  constructor(
    @InjectRepository(ClanDecorInventoryEntity)
    private readonly clanInventoryRepo: Repository<ClanDecorInventoryEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(MapDecorConfigEntity)
    private readonly configRepo: Repository<MapDecorConfigEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
    @InjectRepository(ClanWarehouseEntity)
    private readonly warehouseRepo: Repository<ClanWarehouseEntity>,
    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,
  ) {
    super(clanInventoryRepo, ClanDecorInventoryEntity.name);
  }

  async getAllClanDecorInventories(query: ClanDecorInventoryQueryDto) {
    const qb = this.clanInventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.clan', 'clan')
      .leftJoinAndSelect('inventory.decorItem', 'decorItem')
      .orderBy('inventory.created_at', 'DESC');

    if (query.clan_id) {
      qb.andWhere('clan.id = :clan_id', {
        clan_id: query.clan_id,
      });
    }

    return qb.getMany();
  }

  async getClanDecorInventoryById(id: string) {
    const inventory = await this.clanInventoryRepo.findOne({
      where: { id },
      relations: ['clan', 'decorItem'],
    });

    if (!inventory) {
      throw new NotFoundException(
        'Clan decor inventory not found',
      );
    }

    return inventory;
  }

  async buyDecorItemForClan(user: UserEntity, recipe_id: string) {
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

    const existingInventory = await this.clanInventoryRepo.findOne({
      where: {
        clan: { id: clan.id },
        decorItem: { id: recipe.decor_item_id },
      },
    });

    if (existingInventory) throw new BadRequestException('Clan already owns this decor item');

    const fundRecord = await this.clanFundRepo.findOne({
      where: { clan_id: user.clan_id, type: ClanFundType.GOLD },
    });
    if (!fundRecord) throw new NotFoundException('Clan fund record not found');

    for (const ingredient of recipe?.ingredients || []) {
      if (ingredient.item || ingredient.plant) {
        const requiredQuantity = ingredient.required_quantity;
        const warehouseItem = await this.warehouseRepo.findOne({
          where: {
            clan_id: user.clan_id,
            plant_id: ingredient.plant_id,
            item_id: ingredient.item_id,
            is_harvested: ingredient.plant_id ? true : false,
          },
        });
        if (!warehouseItem || warehouseItem.quantity < requiredQuantity) {
          throw new BadRequestException(`Not enough ${ingredient.item?.name || ingredient.plant?.name} in clan warehouse`);
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

    const inventory = this.clanInventoryRepo.create({
      clan,
      decorItem: recipe.decor_item,
    });

    return await this.clanInventoryRepo.save(inventory);
  }

  async removeDecorItemFromClan(id: string) {
    const inventory = await this.getClanDecorInventoryById(id);

    const used = await this.configRepo.exist({
      where: {
        decorItem: { id: inventory.decorItem.id },
        clanEstate: {
          clan: { id: inventory.clan.id },
        },
      },
    });

    if (used) {
      throw new BadRequestException(
        'Cannot remove decor item that is currently placed on map',
      );
    }

    await this.clanInventoryRepo.remove(inventory);
    return { success: true };
  }
}
