import { LoggerModule } from '@libs/logger';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, MapEntity, Inventory]),
    JwtModule.register({}),
    InventoryModule,
    FoodModule,
    ItemModule,
    PlayerQuestModule
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
