import { ApiResponseWithAuthToken, Public } from '@libs/decorator';
import { replaceSeparator } from '@libs/utils';
import { RefreshTokenDto } from '@modules/auth/dtos/request';
import {
  Body,
  Controller,
  Get,
  LoggerService,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Oauth2Env, OAuth2Request } from '@types';
import { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';


@ApiTags('Admin Authenticate')
@Controller('admin/auth')
@ApiBearerAuth()
export class AdminAuthController {
  constructor(
    private readonly authenticationService: AdminAuthService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('redirect')
  redirect(@Req() req: Request, @Res() res: Response) {
    const { api_url, client_id, scope, response_type } =
      this.configService.get<Oauth2Env>('auth.oauth2') as Oauth2Env;
    const STATE = Math.random().toString(36).substring(2, 15);

    const origin = `${req.protocol}://${req.get('host')}`;
    const redirect_uri = `${origin}`;
    const authUrl = new URL('/oauth2/auth', api_url);
    authUrl.search = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type,
      scope: replaceSeparator(scope),
      state: STATE,
    }).toString();

    return res.redirect(authUrl.toString());
  }

  @Public()
  @Post('verify-oauth2')
  @ApiBody({ type: OAuth2Request })
  async verifyOAuth2(@Body() body: OAuth2Request) {
    return await this.authenticationService.verifyOAuth2(body);
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
    return await this.authenticationService.verifyRefreshToken(refreshToken);
  }

  // @Get('logout')
  // logout(@CurrentUser('emailAddress') email: string) {
  //   return this.authenticationService.logout(email);
  // }
}
