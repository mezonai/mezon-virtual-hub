import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WheelEntity } from './entity/wheel.entity';
import { WheelService } from './wheel.service';
import { WheelController } from './wheel.controller';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WheelEntity, RecipeEntity]),
  ],
  controllers: [WheelController],
  providers: [WheelService],
  exports: [WheelService],
})
export class WheelModule {}
