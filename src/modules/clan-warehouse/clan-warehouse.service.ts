import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { ClanWarehouseEntity } from './entity/clan-warehouse.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanActivityActionType, ClanFundType, InventoryClanType, RecipeType } from '@enum';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { BuyItemDto, GetAllItemsInWarehouseQueryDto, SeedClanWarehouseDto } from './dto/clan-warehouse.dto';
import { ClanActivityService } from '@modules/clan-activity/clan-activity.service';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ITEM_CODE_TO_INVENTORY_TYPE, TOOL_RATE_MAP } from '@constant/farm.constant';
import { RecipeService } from '@modules/recipe/recipe.service';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';

@Injectable()
export class CLanWarehouseService {
  constructor(
    @InjectRepository(ClanWarehouseEntity)
    private readonly warehouseRepo: Repository<ClanWarehouseEntity>,

    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,

    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,

    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,

    private readonly clanActivityService: ClanActivityService,

    private readonly recipeService: RecipeService,
  ) {}

  async getAllItemsInWarehouse(clanId: string, query: GetAllItemsInWarehouseQueryDto) {
    const qb = await this.warehouseRepo
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.plant', 'plant')
      .leftJoinAndSelect('w.item', 'item')
      .where('w.clan_id = :clanId', { clanId: clanId })
      .andWhere('w.quantity > 0')

    if (query.type === 'Plant') {
      qb.andWhere('w.type = :plantType', {
        plantType: InventoryClanType.PLANT,
      });

      if (query.is_harvested !== undefined) {
        qb.andWhere('w.is_harvested = :isHarvested', {
          isHarvested: query.is_harvested,
        });
      }

      qb.addOrderBy('plant.buy_price', 'ASC');
    }

    if (query.type === 'Tool') {
      qb.andWhere('w.type != :plantType', {
        plantType: InventoryClanType.PLANT,
      });

      qb.addOrderBy(`
        CASE
          WHEN w.type::text LIKE 'harvest_tool_%' THEN 1
          WHEN w.type::text LIKE 'growth_plant_tool_%' THEN 2
          WHEN w.type::text LIKE 'interrupt_harvest_tool_%' THEN 3
          ELSE 99
        END
      `, 'ASC')
        .addOrderBy('item.gold', 'ASC');
    }

    const items = await qb.getMany();

    for (const item of items) {
      if (item.type !== InventoryClanType.PLANT) {
        if (item.item) {
          item.item['rate'] = TOOL_RATE_MAP[item.item.item_code!] ?? 0
        }
      }
    }

    return {
      clanId: clanId,
      totalItems: items.length,
      items,
    };
  }

  async buyItemsForClanFarm(user: UserEntity, dto: BuyItemDto) {
    if (dto.quantity <= 0)
      throw new BadRequestException('Quantity must be greater than 0');

    if (!user.clan_id) throw new BadRequestException('User not found clan');

    if (!dto.plantId && !dto.recipeId) {
      throw new BadRequestException('plantId or itemId is required');
    }

    if (dto.plantId && dto.recipeId) {
      throw new BadRequestException('Only one of plantId or itemId is allowed');
    }

    let plant: PlantEntity | null = null;
    let item: ItemEntity | null = null;
    let recipe: RecipeEntity | null = null;

    if (dto.plantId) {
      plant = await this.plantRepo.findOne({
        where: { id: dto.plantId },
      });
    }

    if (!plant && dto.recipeId) {
      recipe = await this.recipeService.getRecipeById(dto.recipeId)
      if (recipe.type === RecipeType.PLANT) plant = recipe.plant || null;
      item = recipe.item || null;
    }

    if (!plant && !item) {
      throw new NotFoundException('Item not found');
    }

    const fundRecord = await this.clanFundRepo.findOne({
      where: { clan_id: user.clan_id, type: ClanFundType.GOLD },
    });
    if (!fundRecord) throw new NotFoundException('Clan fund record not found');

    for (const ingredient of recipe?.ingredients || []) {
      const requiredQuantity = ingredient.required_quantity * dto.quantity;
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

    const pricePerUnit = plant
      ? plant.buy_price
      : item!.gold;

    const totalPrice = pricePerUnit * dto.quantity;

    if (fundRecord.amount < totalPrice)
      throw new BadRequestException('Not enough clan fund');

    fundRecord.amount -= totalPrice;
    fundRecord.spent_amount += totalPrice;
    await this.clanFundRepo.save(fundRecord);

    let warehouseItem = await this.warehouseRepo.findOne({
      where: {
        clan_id: user.clan_id,
        plant_id: plant ? plant.id : IsNull(),
        item_id: item ? item.id : IsNull(),
        is_harvested: false,
      },
    });

    if (warehouseItem) {
      warehouseItem.quantity += dto.quantity;
    } else {
      warehouseItem = this.warehouseRepo.create({
        clan_id: user.clan_id,
        type: plant
          ? InventoryClanType.PLANT
          : ITEM_CODE_TO_INVENTORY_TYPE[item?.item_code!],
        quantity: dto.quantity,
        is_harvested: false,
        purchased_by: user.id,
        plant_id: plant?.id,
        item_id: item?.id,
      });
    }

    const savedItem = await this.warehouseRepo.save(warehouseItem);

    await this.clanActivityService.logActivity({
      clanId: user.clan_id,
      userId: user.id,
      actionType: ClanActivityActionType.PURCHASE,
      itemName: item?.name || plant?.name || 'Unknown Item',
      quantity: dto.quantity,
      officeName: user.clan?.farm.name
    });

    return {
      clan_id: user.clan_id,
      item: savedItem,
      fund: fundRecord.amount,
    };
  }

  async addItemToClanWarehouse(
    clanId: string,
    itemId: string,
    quantity: number,
  ) {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');

    let warehouseItem = await this.warehouseRepo.findOne({
      where: {
        clan_id: clanId,
        item_id: itemId,
      },
    });

    if (warehouseItem) {
      warehouseItem.quantity += quantity;
    }
    else {
      warehouseItem = this.warehouseRepo.create({
        clan_id: clanId,
        item_id: itemId,
        type: ITEM_CODE_TO_INVENTORY_TYPE[item.item_code!],
        quantity,
        is_harvested: false,
      });
    }

    await this.warehouseRepo.save(warehouseItem);

    return {
      success: true,
      clanId: clanId,
      item: warehouseItem,
    }
  }

  async updateClanWarehousePlant(
    clanId: string,
    plantId: string,
    quantity: number, //số lượng thay đổi (+ để cộng, - để trừ, Vd: +1, -1)
    options?: { autoCreate?: boolean; isHarvested?: boolean; userId?: string },
  ) {
    if (!clanId || !plantId) {
      throw new BadRequestException('Invalid clanId or plantId');
    }

    let warehouseItem = await this.warehouseRepo.findOne({
      where: {
        clan_id: clanId,
        plant_id: plantId,
        is_harvested: !!options?.isHarvested,
      },
    });

    if (!warehouseItem && !options?.autoCreate) {
      throw new NotFoundException('Item not found in clan warehouse');
    }

    if (!warehouseItem && options?.autoCreate) {
      warehouseItem = this.warehouseRepo.create({
        clan_id: clanId,
        plant_id: plantId,
        quantity: 0,
        is_harvested: !!options?.isHarvested,
        purchased_by: options?.userId || undefined,
      });
    }

    if (!warehouseItem) {
      throw new NotFoundException('Clan warehouse item could not be created');
    }
    warehouseItem.quantity += quantity;
    if (warehouseItem.quantity < 0) {
      throw new BadRequestException('Insufficient quantity in clan warehouse');
    }

    if (warehouseItem.quantity === 0) {
      await this.warehouseRepo.remove(warehouseItem);
      return null;
    }

    return await this.warehouseRepo.save(warehouseItem);
  }

  async seedClanWarehouse(clanId: string, dto: SeedClanWarehouseDto) {
    const plants = dto.plantIds?.length
      ? await this.plantRepo.find({ where: { id: In(dto.plantIds) } })
      : await this.plantRepo.find();

    const results: ClanWarehouseEntity[] = [];

    for (const plant of plants) {
      let warehouseItem = await this.warehouseRepo.findOne({
        where: {
          clan_id: clanId,
          plant_id: plant.id,
          is_harvested: false,
        },
      });

      if (warehouseItem) {
        warehouseItem.quantity += dto.defaultQuantity || 5;
      } else {
        warehouseItem = this.warehouseRepo.create({
          clan_id: clanId,
          plant_id: plant.id,
          quantity: dto.defaultQuantity || 5,
          is_harvested: false,
        });
      }

      const savedItem = await this.warehouseRepo.save(warehouseItem);
      results.push(savedItem);
    }

    return {
      success: true,
      clanId: clanId,
      items: results,
    };
  }

  async rewardSeedToClans(clanId: string, seedId: string, quantity: number) {
    let warehouseItem = await this.warehouseRepo.findOne({
      where: {
        clan_id: clanId,
        plant_id: seedId,
        is_harvested: false,
      },
    });

    if (warehouseItem) {
      warehouseItem.quantity += quantity;
    } else {
      warehouseItem = this.warehouseRepo.create({
        clan_id: clanId,
        plant_id: seedId,
        quantity,
        is_harvested: false,
      });
    }

    const savedItem = await this.warehouseRepo.save(warehouseItem);

    return {
      success: true,
      clanId: clanId,
      item: savedItem,
    };
  }
}
