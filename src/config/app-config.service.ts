import { COMMA } from '@constant';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {}

  isProduction() {
    return this.configService.get('NODE_ENV') === 'production';
  }

  isLocal() {
    return this.configService.get<string>('SUFFIX_ENV_NAME') === 'local';
  }

  fileLogLevel() {
    return this.configService.get<string>('LOG_FILE_LEVEL');
  }

  isUseLogFile() {
    return this.configService.get<string>('LOG_FILE_USE') === 'true';
  }

  consoleLogLevel() {
    return this.configService.get<string>('LOG_CONSOLE_LEVEL');
  }

  isUseLogColor() {
    return this.configService.get<string>('LOG_COLOR');
  }

  database() {
    return {
      url: this.configService.get<string>('DATABASE_URL'),
    };
  }

  jwt() {
    return {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      refreshSecret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      accessTokenExpiration: this.configService.get<number>(
        'JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES',
      ),
      refreshTokenExpiration: this.configService.get<number>(
        'JWT_REFRESH_TOKEN_EXPIRES_IN_MINUTES',
      ),
    };
  }

  cors() {
    return {
      origin: this.configService.get<string>('ALLOW_ORIGINS')?.split(COMMA),
    };
  }
}
