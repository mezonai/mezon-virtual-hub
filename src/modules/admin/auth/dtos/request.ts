import { UserEntity } from '@modules/user/entity/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Request } from 'express';

export class OAuth2Request {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scope?: string | string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state: string;

  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false })
  redirect_uri: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RedirectOauth2QueryDto {
  @ApiProperty({
    description: 'Redirect URL',
    example: 'http://localhost:3000/callback',
  })
  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false })
  redirect_url?: string;
}

export class ValidateJwtRequest extends Request {
  user?: UserEntity;
  sessionToken?: string;
}

export class LoginMezonDto {
  @ApiProperty({
    description: 'Web app data takes from mezon app',
    example: 'query_id=UO25KGASFAEFARUE&user=%7B%22',
  })
  @IsNotEmpty()
  @IsString()
  web_app_data: string;
}

export type WebAppData = {
  query_id: string;
  user: string;
  auth_date: string;
  signature: string;
  hash: string;
};


export type MezonOAuth2UserInfo = {
  aud: string[];
  auth_time: number;
  avatar: string;
  display_name: string;
  iat: number;
  iss: string;
  mezon_id: string;
  rat: number;
  sub: string;
  user_id: string;
  username: string;
};
