import * as dotenv from 'dotenv';
import * as Joi from 'joi';

const ENV = process.env.ENV ?? 'local';
export const envFilePath = `.env.${ENV}`;
dotenv.config({ path: envFilePath });

const validateEnv = {
  PORT: Joi.number().default(8000),
  GAME_PORT: Joi.number().default(8001),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_SCHEMA: Joi.string().default('public'),
  OAUTH2_CLIENT_ID: Joi.string().required(),
  OAUTH2_CLIENT_SECRET: Joi.string().required(),
  OAUTH2_REDIRECT_URI: Joi.string().required(),
  OAUTH2_API_URL: Joi.string().required(),
  OAUTH2_URL_TOKEN_PATH: Joi.string().required(),
  OAUTH2_URL_DECODE_PATH: Joi.string().required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES: Joi.number().default(60),
  JWT_REFRESH_TOKEN_EXPIRES_IN_MINUTES: Joi.number().default(10080),
  MEZON_APPLICATION_ID: Joi.string().required(),
};

export const configValidationSchema = Joi.object(validateEnv);

export const configEnv = () => ({
  PORT: Number(process.env.PORT),
  GAME_PORT: Number(process.env.GAME_PORT),
  DB_NAME: process.env.POSTGRES_DB!,
  DB_PORT: Number(process.env.POSTGRES_PORT),
  DB_HOST: process.env.POSTGRES_HOST!,
  DB_USERNAME: process.env.POSTGRES_USERNAME!,
  DB_PASSWORD: process.env.POSTGRES_PASSWORD!,
  DB_SCHEMA: process.env.POSTGRES_SCHEMA!,
  OAUTH2_CLIENT_ID: process.env.OAUTH2_CLIENT_ID!,
  OAUTH2_CLIENT_SECRET: process.env.OAUTH2_CLIENT_SECRET!,
  OAUTH2_REDIRECT_URI: process.env.OAUTH2_REDIRECT_URI!,
  OAUTH2_API_URL: process.env.OAUTH2_API_URL!,
  OAUTH2_URL_TOKEN_PATH: process.env.OAUTH2_URL_TOKEN_PATH!,
  OAUTH2_URL_DECODE_PATH: process.env.OAUTH2_URL_DECODE_PATH!,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET!,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET!,
  JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES: Number(
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES,
  ),
  JWT_REFRESH_TOKEN_EXPIRES_IN_MINUTES: Number(
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MINUTES,
  ),
  MEZON_APPLICATION_ID: process.env.MEZON_APPLICATION_ID!,
});
