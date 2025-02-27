import { DataSource, DataSourceOptions } from "typeorm";

import config from "./env.config";

export const dataSourceOption: DataSourceOptions = {
  name: "default",
  type: "postgres",
  database: config().DB_NAME,
  host: config().DB_HOST,
  port: +(config().DB_PORT ?? 5432),
  username: config().DB_USERNAME,
  password: config().DB_PASSWORD,
  synchronize: false,
  logging: true,
  entities: ["dist/modules/**/entity/*.entity.{js,ts}"],
  migrations: ["dist/migrations/*.{js,ts}"],
  subscribers: [],
  schema: config().DB_SCHEMA ?? "public",
  migrationsRun: true,
};

export default new DataSource(dataSourceOption);
