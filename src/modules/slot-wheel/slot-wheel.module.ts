import { Module } from '@nestjs/common';
import { SlotWheelService } from './slot-wheel.service';
import { SlotWheelController } from './slot-wheel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotWheelEntity } from '@modules/slot-wheel/entity/slot-wheel.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { ClsModule } from 'nestjs-cls';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { UserEntity } from '@modules/user/entity/user.entity';
import { WheelEntity } from '@modules/wheel/entity/wheel.entity';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlotWheelEntity, ItemEntity, FoodEntity, PetsEntity, PlantEntity, UserEntity, WheelEntity, RecipeEntity]),
    InventoryModule,
    ClsModule,
  ],
  controllers: [SlotWheelController],
  providers: [SlotWheelService],
})
export class SlotWheelModule {}
