import { Request } from 'express';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Optional } from '@nestjs/common';

export class OAuth2Request {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scope?: string | string[] | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
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

export type UserInfoWebAppData = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  mezon_id: string;
};
