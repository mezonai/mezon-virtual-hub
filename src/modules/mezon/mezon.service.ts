import { configEnv } from '@config/env.config';
import { GenericRepository } from '@libs/repository/genericRepository';
import { TransactionEntity } from '@modules/transaction/entity/transaction.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MezonTokenSentEvent } from '@types';
import axios from 'axios';
import { Events, MezonClient, TokenSentEvent } from 'mezon-sdk';
import moment from 'moment';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class MezonService implements OnModuleInit, OnModuleDestroy {
  private readonly userRepository: GenericRepository<UserEntity>;
  @InjectRepository(TransactionEntity)
  private readonly transactionRepository: Repository<TransactionEntity>;
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;

  private readonly WEBHOOK_URL = configEnv().MEZON_CHANNEL_WEBHOOK_URL;

  constructor(private manager: EntityManager) {
    this.userRepository = new GenericRepository(UserEntity, manager);
  }

  async onModuleInit() {
    this.logger.log('Initializing Mezon client...');
    this.client = new MezonClient(configEnv().MEZON_TOKEN_RECEIVER_APP_TOKEN);
    await this.client.login();

    this.logger.log('Mezon client authenticated in module init');

    await this.sendWebhookMessage({
      t: `Mezon client initializes successfully at: ${moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')} (Asia/Ho_Chi_Minh Time)`,
    });

    this.client.on(Events.TokenSend, async (event: MezonTokenSentEvent) => {
      await this.transferTokenToDiamond(event);
    });

    this.logger.log('Mezon event listeners set up.');
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Mezon client...');
  }

  async transferTokenToDiamond(data: MezonTokenSentEvent) {
    if (data.receiver_id !== configEnv().MEZON_TOKEN_RECEIVER_APP_ID) return;

    const user = await this.userRepository.findOne({
      where: { mezon_id: data.sender_id },
    });

    if (!user) {
      this.logger.error(
        `User ${data.sender_name} with Mezon id ${data.sender_id} not found`,
      );
      return;
    }

    const { amount, extra_attribute, receiver_id, transaction_id } = data;

    const transaction = this.transactionRepository.create({
      mezon_transaction_id: transaction_id,
      amount,
      extra_attribute,
      receiver_id,
      sender: user,
    });

    try {
      await this.transactionRepository.save(transaction);
      const updatedDiamond = user.diamond + amount;
      await this.userRepository.update(user.id, { diamond: updatedDiamond });

      this.logger.log(
        `Transaction saved: ${transaction_id} for user ${user.id}`,
      );
      this.logger.log(`Updated user ${user.id} diamond to ${updatedDiamond}`);

      await this.sendWebhookMessage({
        t: `Token transferred by ${user.email || user.username}: ${amount}`,
      });
    } catch (error) {
      const existing = await this.transactionRepository.findOne({
        where: { mezon_transaction_id: transaction_id },
      });

      if (existing) {
        this.logger.warn(
          `Transaction ${transaction_id} already exists (user: ${user.id}).`,
        );
      } else {
        this.logger.error(`Transaction ${transaction_id} failed to save.`);
      }
    }
  }

  async WithdrawTokenRequest(sendTokenData: TokenSentEvent) {
    this.client.sendToken(sendTokenData);

    this.sendWebhookMessage({
      t: `Token sent to ${sendTokenData.receiver_id}: ${sendTokenData.amount}`,
    });
  }

  private async sendWebhookMessage(content: { t: string }) {
    if(!this.WEBHOOK_URL) return;
    try {
      await axios.post(
        this.WEBHOOK_URL,
        {
          type: 'hook',
          message: {
            t: content.t,
            mk: [
              {
                type: 'pre',
                s: 0,
                e: content.t.length,
              },
            ],
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send webhook: ${error.message}`);
    }
  }

  getClient(): MezonClient {
    return this.client;
  }

  async restartMezon() {
    this.client = new MezonClient(configEnv().MEZON_TOKEN_RECEIVER_APP_TOKEN);
    await this.client.login();
  }
}
