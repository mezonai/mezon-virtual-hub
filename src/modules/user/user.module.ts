import { LoggerModule } from '@libs/logger';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ClanEntity, Inventory]),
    JwtModule.register({}),
    LoggerModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
