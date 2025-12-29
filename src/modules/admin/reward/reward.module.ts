import { FoodModule } from '@modules/food/food.module';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardManagementController } from './reward.controller';
import { RewardManagementService } from './reward.service';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { ClanModule } from '@modules/clan/clan.module';
import { ClanFundModule } from '@modules/clan-fund/clan-fund.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RewardEntity, QuestEntity]),
    JwtModule.register({}),
    FoodModule,
    ItemModule,
    InventoryModule,
    ClanModule,
    ClanFundModule,
    UserModule,
  ],
  providers: [RewardManagementService],
  exports: [RewardManagementService],
})
export class RewardManagementModule {}
