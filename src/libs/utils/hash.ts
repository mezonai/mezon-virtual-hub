import { configEnv } from '@config/env.config';
import * as crypto from 'crypto';

export const Hasher = {
  HMAC_SHA256: (key: string | Buffer, data: string | Buffer) => {
    return crypto.createHmac('sha256', key).update(data).digest();
  },
  HEX: (data: Buffer) => {
    return data.toString('hex');
  },
};

export function generateMezonHash(dataCheckString: string): string {
  var md5 = require('md5');
  const hashBotToken = md5(configEnv().MEZON_APPLICATION_TOKEN);
  const secretKey = Hasher.HMAC_SHA256(
    hashBotToken,
    'WebAppData',
  );
  // console.log(`dataCheckString: ${dataCheckString}`);
  // console.log(`configEnv().MEZON_APPLICATION_TOKEN: ${configEnv().MEZON_APPLICATION_TOKEN}`);
  const hashParamsString = dataCheckString.split('&hash=')[0];
  const hashData = Hasher.HEX(Hasher.HMAC_SHA256(
    secretKey,
    hashParamsString,
  ));

  console.log(`hashData: ${hashData}`);
  return hashData;
}
