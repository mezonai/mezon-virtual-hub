import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanRequestEntity } from './entity/clan-request.entity';
import { ClanRequestController } from './clan-request.controller';
import { ClanRequestService } from './clan-request.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ClanModule } from '@modules/clan/clan.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClanRequestEntity, ClanEntity, UserEntity, UserClanStatEntity]),
    ClsModule,
    EventEmitterModule.forRoot(),
    forwardRef(() => ClanModule),
  ],
  providers: [
    ClanRequestService
  ],
  controllers: [ClanRequestController],
  exports: [ClanRequestService],
})
export class ClanRequestModule {}
