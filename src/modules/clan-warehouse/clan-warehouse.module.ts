import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanWarehouseEntity } from './entity/clan-warehouse.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { CLanWarehouseService } from './clan-warehouse.service';
import { ClanWarehouseController } from './clan-warehouse.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClanWarehouseEntity, PlantEntity, ClanFundEntity]), ClsModule],
  providers: [CLanWarehouseService],
  controllers: [ClanWarehouseController],
  exports: [CLanWarehouseService],
})
export class ClanWarehouseModule {}
