import { configEnv } from '@config/env.config';
import crypto from 'crypto';

export const generateMezonHash = (data: object) => {
  const secretKey = crypto
    .createHmac('sha256', configEnv().MEZON_APPLICATION_SECRET)
    .update('WebAppData')
    .digest('hex');

  const dataKeys = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort();

  const dataCheckString = dataKeys
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  return crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
};
