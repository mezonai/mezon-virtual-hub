import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { FarmWarehouseEntity } from './entity/farm-warehouse.entity';
import { FarmWarehouseController } from './farm-warehouse.controller';
import { FarmWarehouseService } from './farm-warehouse.service';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FarmWarehouseEntity, PlantEntity, ClanFundEntity, FarmSlotEntity]), ClsModule],
  providers: [FarmWarehouseService],
  controllers: [FarmWarehouseController],
})
export class FarmWarehouseModule {}
