import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { ClsService } from 'nestjs-cls';
import { TransactionsService } from './transactions.service';
import { TransactionsQueryDto } from './dto/transactions.dto';

@ApiBearerAuth()
@ApiTags('Admin - Transactions')
@Controller('transactions')
@UseGuards(AdminBypassGuard)
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
