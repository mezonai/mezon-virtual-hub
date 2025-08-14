import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { RequireAdmin } from '@libs/decorator';
import { ClsService } from 'nestjs-cls';
import { TransactionsQueryDto } from './dto/transactions.dto';
import { TransactionsService } from './transactions.service';

@ApiBearerAuth()
@ApiTags('Admin - Transactions')
@Controller('transactions')
@RequireAdmin()
export class TransactionsController {
  constructor(
    private readonly clsService: ClsService,
    private readonly transactionService: TransactionsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TransactionsController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all transactions information',
  })

  async getAllTransactions(@Query() query: TransactionsQueryDto) {
    return await this.transactionService.getAllTransaction(query);
  }
}
