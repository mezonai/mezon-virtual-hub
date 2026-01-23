import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WheelEntity } from './entity/wheel.entity';
import { WheelService } from './wheel.service';
import { WheelController } from './wheel.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WheelEntity]),
  ],
  controllers: [WheelController],
  providers: [WheelService],
  exports: [WheelService],
})
export class WheelModule {}
