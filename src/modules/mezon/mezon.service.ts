import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MezonClient, Events, TokenSentEvent } from 'mezon-sdk';
import { configEnv } from '@config/env.config';
import { GenericRepository } from '@libs/repository/genericRepository';
import { UserEntity } from '@modules/user/entity/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class MezonService implements OnModuleInit, OnModuleDestroy {
  private readonly userRepository: GenericRepository<UserEntity>;
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;
  constructor(
    private manager: EntityManager,
  ) {
    this.userRepository = new GenericRepository(UserEntity, manager);
  }

  async onModuleInit() {
    this.logger.log('Initializing Mezon client...');

    this.client = new MezonClient(configEnv().MEZON_APPLICATION_TOKEN);
    await this.client.authenticate();

    this.logger.log('Mezon client authenticated in module init');

    this.client.on(Events.TokenSend, async (event: TokenSentEvent) => {
      this.logger.log(`Received TokenSend event mezon service: ${JSON.stringify(event)}`);
      if (event.receiver_id === process.env.BOT_ID) {
        // Handle token received event
        this.logger.log(`Processing token for receiver: ${event.receiver_id}`);
        // Example: Call service to process transaction
        // await TransactionService.OnBuyItem(event);
      }
    });

    this.client.on(Events.ChannelMessage, (event) => {
      this.logger.log(`Received ChannelMessage: ${JSON.stringify(event)}`);
      if (event?.content?.t === '*ping') {
        this.client.sendMessage(
          event.clan_id,
          event.channel_id,
          event.mode,
          event.is_public,
          { t: 'pong' },
          [],
          [],
          [
            {
              message_id: '',
              message_ref_id: event.message_id,
              ref_type: 0,
              message_sender_id: event.sender_id,
              message_sender_username: event.username,
              mesages_sender_avatar: event.avatar,
              message_sender_clan_nick: event.clan_nick,
              message_sender_display_name: event.display_name,
              content: JSON.stringify(event.content),
              has_attachment: false,
            },
          ],
        );
      }
    });

    this.logger.log('Mezon event listeners set up.');
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Mezon client...');
    // Perform cleanup if needed
  }

  async transferTokenToGold(data: TokenSentEvent) {
    this.logger.log(`Received TokenSend event`);

    if (data.receiver_id === configEnv().MEZON_APPLICATION_ID) {
      this.logger.log(`Processing token for receiver: ${data.receiver_id}`);

      const user = await this.userRepository.findOne({
        where: { mezon_id: data.sender_id }
      })

      if (!user) {
        this.logger.error(`User ${data.sender_name} with Mezon id ${data.sender_id} not found`);
        return
      }

      const updatedGold = user.gold + data.amount;

      await this.userRepository.update(user.id, { gold: updatedGold });
  
      this.logger.log(
        `Updated user ${user.id} gold from ${user.gold} to ${updatedGold}`
      );
    } else {
      this.logger.log(`Skipping processing for receiver: ${data.receiver_id}`);
    }
  }

  getClient(): MezonClient {
    return this.client;
  }
}
