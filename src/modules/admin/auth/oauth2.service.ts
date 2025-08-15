import { replaceSeparator } from '@libs/utils';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { OAuth2Request, MezonOAuth2UserInfo } from './dtos/request';
import { configEnv } from '@config/env.config';

@Injectable()
export class OAuth2Service implements OnModuleInit {
  private axiosInstance: AxiosInstance;
  private defaultBody: Record<string, string>;
  private oauth2RedirectUrls = configEnv().OAUTH2_REDIRECT_URI.split(',');

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    const oauth2Url = configEnv().OAUTH2_API_URL;
    const client_id = configEnv().OAUTH2_CLIENT_ID;
    const client_secret = configEnv().OAUTH2_CLIENT_SECRET;

    this.axiosInstance = axios.create({
      baseURL: oauth2Url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 5000,
    });

    this.defaultBody = {
      client_id,
      client_secret,
      redirect_uri: this.oauth2RedirectUrls[0],
    };
  }

  private async request(
    method: 'POST' | 'GET',
    path: string,
    data?: Record<string, any>,
  ): Promise<any> {
    const payload = new URLSearchParams({
      ...this.defaultBody,
      ...data,
    }).toString();

    try {
      const response = await this.axiosInstance.request({
        method,
        url: path,
        data: method === 'POST' ? payload : undefined,
        params: method === 'GET' ? data : undefined,
      });

      return response.data;
    } catch (error) {
      const { response } = error;
      const message =
        response?.data?.error_description ||
        response?.data?.error ||
        'Unknown error';
      throw new HttpException(
        `OAuth2 API Error: ${response?.status} - ${message}`,
        response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async post(path: string, data: Record<string, any> = {}) {
    return await this.request('POST', path, data);
  }

  async get(path: string, params: Record<string, any> = {}) {
    return await this.request('GET', path, params);
  }

  async getOAuth2Token(payload: OAuth2Request) {
    if (
      payload.redirect_uri &&
      !this.oauth2RedirectUrls.includes(payload.redirect_uri)
    ) {
      throw new BadRequestException(`Invalid Redirect URI`);
    }

    return await this.post('/oauth2/token', {
      grant_type: 'authorization_code',
      ...payload,
    });
  }

  async decodeORYTokenOAuth2(
    accessToken: string,
  ): Promise<MezonOAuth2UserInfo> {
    return await this.post('/userinfo', { access_token: accessToken });
  }
}
