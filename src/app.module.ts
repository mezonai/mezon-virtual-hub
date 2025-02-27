import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { ColyseusModule } from '@modules/colyseus/colyseus.module';
import { MapModule } from '@modules/map/map.module';
import { UserModule } from '@modules/user/user.module';
import config, { envFilePath } from '@config/env.config';

import { dataSourceOption } from './config/data-source.config';
import { ItemModule } from '@modules/item/item.module';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: envFilePath,
    }),
    TypeOrmModule.forRoot(dataSourceOption),
    // ColyseusModule,
    AuthModule,
    UserModule,
    ItemModule,
    MapModule,
    LoggerModule,
  ],
})
export class AppModule {}
