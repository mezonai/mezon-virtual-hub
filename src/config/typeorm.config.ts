import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSource, getMetadataArgsStorage } from 'typeorm';
import { envFilePath } from './env-path.config';
import { AppConfigService } from './app-config.service';

@Injectable()
export class TypeOrmModuleConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: AppConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.database().url,
      entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
      migrations: ['dist/src/migrations/*.js'],
      synchronize: false,
      migrationsRun: true,
      logging: true,
      ssl: { rejectUnauthorized: false },
    };
  }
}

config({ path: envFilePath });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
  migrations: ['dist/src/migrations/*.js'],
  synchronize: false,
  logging: true,
});
