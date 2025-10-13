import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanRequestEntity } from './entity/clan-request.entity';
import { ClanRequestController } from './clan-request.controller';
import { ClanRequestService } from './clan-request.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClanRequestEntity, ClanEntity, UserEntity]),
    ClsModule,
  ],
  providers: [ClanRequestService],
  controllers: [ClanRequestController],
  exports: [ClanRequestService],
})
export class ClanRequestModule {}
