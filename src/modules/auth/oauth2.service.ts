import { Injectable } from '@nestjs/common';
import config from '@config/env.config';
import { OAuth2Request } from './dtos/request';

@Injectable()
export class OAuth2Service {
  private CLIENT_ID = config().OAUTH2_CLIENT_ID;
  private CLIENT_SECRET = config().OAUTH2_CLIENT_SECRET;
  private OAUTH2_URL = config().OAUTH2_API_URL;
  private REDIRECT_URI = config().OAUTH2_REDIRECT_URI;
  private async callOAuth2Api(
    path: string,
    body: Record<string, any>,
    method: 'POST' | 'GET',
  ) {
    try {
      const response = await fetch(this.OAUTH2_URL + path, {
        method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...body,
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          redirect_uri: this.REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        throw new Error(
          `OAuth2 API Error: ${response.status} - ${response.statusText}.`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling OAuth2 API:', error);
      throw error;
    }
  }

  async getOAuth2Token(payload: OAuth2Request) {
    const body = {
      grant_type: 'authorization_code',
      ...payload,
    };
    return await this.callOAuth2Api(
      config().OAUTH2_URL_TOKEN_PATH,
      body,
      'POST',
    );
  }

  async decodeORYTokenOAuth2(accessToken: string) {
    const body = { access_token: accessToken };
    return await this.callOAuth2Api(
      config().OAUTH2_URL_DECODE_PATH,
      body,
      'POST',
    );
  }
}
