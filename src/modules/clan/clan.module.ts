import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanController } from './clan.controller';
import { ClanService } from './clan.service';
import { ClanEntity } from './entity/clan.entity';
import { UserEntity } from '@modules/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClanEntity, UserEntity]), 
    ClsModule, 
    JwtModule,
    forwardRef(() => UserModule),
  ],
  providers: [ClanService],
  controllers: [ClanController],
  exports: [ClanService],
})
export class ClanModule {}
