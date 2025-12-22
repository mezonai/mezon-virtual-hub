import { LoggerModule } from '@libs/logger';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { FoodModule } from '@modules/food/food.module';
import { PlayerQuestModule } from '@modules/player-quest/player-quest.module';
import { GameConfigStore } from '@modules/admin/game-config/game-config.store';
import { GameConfigModule } from '@modules/admin/game-config/game-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ClanEntity, Inventory]),
    JwtModule.register({}),
    InventoryModule,
    FoodModule,
    ItemModule,
    PlayerQuestModule,
    GameConfigModule
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
