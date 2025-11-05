import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';
import { FarmEntity } from './entity/farm.entity';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FarmEntity, FarmSlotEntity]),
  ],
  controllers: [FarmController],
  providers: [FarmService],
  exports: [FarmService],
})
export class FarmModule {}
