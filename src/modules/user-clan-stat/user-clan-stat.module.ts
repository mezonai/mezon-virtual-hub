import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { UserClanStatEntity } from './entity/user-clan-stat.entity';
import { UserClanStatController } from './user-clan-stat.controller';
import { UserClanStatService } from './user-clan-stat.service';
import { ScheduleModule } from '@nestjs/schedule';
import { WeeklyResetService } from './weekly-reset.service';
import { DailyResetService } from './daily-reset.service';
import { UserEntity } from '@modules/user/entity/user.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([UserClanStatEntity, UserEntity]), ClsModule],
  providers: [UserClanStatService, WeeklyResetService, DailyResetService],
  controllers: [UserClanStatController],
})
export class UserClanStatModule {}
