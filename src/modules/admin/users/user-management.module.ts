import { LoggerModule } from '@libs/logger';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementService } from './user-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({}),
    LoggerModule,
  ],
  providers: [UserManagementService],
  exports: [UserManagementService],
})
export class UserManagementModule {}
