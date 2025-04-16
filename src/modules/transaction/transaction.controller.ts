import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { Public } from '@libs/decorator';
import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { ClsService } from 'nestjs-cls';
import { TransactionService } from './transaction.service';

@ApiBearerAuth()
@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly clsService: ClsService,
    private readonly transactionService: TransactionService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TransactionController.name);
  }

  @Get()
  @UseGuards(AdminBypassGuard)
  @ApiOperation({
    summary: 'Get list all transactions information',
  })
  async getAllTransactions() {
    return await this.transactionService.getAllTransaction();
  }
}
