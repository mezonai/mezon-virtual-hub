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

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configEnv],
      isGlobal: true,
      envFilePath: envFilePath,
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRoot(dataSourceOption),
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
  ],
})
export class AppModule {}
