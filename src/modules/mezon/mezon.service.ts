import { configEnv } from '@config/env.config';
import { SYSTEM_ERROR } from '@constant';
import { Logger } from '@libs/logger';
import { GenericRepository } from '@libs/repository/genericRepository';
import { TransactionsService } from '@modules/admin/transactions/transactions.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  MezonTokenSentEvent,
  WithdrawMezonPayload,
  WithdrawMezonResult,
} from '@types';
import axios from 'axios';
import { APISentTokenRequest, Events, MezonClient } from 'mezon-sdk';
import moment from 'moment';
import { EntityManager } from 'typeorm';
import * as QRCode from 'qrcode';
import { TokenSentEvent } from 'mezon-sdk/dist/cjs/api/api';

@Injectable()
export class MezonService implements OnModuleInit, OnModuleDestroy {
  private readonly userRepository: GenericRepository<UserEntity>;
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;

  private readonly WEBHOOK_URL = configEnv().MEZON_CHANNEL_WEBHOOK_URL;

  constructor(
    private manager: EntityManager,
    private readonly transactionService: TransactionsService,
  ) {
    this.userRepository = new GenericRepository(UserEntity, manager);
  }

  async onModuleInit() {
    this.logger.log('Initializing Mezon client...');
    await this.loginMezon();

    // this.client.on(Events.TokenSend, async (event: MezonTokenSentEvent) => {
    //   await this.transferTokenToDiamond(event);
    //   console.log('event', event);
    // });

    this.client.onTokenSend(async (data: TokenSentEvent) => {
      console.log('data', data);
      await this.transferTokenToDiamond(data);
    });

    this.logger.log('Mezon event listeners set up.');
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Mezon client...');
  }

  async transferTokenToDiamond(data: MezonTokenSentEvent) {
    if (data.receiver_id !== configEnv().MEZON_TOKEN_RECEIVER_APP_ID) return;

    const success =
      await this.transactionService.handleDepositTransaction(data);
    if (success) {
      return this.logger.log(
        `Deposit successful | User: ${data?.sender_name} | Amount: ${data.amount} diamond`,
      );
    }
    this.logger.error(
      `Deposit Failed | User: ${data?.sender_name} | Amount: ${data.amount} diamond`,
    );
  }

  async withdrawTokenRequest(
    sendTokenData: WithdrawMezonPayload,
    userId: string,
  ): Promise<WithdrawMezonResult> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user?.mezon_id) {
      return { success: false, message: 'Tài khoản không liên kết với Mezon' };
    }

    const currentDiamond = user.diamond;
    const amountToWithdraw = sendTokenData.amount;

    if (
      typeof currentDiamond !== 'number' ||
      currentDiamond < amountToWithdraw
    ) {
      return { success: false, message: 'Không đủ Diamond để rút' };
    }

    try {
      const payloadWithdraw: APISentTokenRequest = {
        ...sendTokenData,
        receiver_id: user.mezon_id,
        sender_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID,
        sender_name: 'Virtual-Hub',
        amount: amountToWithdraw,
      };

      const success = await this.transactionService.handleWithdrawTransaction(
        payloadWithdraw,
        user,
      );

      if (!success) {
        return { success: false };
      }

      await this.client.sendToken(payloadWithdraw);

      this.logger.log(
        `Withdraw successful | User: ${user?.username} | Amount: ${sendTokenData.amount} token`,
      );

      return { success: true };
    } catch (err) {
      this.logger.error(
        `Withdraw Failed | User: ${user?.username} | Amount: ${sendTokenData.amount} token: ${err?.toString()}`,
      );
      return { success: false, message: SYSTEM_ERROR };
    }
  }

  private async sendWebhookMessage(content: { t: string }) {
    if (!this.WEBHOOK_URL) return;
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

  async loginMezon() {
    const botId = configEnv().MEZON_TOKEN_RECEIVER_APP_ID;
    const token = configEnv().MEZON_TOKEN_RECEIVER_APP_TOKEN ;
    if(!botId || !token) return;
    try {
      this.client = new MezonClient({
        botId,
        token,
      });
      this.client.login().catch((e)=>{console.log(e);});

      this.logger.log('Mezon client authenticated in module init');

      await this.sendWebhookMessage({
        t: `Mezon client initializes successfully at: ${moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')} (Asia/Ho_Chi_Minh Time)`,
      });
    } catch (error) {
      this.logger.error('Mezon client authenticated failed', error);
      await this.sendWebhookMessage({
        t: `FAILED: Mezon client initializes failed at: ${moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')} (Asia/Ho_Chi_Minh Time) ${error}`,
      });
    }
  }

   async generateMezonReceiverQr(): Promise<{
      qr_base64: string;
    }> {
      const payload = {
        receiver_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID,
        receiver_name: 'mezon_bot',
      };
  
      const text = JSON.stringify(payload);
  
      const qrBase64 = await QRCode.toDataURL(text, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
  
      return {
        qr_base64: qrBase64,
      };
    }
}
