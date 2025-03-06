import { configEnv } from '@config/env.config';
import { LoginMezonDto } from '@modules/auth/dtos/request';
import * as crypto from 'crypto';

function hmacSHA256(secret: string, data: string): Buffer {
  return crypto.createHmac('sha256', secret).update(data).digest();
}

export function generateMezonHash({ userid, username }: LoginMezonDto): string {
  const secretKey = hmacSHA256(
    configEnv().MEZON_APPLICATION_TOKEN,
    'WebAppData',
  );
  const dataKeys = [`userid=${userid}`, `username=${username}`];
  dataKeys.sort();
  const dataCheckString = dataKeys.join('\n');
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
}
