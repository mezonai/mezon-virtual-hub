import { LoggerModule } from '@libs/logger';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, MapEntity, Inventory]),
    JwtModule.register({}),
    LoggerModule,
  ],
  controllers: [UserController, UserManagementController],
  providers: [UserService, UserManagementService],
  exports: [UserService],
})
export class UserModule {}
