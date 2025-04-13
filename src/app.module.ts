import {
  configEnv,
  configValidationSchema,
  envFilePath,
} from '@config/env.config';
import { AuthModule } from '@modules/auth/auth.module';
import { MapModule } from '@modules/map/map.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '@libs/filter';
import { GuardModule } from '@libs/guard/guard.module';
import { InterceptorModule } from '@libs/interceptor';
import { LoggerModule } from '@libs/logger';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { ClsModule } from 'nestjs-cls';
import { dataSourceOption } from './config/data-source.config';
import { LogViewerModule } from '@modules/log-viewer/log-viewer.module';
import { MezonModule } from '@modules/mezon/mezon.module';
import { GameModule } from '@modules/game/game.module';
import { GameEventModule } from '@modules/game-event/game-event.module';

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
    MapModule,
    LogViewerModule,
    LoggerModule,
    FilterModule,
    InterceptorModule,
    GuardModule,
    MezonModule,
    GameModule,
    GameEventModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
})
export class AppModule {}
