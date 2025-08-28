import { FoodModule } from '@modules/food/food.module';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardEntity } from './entity/reward.entity';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { QuestEntity } from '@modules/quest/entity/quest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RewardEntity, QuestEntity]),
    JwtModule.register({}),
    FoodModule,
    ItemModule,
  ],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
