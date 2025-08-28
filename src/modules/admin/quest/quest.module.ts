import { FoodModule } from '@modules/food/food.module';
import { ItemModule } from '@modules/item/item.module';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestManagementService } from './quest.service';

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
