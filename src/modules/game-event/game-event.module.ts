import { Module } from '@nestjs/common';
import { GameEventController } from './game-event.controller';
import { UserEntity } from '@modules/user/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { GameEventService } from './game-event.service';
import { GameEventEntity } from './entity/game-event.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, GameEventEntity]),
    ClsModule,
    JwtModule,
  ],
  providers: [GameEventService],
  exports: [GameEventService],
  controllers: [GameEventController]
})
export class GameEventModule { }
