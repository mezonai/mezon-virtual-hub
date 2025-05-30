import { JwtPayload } from '@modules/auth/dtos/response';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class Result<T = unknown> {
  public statusCode?: HttpStatus = HttpStatus.OK;
  public message?: string = 'Successfully';
  public data?: T | T[] = undefined;
  public pageSize?: number = undefined;
  public pageNumber?: number = undefined;
  public totalPages?: number = undefined;
  public totalCount?: number = undefined;
  public hasPreviousPage?: boolean = undefined;
  public hasNextPage?: boolean = undefined;

  constructor(init?: Partial<Result<T>>) {
    Object.assign(this, init);
  }
}
export class IJwtRequestUser {
  @ValidateNested({ each: true })
  @Type(() => JwtPayload)
  user: JwtPayload;
}
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

export class LoginMezonHashRequest {
  @ApiProperty({
    description: 'Web app data takes from mezon app',
    example: 'query_id=UO25KGASFAEFARUE&user=%7B%22...',
  })
  @IsNotEmpty()
  @IsString()
  web_app_data: string;
}

export type WebAppData = {
  query_id: string;
  user: string;
  auth_date: number;
  signature: string;
  hash: string;
};

export type UserMezonData = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  mezon_id: string;
};
