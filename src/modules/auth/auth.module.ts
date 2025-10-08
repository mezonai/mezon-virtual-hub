import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OAuth2Service } from './oauth2.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { PlayerQuestModule } from '@modules/player-quest/player-quest.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({}),
    PassportModule,
    ClsModule,
    PlayerQuestModule,
  ],
  providers: [AuthService, JwtStrategy, OAuth2Service],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
