import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { UserClanStatEntity } from './entity/user-clan-stat.entity';
import { UserClanStatController } from './user-clan-stat.controller';
import { UserClanStatService } from './user-clan-stat.service';
import { WeeklyResetService } from './weekly-reset.service';
import { DailyResetService } from './daily-reset.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { RewardManagementModule } from '@modules/admin/reward/reward.module';
import { ClanModule } from '@modules/clan/clan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserClanStatEntity, UserEntity]),
    ClsModule,
    RewardManagementModule,
    ClanModule
  ],
  providers: [UserClanStatService, WeeklyResetService, DailyResetService],
  controllers: [UserClanStatController],
})
export class UserClanStatModule {}
