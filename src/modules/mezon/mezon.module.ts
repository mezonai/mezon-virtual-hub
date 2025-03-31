import { Module } from '@nestjs/common';
import { MezonService } from './mezon.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), LoggerModule],
  providers: [MezonService],
  exports: [MezonService],
})
export class MezonModule {}
