import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { ItemModule } from '@modules/auth/item/item.module';
import { ColyseusModule } from '@modules/colyseus/colyseus.module';
import { MapModule } from '@modules/map/map.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST || 'localhost',
    //   port: Number(process.env.DB_PORT) || 5432,
    //   username: process.env.DB_USER || 'user',
    //   password: process.env.DB_PASS || 'password',
    //   database: process.env.DB_NAME || 'game_db',
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),

    ColyseusModule,
    AuthModule,
    UserModule,
    ItemModule,
    MapModule,
  ],
})
export class AppModule {}
