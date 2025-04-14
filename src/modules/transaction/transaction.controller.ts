import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { Public } from '@libs/decorator';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { TransactionService } from './transaction.service';
import { AdminBypassGuard } from '@libs/guard/admin.guard';

@ApiBearerAuth()
@ApiTags('Transaction')
@Controller('transaction')
@UseGuards(AdminBypassGuard)
export class TransactionController {
  constructor(
    private readonly clsService: ClsService,
    private readonly transactionService: TransactionService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TransactionController.name);
  }

  @Get('')
  @Public()
  @ApiOperation({
    summary: 'Get list all transactions information',
  })
  async getAllTransactions() {
    return await this.transactionService.getAllTransaction();
  }
}
