import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PlantEntity } from './entity/plant.entity';
import { PlantController } from './plant.controller';
import { PlantService } from './plant.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlantEntity]), ClsModule],
  providers: [PlantService],
  controllers: [PlantController],
})
export class PlantModule {}
