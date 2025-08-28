import { FoodModule } from '@modules/food/food.module';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestManagementController } from './quest.controller';
import { QuestManagementService } from './quest.service';
import { QuestEntity } from './entity/quest.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, QuestEntity, RewardEntity]),
    JwtModule.register({}),
    FoodModule,
    ItemModule,
  ],
  providers: [QuestManagementService],
  exports: [QuestManagementService],
})
export class QuestManagementModule {}
