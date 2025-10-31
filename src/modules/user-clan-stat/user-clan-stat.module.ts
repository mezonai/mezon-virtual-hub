import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { UserClanStatEntity } from './entity/user-clan-stat.entity';
import { UserClanStatController } from './user-clan-stat.controller';
import { UserClanStatService } from './user-clan-stat.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserClanStatEntity]), ClsModule],
  providers: [UserClanStatService],
  controllers: [UserClanStatController],
})
export class UserClanStatModule {}
