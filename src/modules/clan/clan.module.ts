import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanController } from './clan.controller';
import { ClanService } from './clan.service';
import { ClanEntity } from './entity/clan.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanRequestModule } from '@modules/clan-request/clan-request.module';
import { ClanRequestEntity } from '@modules/clan-request/entity/clan-request.entity';
import { ClanMemberController } from './clan-member.controller';
import { ClanMemberService } from './clan-member.service';
import { ClanBroadcastService } from '@modules/clan/events/clan-broadcast.service';
import { ClanBroadcastEventsListener } from './events/clan-broadcast.listener';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';
import { ClanActivityController } from './clan-activity.controller';
import { ClanActivityService } from './clan-activity.service';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundTransactionEntity } from '@modules/clan-fund/entity/clan-fund-transaction.entity';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClanEntity, UserEntity, ClanRequestEntity, UserClanStatEntity, ClanWarehouseEntity, ClanFundTransactionEntity, SlotsPlantEntity]),
    ClsModule,
    JwtModule,
    forwardRef(() => UserModule),
    forwardRef(() => ClanRequestModule),
  ],
  providers: [
    ClanService,
    ClanMemberService,
    ClanBroadcastService,
    ClanBroadcastEventsListener,
    ClanActivityService
  ],
  controllers: [ClanController, ClanMemberController, ClanActivityController],
  exports: [
    ClanService,
    ClanBroadcastService,
    ClanActivityService
  ],
})
export class ClanModule {}
