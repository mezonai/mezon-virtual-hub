import { DataSource, DataSourceOptions } from 'typeorm';
import { configEnv } from './env.config';

export const dataSourceOption: DataSourceOptions = {
  name: 'default',
  type: 'postgres',
  database: configEnv().DB_NAME,
  host: configEnv().DB_HOST,
  port: configEnv().DB_PORT,
  username: configEnv().DB_USERNAME,
  password: configEnv().DB_PASSWORD,
  synchronize: false,
  logging: ['error', 'warn'],
  entities: ['dist/modules/**/entity/*.entity.{js,ts}'],
  migrations: ['dist/migrations/*.{js,ts}'],
  subscribers: [],
  schema: configEnv().DB_SCHEMA,
  migrationsRun: true,
};

export default new DataSource(dataSourceOption);
