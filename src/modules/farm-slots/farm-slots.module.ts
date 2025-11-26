import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmSlotEntity } from './entity/farm-slots.entity';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { FarmSlotService } from './farm-slots.service';
import { FarmSlotsController } from './farm-slots.controller';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { FarmEntity } from '@modules/farm/entity/farm.entity';
import { ClanWarehouseModule } from '@modules/clan-warehouse/clan-warehouse.module';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';
import { UserClanStatService } from '@modules/user-clan-stat/user-clan-stat.service';
import { ClanActivityModule } from '@modules/clan-activity/clan-activity.module';
import { ClanFundModule } from '@modules/clan-fund/clan-fund.module';

@Module({
  imports: [TypeOrmModule.forFeature([FarmSlotEntity, SlotsPlantEntity, ClanWarehouseEntity, PlantEntity, UserEntity, FarmEntity, UserClanStatEntity]), ClanWarehouseModule, ClanActivityModule, ClanFundModule],
  providers: [FarmSlotService, UserClanStatService],
  controllers: [FarmSlotsController],
})
export class FarmSlotsModule {}
