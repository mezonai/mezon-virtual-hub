import { TransactionsEntity } from '@modules/transactions/entity/transactions.entity';
import { QueryParamsDto } from '@types';
import { Expose, Transform } from 'class-transformer';

export class TransactionsQueryDto extends QueryParamsDto {}

export class TransactionResponseDto extends TransactionsEntity {}
