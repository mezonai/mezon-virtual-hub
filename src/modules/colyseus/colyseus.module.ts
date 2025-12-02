import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ColyseusService } from '@modules/colyseus/colyseus.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClanEntity])],
  providers: [ColyseusService],
  exports: [ColyseusService], 
})
export class ColyseusModule {}
