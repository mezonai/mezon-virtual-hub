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

@Module({
  imports: [
    TypeOrmModule.forFeature([ClanEntity, UserEntity, ClanRequestEntity]),
    ClsModule,
    JwtModule,
    forwardRef(() => UserModule),
    ClanRequestModule,
  ],
  providers: [ClanService],
  controllers: [ClanController],
  exports: [ClanService],
})
export class ClanModule {}
