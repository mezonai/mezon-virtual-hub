import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { ApiResponseWithAuthToken, Public } from '@libs/decorator';
import { AuthService } from './auth.service';
import { LoginMezonDto, OAuth2Request, RefreshTokenDto } from './dtos/request';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AuthController.name);
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
  @Post('mezon-login')
  @ApiBody({
    type: LoginMezonDto,
    examples: {
      example1: {
        summary: 'Example Mezon Login',
        description: 'Sample data for Mezon login request',
        value: {
          userid: '123456',
          username: 'mezonUser',
          hash: 'abcdef1234567890abcdef1234567890',
          avatar_url: 'https://cdn.example.vn/12346'
        },
      },
    },
  })
  @ApiResponseWithAuthToken()
  @ApiOperation({
    summary: 'Login by Mezon token hash',
  })
  async loginWithMezonHash(@Body() payload: LoginMezonDto) {
    return await this.authService.loginWithMezonHash(payload);
  }

  @Public()
  @Post('refresh-token')
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponseWithAuthToken()
  @ApiOperation({
    summary: 'Get new access token and refresh token',
  })
  async refreshAccessToken(@Body() { refreshToken }: RefreshTokenDto) {
    return await this.authService.verifyRefreshToken(refreshToken);
  }
}
