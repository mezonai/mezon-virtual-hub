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
  MEZON_APPLICATION_TOKEN: Joi.string().required(),
  MEZON_APPLICATION_ID: Joi.string().required(),
  MEZON_TOKEN_RECEIVER_APP_ID: Joi.string().required(),
  MEZON_TOKEN_RECEIVER_APP_TOKEN: Joi.string().required(),
  GOOGLE_GEN_AI_API_KEY: Joi.string().required(),
  QUIZ_PROMPT_CONTENT: Joi.string().required(),
  QUIZ_PROMPT_RESPONSE_FORMAT: Joi.string().required(),
};

export const configValidationSchema = Joi.object(validateEnv);

export const configEnv = () => ({
  ALLOWED_ORIGINS: '*',
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
  OAUTH2_RESPONSE_TYPE: process.env.OAUTH2_RESPONSE_TYPE!,
  OAUTH2_SCOPES: process.env.OAUTH2_SCOPES!,
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
  ADMIN_BYPASS_USERS: process.env.ADMIN_BYPASS_USERS!,
  MEZON_APPLICATION_TOKEN: process.env.MEZON_APPLICATION_TOKEN!,
  MEZON_APPLICATION_ID: process.env.MEZON_APPLICATION_ID!,
  MEZON_TOKEN_RECEIVER_APP_ID: process.env.MEZON_TOKEN_RECEIVER_APP_ID!,
  MEZON_TOKEN_RECEIVER_APP_TOKEN: process.env.MEZON_TOKEN_RECEIVER_APP_TOKEN!,
  MEZON_AUTH_EXPIRES_TIME_OFFSET_IN_SECONDS:
    process.env.MEZON_AUTH_EXPIRES_TIME_OFFSET_IN_SECONDS ?? 10,
  GOOGLE_GEN_AI_API_KEY: process.env.GOOGLE_GEN_AI_API_KEY!,
  QUIZ_QUESTION_FETCH_INTERVAL_SECONDS: +(
    process.env.QUIZ_QUESTION_FETCH_INTERVAL_SECONDS ?? 10000
  ),
  QUIZ_PROMPT_CONTENT: process.env.QUIZ_PROMPT_CONTENT!,
  QUIZ_PROMPT_RESPONSE_FORMAT: process.env.QUIZ_PROMPT_RESPONSE_FORMAT!,
  REWARD_ITEM_PERCENT: Number(process.env.REWARD_ITEM_PERCENT ?? 40),
  REWARD_COIN_PERCENT: Number(process.env.REWARD_ITEM_PERCENT ?? 40),
  REWARD_HIGH_COIN_PERCENT: Number(process.env.REWARD_HIGH_COIN_PERCENT ?? 70),
  REWARD_FOOD_NORMAL_PERCENT: parseFloat(process.env.REWARD_FOOD_NORMAL_PERCENT || '50'),
  REWARD_FOOD_PREMIUM_PERCENT: parseFloat(process.env.REWARD_FOOD_PREMIUM_PERCENT || '25'),
  REWARD_FOOD_ULTRA_PREMIUM_PERCENT: parseFloat(process.env.REWARD_FOOD_ULTRA_PREMIUM_PERCENT || '10'),
  MEZON_CHANNEL_WEBHOOK_URL: process.env.MEZON_CHANNEL_WEBHOOK_URL,
  CATCH_CHANCE_BASE: Number(process.env.CATCH_CHANCE_BASE ?? 4 / 15),
  PET_UNLOCK_SKILL_SLOT_LEVEL_3: Number(process.env.PET_UNLOCK_SKILL_SLOT_LEVEL_3 ?? 40),
  PET_UNLOCK_SKILL_SLOT_LEVEL_4: Number(process.env.PET_UNLOCK_SKILL_SLOT_LEVEL_4 ?? 70),
});
