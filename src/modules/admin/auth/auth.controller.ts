import { BadRequestException, Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { configEnv } from '@config/env.config';
import { ApiResponseWithAuthToken, Public } from '@libs/decorator';
import { Logger } from '@libs/logger';
import { replaceSeparator } from '@libs/utils';
import { Response } from 'express';
import { AdminAuthService } from './auth.service';
import { OAuth2Request, RedirectOauth2QueryDto, RefreshTokenDto } from './dtos/request';
import { UsersManagementQueryDto } from '../users/dto/user-managment.dto';

@ApiTags('Admin - Auth')
@Controller('auth')
export class AdminAuthController {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AdminAuthController.name);
  }

  @Public()
  @Get('redirect-oauth2')
  redirect(@Query() { redirect_url }: RedirectOauth2QueryDto) {
    const oauth2Url = configEnv().OAUTH2_API_URL;
    const client_id = configEnv().OAUTH2_CLIENT_ID;
    const allowedRedirectUris = configEnv().OAUTH2_REDIRECT_URI.split(',');
    const response_type = configEnv().OAUTH2_RESPONSE_TYPE;
    const scope = replaceSeparator(configEnv().OAUTH2_SCOPES);
    const STATE = Math.random().toString(36).substring(2, 15);

    if (redirect_url && !allowedRedirectUris.includes(redirect_url)) {
      throw new BadRequestException(`Invalid redirect_url`);
    }

    const authUrl = new URL('/oauth2/auth', oauth2Url);
    authUrl.search = new URLSearchParams({
      client_id,
      redirect_uri: redirect_url || allowedRedirectUris[0],
      response_type,
      scope,
      state: STATE,
    }).toString();

    return authUrl.toString();
  }

  @Public()
  @Post('verify-oauth2')
  @ApiResponseWithAuthToken()
  @ApiBody({ type: OAuth2Request })
  async verifyOAuth2(@Body() body: OAuth2Request) {
    try {
      return await this.authService.verifyOAuth2(body);
    } catch (error) {
      this.logger.error('An error occured', error);
      throw error;
    }
  }

  @Public()
  @Post('refresh-token')
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      example1: {
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponseWithAuthToken()
  @ApiOperation({
    summary: 'Get new access token and refresh token',
  })
  async refreshAccessToken(@Body() { refreshToken }: RefreshTokenDto) {
    return await this.authService.verifyRefreshToken(refreshToken);
  }
}
