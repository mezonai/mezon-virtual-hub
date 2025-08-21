import { LoggerModule } from '@libs/logger';
import { TransactionsEntity } from '@modules/transactions/entity/transactions.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MezonService } from './mezon.service';
import { MezonController } from './mezon.controller';
import { TransactionsModule } from '@modules/admin/transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TransactionsEntity]), LoggerModule, TransactionsModule],
  controllers: [MezonController],
  providers: [MezonService],
  exports: [MezonService],
})
export class MezonModule {}
