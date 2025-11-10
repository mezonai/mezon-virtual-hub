import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { ClanWarehouseEntity } from './entity/clan-warehouse.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanFundType, ClanRole } from '@enum';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { BuyPlantDto, SeedClanWarehouseDto } from './dto/clan-warehouse.dto';

@Injectable()
export class CLanWarehouseService {
  constructor(
    @InjectRepository(ClanWarehouseEntity)
    private readonly warehouseRepo: Repository<ClanWarehouseEntity>,

    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,

    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,
  ) {}

  async getAllItemsInWarehouse(clanId: string) {
    if (!clanId) {
      throw new BadRequestException('Clan ID not found');
    }

    const items = await this.warehouseRepo.find({
      where: {
        clan_id: clanId,
        quantity: MoreThan(0),
      },
      relations: ['plant'],
      order: { created_at: 'DESC' },
    });

    return {
      clanId,
      totalItems: items.length,
      items,
    };
  }

  async buyItemsForClanFarm(user: UserEntity, dto: BuyPlantDto) {
    if (dto.quantity <= 0)
      throw new BadRequestException('Quantity must be greater than 0');

    if (!user.clan_id || user.clan_role !== ClanRole.LEADER)
      throw new BadRequestException(
        'Only clan leader can buy plants for clan farm',
      );

    const plant = await this.plantRepo.findOne({ where: { id: dto.itemId } });
    if (!plant) throw new NotFoundException('Plant not found');

    const fundRecord = await this.clanFundRepo.findOne({
      where: { clan_id: user.clan_id, type: ClanFundType.GOLD },
    });
    if (!fundRecord) throw new NotFoundException('Clan fund record not found');

    const totalPrice = plant.buy_price * dto.quantity;
    if (fundRecord.amount < totalPrice)
      throw new BadRequestException('Not enough clan fund');

    fundRecord.amount -= totalPrice;
    await this.clanFundRepo.save(fundRecord);

    let warehouseItem = await this.warehouseRepo.findOne({
      where: {
        clan_id: dto.clanId,
        item_id: dto.itemId,
        is_harvested: false,
      },
    });

    if (warehouseItem) {
      warehouseItem.quantity += dto.quantity;
    } else {
      warehouseItem = this.warehouseRepo.create({
        clan_id: dto.clanId,
        item_id: dto.itemId,
        quantity: dto.quantity,
        is_harvested: false,
        purchased_by: user.id,
      });
    }

    const savedItem = await this.warehouseRepo.save(warehouseItem);

    return {
      clan_id: dto.clanId,
      item: savedItem,
      fund: fundRecord.amount,
    };
  }

  async updateClanWarehouseItem(
    clanId: string,
    itemId: string,
    quantity: number, //số lượng thay đổi (+ để cộng, - để trừ, Vd: +1, -1)
    options?: { autoCreate?: boolean; isHarvested?: boolean; userId?: string },
  ) {
    if (!clanId || !itemId) {
      throw new BadRequestException('Invalid clanId or itemId');
    }

    let warehouseItem = await this.warehouseRepo.findOne({
      where: {
        clan_id: clanId,
        item_id: itemId,
        is_harvested: !!options?.isHarvested,
      },
    });

    if (!warehouseItem && !options?.autoCreate) {
      throw new NotFoundException('Item not found in clan warehouse');
    }

    if (!warehouseItem && options?.autoCreate) {
      warehouseItem = this.warehouseRepo.create({
        clan_id: clanId,
        item_id: itemId,
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

    return await this.warehouseRepo.save(warehouseItem);
  }

  async seedClanWarehouse(dto: SeedClanWarehouseDto) {
    const plants = dto.itemIds?.length
      ? await this.plantRepo.find({ where: { id: In(dto.itemIds) } })
      : await this.plantRepo.find();

    const results: ClanWarehouseEntity[] = [];

    for (const plant of plants) {
      let warehouseItem = await this.warehouseRepo.findOne({
        where: {
          clan_id: dto.clanId,
          item_id: plant.id,
          is_harvested: false,
        },
      });

      if (warehouseItem) {
        warehouseItem.quantity += dto.defaultQuantity || 5;
      } else {
        warehouseItem = this.warehouseRepo.create({
          clan_id: dto.clanId,
          item_id: plant.id,
          quantity: dto.defaultQuantity || 5,
          is_harvested: false,
        });
      }

      const savedItem = await this.warehouseRepo.save(warehouseItem);
      results.push(savedItem);
    }

    return {
      success: true,
      clanId: dto.clanId,
      items: results,
    };
  }
}
