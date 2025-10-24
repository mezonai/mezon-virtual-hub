import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmSlotEntity } from './entity/farm-slots.entity';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { FarmSlotService } from './farm-slots.service';
import { FarmSlotsController } from './farm-slots.controller';
import { FarmWarehouseEntity } from '@modules/farm-warehouse/entity/farm-warehouse.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { FarmEntity } from '@modules/farm/entity/farm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FarmSlotEntity, SlotsPlantEntity, FarmWarehouseEntity, PlantEntity, UserEntity, ClanEntity, FarmEntity])],
  providers: [FarmSlotService],
  controllers: [FarmSlotsController],
})
export class FarmSlotsModule {}
