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
  @IsString()
  @IsNotEmpty()
  userid: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
