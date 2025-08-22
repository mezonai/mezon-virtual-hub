import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { TransactionsEntity } from '../../transactions/entity/transactions.entity';
import {
  TransactionResponseDto,
  TransactionsQueryDto,
} from './dto/transactions.dto';
import { MezonTokenSentEvent, Pageable } from '@types';
import { plainToInstance } from 'class-transformer';
import { TransactionCurrency, TransactionType } from '@enum';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Logger } from '@libs/logger';
import { UserService } from '@modules/user/user.service';
import { configEnv } from '@config/env.config';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name)
  constructor(
    @InjectRepository(TransactionsEntity)
    private readonly transactionRepository: Repository<TransactionsEntity>,
    private readonly userService: UserService,
    private manager: EntityManager,
  ) { }

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

  async handleDepositTransaction(data: MezonTokenSentEvent): Promise<boolean> {
    const { transaction_id, amount, extra_attribute, receiver_id, sender_id, sender_name } = data;

    const [user, bot] = await Promise.all([
      this.userService.findOne({
        where: { mezon_id: data.sender_id },
      }),
      this.userService.findOne({
        where: { mezon_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID },
      }),
    ]);

    if (!user) {
      this.logger.error(
        `User ${sender_name} with Mezon id ${sender_id} not found`,
      );
      return false;
    }

    if (!bot) {
      this.logger.error(
        `BOT with mezon_id: ${configEnv().MEZON_TOKEN_RECEIVER_APP_ID} not found`,
      );
    }

    const existing = await this.transactionRepository.findOne({
      where: { mezon_transaction_id: transaction_id },
    });

    if (existing) {
      this.logger.warn(
        `Transaction ${transaction_id} already exists | User: ${user?.username}.`,
      );
      return false;
    }

    const transaction = this.transactionRepository.create({
      mezon_transaction_id: transaction_id,
      amount,
      extra_attribute,
      receiver_id,
      user,
      currency: TransactionCurrency.TOKEN,
      type: TransactionType.DEPOSIT,
    });

    try {
      await this.transactionRepository.save(transaction);

      await Promise.all([
        this.userService.increment({ id: user.id }, 'diamond', amount),
        this.userService.increment(
          { mezon_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID },
          'diamond',
          amount,
        ),
      ]);

      return true;
    } catch (error) {
      this.logger.error(
        `Transaction ${transaction_id} Failed | User: ${user?.username}: ${error.message}`,
      );
      return false;
    }
  }

  async handleWithdrawTransaction(data: { amount: number, extra_attribute?: string }, user: UserEntity) {
    const { amount, extra_attribute } = data;
    try {
      const transaction = this.transactionRepository.create({
        amount,
        extra_attribute,
        receiver_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID,
        user,
        currency: TransactionCurrency.TOKEN,
        type: TransactionType.WITHDRAW,
      });

      const bot = await this.userService.findOne({
        where: { mezon_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID },
      });

      if (bot && bot.diamond < amount) {
        this.logger.error(
          `BOT ${configEnv().MEZON_TOKEN_RECEIVER_APP_ID} does not have enough balance (current: ${bot?.diamond}) to process withdrawal for user ${user?.username}`,
        );
        return false;
      }

      await Promise.all([
        this.userService.decrement({ id: user.id }, 'diamond', amount),
        this.userService.decrement(
          { mezon_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID },
          'diamond',
          amount,
        ),
      ]);

      this.transactionRepository.save(transaction);
      return true;
    } catch (error) {
      this.logger.error(
        `WithdrawTransaction Failed | User: ${user?.username}: ${error.message}`,
      );
      throw error;
    }
  }
}
