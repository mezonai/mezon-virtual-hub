import {
  configEnv,
  configValidationSchema,
  envFilePath,
} from '@config/env.config';
import { AuthModule } from '@modules/auth/auth.module';
import { ClanModule } from '@modules/clan/clan.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '@libs/filter';
import { GuardModule } from '@libs/guard/guard.module';
import { InterceptorModule } from '@libs/interceptor';
import { LoggerModule } from '@libs/logger';
import { AdminModule } from '@modules/admin/admin.module';
import { TransactionsModule } from '@modules/admin/transactions/transactions.module';
import { FoodModule } from '@modules/food/food.module';
import { GameEventModule } from '@modules/game-event/game-event.module';
import { GameModule } from '@modules/game/game.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { LogViewerModule } from '@modules/log-viewer/log-viewer.module';
import { MezonModule } from '@modules/mezon/mezon.module';
import { PetPlayersModule } from '@modules/pet-players/pet-players.module';
import { PetSkillsModule } from '@modules/pet-skills/pet-skills.module';
import { PetsModule } from '@modules/pets/pets.module';
import { PlayerQuestModule } from '@modules/player-quest/player-quest.module';
import { RewardItemModule } from '@modules/reward-item/reward-item.module';
import { RewardModule } from '@modules/reward/reward.module';
import { RouterModule } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { dataSourceOption } from './config/data-source.config';
import { ClanFundModule } from './modules/clan-fund/clan-fund.module';
import { ClanRequestModule } from './modules/clan-request/clan-request.module';
import { ColyseusModule } from '@modules/colyseus/colyseus.module';
import { FarmModule } from '@modules/farm/farm.module';
import { FarmSlotsModule } from '@modules/farm-slots/farm-slots.module';
import { PlantModule } from '@modules/plant/plant.module';
import { PlantStageModule } from '@modules/plant-stage/plant-stage.module';
import { ClanWarehouseModule } from '@modules/clan-warehouse/clan-warehouse.module';
import { SlotsPlantModule } from '@modules/slots-plant/slots-plant.module';
import { UserClanStatModule } from '@modules/user-clan-stat/user-clan-stat.module';
import { ClanActivityModule } from './modules/clan-activity/clan-activity.module';
import { GameConfigModule } from './modules/admin/game-config/game-config.module';
import { NumberRarityModule } from '@modules/number-rarity/number-rarity.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SlotWheelModule } from './modules/slot-wheel/slot-wheel.module';
import { RecipeModule } from '@modules/recipe/recipe.module';
import { IngredientModule } from '@modules/ingredient/ingredient.module';
import { WheelModule } from '@modules/wheel/wheel.module';
import { MapModule } from '@modules/map/map.module';
import { ClanEstateModule } from '@modules/clan-estate/clan-estate.module';
import { DecorItemModule } from '@modules/decor-item/decor-item.module';
import { MapDecorConfigModule } from '@modules/map-decor-config/map-decor-config.module';
import { DecorPlaceholderController } from '@modules/decor-placeholder/decor-placeholder.controller';
import { ClanDecorInventoryModule } from '@modules/clan-decor-invetory/clan-decor-inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configEnv],
      isGlobal: true,
      envFilePath: envFilePath,
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRoot(dataSourceOption),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    ItemModule,
    InventoryModule,
    ClanModule,
    LogViewerModule,
    LoggerModule,
    FilterModule,
    InterceptorModule,
    GuardModule,
    MezonModule,
    GameModule,
    GameEventModule,
    TransactionsModule,
    FoodModule,
    PetsModule,
    PetPlayersModule,
    PetSkillsModule,
    AdminModule,
    PlayerQuestModule,
    RewardModule,
    RewardItemModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
      },
    ]),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ClanFundModule,
    ClanRequestModule,
    ColyseusModule,
    FarmModule,
    FarmSlotsModule,
    PlantModule,
    PlantStageModule,
    ClanWarehouseModule,
    SlotsPlantModule,
    UserClanStatModule,
    ClanActivityModule,
    GameConfigModule,
    NumberRarityModule,
    SlotWheelModule,
    RecipeModule,
    IngredientModule,
    WheelModule,
    MapModule,
    ClanEstateModule,
    DecorItemModule,
    DecorPlaceholderController,
    ClanDecorInventoryModule,
    MapDecorConfigModule,
  ],
})
export class AppModule {}
