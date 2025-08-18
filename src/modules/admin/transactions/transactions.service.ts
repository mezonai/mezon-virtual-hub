import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { TransactionsEntity } from '../../transactions/entity/transactions.entity';
import {
  TransactionResponseDto,
  TransactionsQueryDto,
} from './dto/transactions.dto';
import { Pageable } from '@types';
import { plainToInstance } from 'class-transformer';
import { TransactionType } from '@enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionsEntity)
    private readonly transactionRepository: Repository<TransactionsEntity>,
    private manager: EntityManager,
  ) {}

  async getAllTransaction(query: TransactionsQueryDto) {
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      order = 'DESC',
      search,
    } = query;

    const where: FindOptionsWhere<TransactionsEntity>[] = [];

    if (search) {
      where.push(
        { mezon_transaction_id: ILike(`%${search}%`) },
        { user: { username: ILike(`%${search}%`) } },
        { receiver_id: ILike(`%${search}%`) },
      );
    }

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: where.length > 0 ? where : undefined,
        relations: ['user'],
        take: limit,
        skip: (page - 1) * limit,
        order: {
          [sort_by]: order,
        },
        select: {
          user: {
            username: true,
            id: true,
          },
        },
      },
    );

    const transformTransactions = plainToInstance(
      TransactionResponseDto,
      transactions,
    );

    return new Pageable(transformTransactions, {
      size: limit,
      page,
      total,
    });
  }
}
