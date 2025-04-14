import { LoggerModule } from '@libs/logger';
import { TransactionEntity } from '@modules/transaction/entity/transaction.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MezonService } from './mezon.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TransactionEntity]), LoggerModule],
  providers: [MezonService],
  exports: [MezonService],
})
export class MezonModule {}
