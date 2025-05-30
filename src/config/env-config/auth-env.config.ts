import { registerAs } from '@nestjs/config';
import { AuthEnv } from '@types';

export default registerAs(
  'auth',
  (): AuthEnv => ({
    // google: {
    //   client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
    //   client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    //   redirect_uri: process.env.GOOGLE_AUTH_REDIRECT_URI,
    // },
    // jwt: {
    //   access: {
    //     expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    //     secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    //   },
    //   refresh: {
    //     expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    //     secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    //   },
    //   issuer: process.env.JWT_ISSUER,
    //   audience: process.env.JWT_AUDIENCE,
    // },
    // publicSecretKey: process.env.TOOL_SECURITY_CODE,
    oauth2: {
      client_id: process.env.OAUTH2_CLIENT_ID ?? '',
      client_secret: process.env.OAUTH2_CLIENT_SECRET ?? '',
      redirect_uri: process.env.OAUTH2_REDIRECT_URI ?? '',
      api_url: process.env.OAUTH2_API_URL ?? '',
      scope: process.env.OAUTH2_SCOPE ?? '',
      response_type: process.env.OAUTH2_RESPONSE_TYPE ?? '',
      grant_types: process.env.OAUTH2_GRANT_TYPES ?? '',
    },
  }),
);
