import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { SlotsPlantEntity } from './entity/slots-plant.entity';
import { SlotsPlantController } from './slots-plant.controller';
import { SlotsPlantService } from './slots-plant.service';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlotsPlantEntity, FarmSlotEntity, UserEntity, ClanEntity, PlantEntity]), ClsModule],
  providers: [SlotsPlantService],
  controllers: [SlotsPlantController],
})
export class SlotsPlantModule {}
