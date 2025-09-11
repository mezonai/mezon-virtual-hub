import { FoodModule } from '@modules/food/food.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerQuestEntity } from './entity/player-quest.entity';
import { QuestListener } from './events/quest.listener';
import { PlayerQuestProgressService } from './player-quest-progress.service';
import { PlayerQuestController } from './player-quest.controller';
import { PlayerQuestService } from './player-quest.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PlayerQuestEntity, QuestEntity]),
    JwtModule.register({}),
    FoodModule,
    ItemModule,
    InventoryModule,
    UserModule
  ],
  controllers: [PlayerQuestController],
  providers: [PlayerQuestService, QuestListener, PlayerQuestProgressService],
  exports: [PlayerQuestService, PlayerQuestProgressService],
})
export class PlayerQuestModule { }
