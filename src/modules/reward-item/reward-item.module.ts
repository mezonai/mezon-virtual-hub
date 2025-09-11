import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardItemEntity } from './entity/reward-item.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { RewardItemService } from './reward-item.service';
import { RewardItemController } from './reward-item.controller';
import { PetsEntity } from '@modules/pets/entity/pets.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardItemEntity,
      RewardEntity,
      ItemEntity,
      FoodEntity,
      PetsEntity,
    ]),
  ],
  providers: [RewardItemService],
  controllers: [RewardItemController],
  exports: [RewardItemService],
})
export class RewardItemModule {}
