import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Oauth2Env, OAuth2Request } from '@types';
import { replaceSeparator } from '@libs/utils';

@Injectable()
export class OAuth2Service implements OnModuleInit {
  private axiosInstance: AxiosInstance;
  private defaultBody: Record<string, string>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const { api_url, client_id, redirect_uri, client_secret } =
      this.configService.get<Oauth2Env>('auth.oauth2') as Oauth2Env;

    this.axiosInstance = axios.create({
      baseURL: api_url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 5000,
    });

    this.defaultBody = {
      client_id,
      client_secret,
      redirect_uri,
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
    const { grant_types } = this.configService.get<Oauth2Env>('auth.oauth2') as Oauth2Env;

    return await this.post('/oauth2/token', {
      grant_type: replaceSeparator(grant_types),
      ...payload,
    });
  }

  async decodeORYTokenOAuth2(accessToken: string) {
    return await this.post('/userinfo', { access_token: accessToken });
  }
}
