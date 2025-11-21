import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanActivityEntity } from './entity/clan-activity.entity';
import { ClanActivityController } from './clan-activity.controller';
import { ClanActivityService } from './clan-activity.service';
import { UserEntity } from '@modules/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClanActivityEntity, UserEntity]), ClsModule],
  providers: [ClanActivityService],
  controllers: [ClanActivityController],
  exports:[ClanActivityService]
})
export class ClanActivityModule {}
