import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { MezonClient, Events, TokenSentEvent } from 'mezon-sdk';
import { configEnv } from '@config/env.config';
import { GenericRepository } from '@libs/repository/genericRepository';
import { UserEntity } from '@modules/user/entity/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { MezonTokenSentEvent } from '@types';
import { TransactionEntity } from '@modules/transaction/entity/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MezonService implements OnModuleInit, OnModuleDestroy {
  private readonly userRepository: GenericRepository<UserEntity>;
  @InjectRepository(TransactionEntity)
  private readonly transactionRepository: Repository<TransactionEntity>;
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;
  constructor(private manager: EntityManager) {
    this.userRepository = new GenericRepository(UserEntity, manager);
  }

  async onModuleInit() {
    this.logger.log('Initializing Mezon client...');

    this.client = new MezonClient(configEnv().MEZON_TOKEN_RECEIVER_APP_TOKEN);
    await this.client.login();

    this.logger.log('Mezon client authenticated in module init');

    this.client.on(Events.TokenSend, async (event: MezonTokenSentEvent) => {
      this.transferTokenToGold(event);
    });

    // this.client.on(Events.ChannelMessage, (event) => {
    //   this.logger.log(`Received ChannelMessage: ${JSON.stringify(event)}`);
    //   if (event?.content?.t === '*ping') {
    //     this.client.sendMessage(
    //       event.clan_id,
    //       event.channel_id,
    //       event.mode,
    //       event.is_public,
    //       { t: 'pong' },
    //       [],
    //       [],
    //       [
    //         {
    //           message_id: '',
    //           message_ref_id: event.message_id,
    //           ref_type: 0,
    //           message_sender_id: event.sender_id,
    //           message_sender_username: event.username,
    //           mesages_sender_avatar: event.avatar,
    //           message_sender_clan_nick: event.clan_nick,
    //           message_sender_display_name: event.display_name,
    //           content: JSON.stringify(event.content),
    //           has_attachment: false,
    //         },
    //       ],
    //     );
    //   }
    // });

    this.logger.log('Mezon event listeners set up.');
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Mezon client...');
    // Perform cleanup if needed
  }

  async transferTokenToGold(data: MezonTokenSentEvent) {
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
      this.logger.log(
        `Transaction saved: ${transaction_id} for user ${user.id}`,
      );

      const updatedGold = user.gold + amount;
      await this.userRepository.update(user.id, { gold: updatedGold });

      this.logger.log(
        `Updated user ${user.id} gold from ${user.gold} to ${updatedGold}`,
      );
    } catch (error) {
      const existing = await this.transactionRepository.findOne({
        where: { mezon_transaction_id: transaction_id },
      });

      if (existing) {
        this.logger.warn(
          `Transaction with ID ${transaction_id} already exists in DB (user: ${user.id}).`,
        );
      } else {
        this.logger.error(
          `Transaction ${transaction_id} not found after failed save — potential issue.`,
        );
      }
    }
  }

  getClient(): MezonClient {
    return this.client;
  }
}
