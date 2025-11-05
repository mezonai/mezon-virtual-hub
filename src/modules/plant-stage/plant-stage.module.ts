import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PlantStageEntity } from './entity/plant-stage.entity';
import { PlantStageController } from './plant-stage.controller';
import { PlantStageService } from './plant-stage.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlantStageEntity]), ClsModule],
  providers: [PlantStageService],
  controllers: [PlantStageController],
})
export class PlantStageModule {}
