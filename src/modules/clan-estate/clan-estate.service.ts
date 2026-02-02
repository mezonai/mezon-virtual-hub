import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { ClanEstateEntity } from './entity/clan-estate.entity';
import { ClanEstateQueryDto } from './dto/clan-estate.dto';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanFundType } from '@enum';

@Injectable()
export class ClanEstateService extends BaseService<ClanEstateEntity> {
  constructor(
    @InjectRepository(ClanEstateEntity)
    private readonly clanEstateRepo: Repository<ClanEstateEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepo: Repository<MapEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
    @InjectRepository(ClanWarehouseEntity)
    private readonly warehouseRepo: Repository<ClanWarehouseEntity>,
    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,
  ) {
    super(clanEstateRepo, ClanEstateEntity.name);
  }

  async getAllClanEstates(query: ClanEstateQueryDto) {
    const qb = this.clanEstateRepo
      .createQueryBuilder('estate')
      .leftJoinAndSelect('estate.clan', 'clan')
      .leftJoinAndSelect('estate.realEstate', 'map')
      .leftJoinAndSelect('map.decorPlaceholders', 'decorPlaceholders')
      .orderBy('map.index', 'ASC');

    if (query.clan_id) {
      qb.andWhere('clan.id = :clan_id', {
        clan_id: query.clan_id,
      });
    }

    return qb.getMany();
  }

  async getClanEstateById(id: string) {
    const estate = await this.clanEstateRepo.findOne({
      where: { id },
      relations: ['clan', 'realEstate'],
    });

    if (!estate) {
      throw new NotFoundException('Clan estate not found');
    }

    return estate;
  }

  async buyMapForClan(user: UserEntity, recipe_id: string) {
    if (!user.clan_id) throw new BadRequestException('User not found clan');

    const clan = await this.clanRepo.findOne({
      where: { id: user.clan_id },
    });

    if (!clan) throw new BadRequestException('Clan not found');

    const recipe = await this.recipeRepo.findOne({
      where: { id: recipe_id },
      relations: ['map', 'ingredients', 'ingredients.item', 'ingredients.plant'],
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const existedEstate = await this.clanEstateRepo.findOne({
      where: {
        clan: { id: clan.id },
        realEstate: { id: recipe.map_id },
      },
    });

    if (existedEstate) throw new BadRequestException('Clan already owns this map');

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

    const clanEstate = this.clanEstateRepo.create({
      clan,
      realEstate: recipe.map,
    });

    const savedMap = await this.clanEstateRepo.save(clanEstate);

    return {
      clan_id: user.clan_id,
      item: savedMap,
      fund: fundRecord.amount,
    };
  }

  async deleteClanEstateById(id: string) {
    const estate = await this.getClanEstateById(id);
    await this.clanEstateRepo.remove(estate);
    return { success: true };
  }
}
