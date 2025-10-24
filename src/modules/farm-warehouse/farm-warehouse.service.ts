import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmWarehouseEntity } from './entity/farm-warehouse.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanFundType, ClanRole } from '@enum';
import { BuyPlantDto } from './dto/farm-warehouse.dto';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';

@Injectable()
export class FarmWarehouseService {
  constructor(
    @InjectRepository(FarmWarehouseEntity)
    private readonly warehouseRepo: Repository<FarmWarehouseEntity>,

    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,

    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,

    @InjectRepository(FarmSlotEntity)
    private readonly farmSlotRepo: Repository<FarmSlotEntity>,
  ) {}

  async getAllPlantsInWarehouse(farmId: string) {
    return this.warehouseRepo.find({
      where: { farm_id: farmId },
      relations: ['plant'],
      order: { created_at: 'DESC' },
    });
  }

  async buyPlantForClanFarm(user: UserEntity, dto: BuyPlantDto) {
    if (dto.quantity <= 0)
      throw new BadRequestException('Quantity must be greater than 0');

    if (!user.clan_id || user.clan_role !== ClanRole.LEADER)
      throw new BadRequestException(
        'Only clan leader can buy plants for clan farm',
      );

    const plant = await this.plantRepo.findOne({ where: { id: dto.plantId } });
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
        farm_id: dto.farmId,
        plant_id: dto.plantId,
        is_harvested: false,
      },
    });

    if (warehouseItem) {
      warehouseItem.quantity += dto.quantity;
    } else {
      warehouseItem = this.warehouseRepo.create({
        farm_id: dto.farmId,
        plant_id: dto.plantId,
        quantity: dto.quantity,
        is_harvested: false,
      });
    }

    return this.warehouseRepo.save(warehouseItem);
  }

}
