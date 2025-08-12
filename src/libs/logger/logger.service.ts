import { ConsoleLogger, LoggerService } from '@nestjs/common';
import axios from 'axios';
import { configEnv } from '@config/env.config';

const ignoreContext = ['RoutesResolver', 'InstanceLoader', 'RouterExplorer'];

export class Logger extends ConsoleLogger implements LoggerService {
  private readonly WEBHOOK_URL = configEnv().MEZON_CHANNEL_WEBHOOK_URL;

  constructor(context?: string) {
    super(context || Logger.name);
  }

  async log(message: string, context?: string) {
    if (!ignoreContext.find((e) => context?.includes(e))) {
      super.log(message, context || this.context);
      await this.sendWebhook(message);
    }
  }

  async error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || this.context);
    await this.sendWebhook(`ERROR: ${message}`);
  }

  async warn(message: string, context?: string) {
    super.warn(message, context || this.context);
    await this.sendWebhook(`WARN: ${message}`);
  }

  async debug(message: string, context?: string) {
    super.debug(message, context || this.context);
    await this.sendWebhook(`DEBUG: ${message}`);
  }

  async verbose(message: string, context?: string) {
    super.verbose(message, context || this.context);
    await this.sendWebhook(`VERBOSE: ${message}`);
  }

  private async sendWebhook(content: string) {
    if (!this.WEBHOOK_URL) return;
    try {
      await axios.post(
        this.WEBHOOK_URL,
        {
          type: 'hook',
          message: {
            t: content,
            mk: [{ type: 'pre', s: 0, e: content.length }],
          },
        },
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (error) {
      super.error(`Failed to send webhook: ${error.message}`);
    }
  }
}
