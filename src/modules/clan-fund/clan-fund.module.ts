import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClanFundEntity } from './entity/clan-fund.entity';
import { ClanFundController } from './clan-fund.controller';
import { ClanFundService } from './clan-fund.service';
import { ClanFundTransactionEntity } from './entity/clan-fund-transaction.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClanFundEntity,
      ClanFundTransactionEntity,
      ClanEntity,
    ]),
    ClsModule,
  ],
  providers: [ClanFundService],
  controllers: [ClanFundController],
})
export class ClanFundModule {}
