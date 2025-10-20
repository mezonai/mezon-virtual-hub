import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanRequestEntity } from './entity/clan-request.entity';
import { ClanRequestController } from './clan-request.controller';
import { ClanRequestService } from './clan-request.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ClanBroadcastService } from '../clan/events/clan-broadcast.service';
import { ClanModule } from '@modules/clan/clan.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClanBroadcastEventsListener } from '@modules/clan/events/clan-broadcast.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClanRequestEntity, ClanEntity, UserEntity]),
    ClsModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    ClanRequestService,
    ClanBroadcastService,
    ClanBroadcastEventsListener,
  ],
  controllers: [ClanRequestController],
  exports: [ClanRequestService],
})
export class ClanRequestModule {}
