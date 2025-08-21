import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { TransactionsEntity } from '../../transactions/entity/transactions.entity';
import { TransactionsService } from './transactions.service';
import { UserModule } from '@modules/user/user.module';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionsEntity]),
    ClsModule,
    JwtModule,
    UserModule,
    LoggerModule
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }
