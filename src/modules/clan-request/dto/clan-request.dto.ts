import { OmitType, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Exclude, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';
import { ClanRequestEntity } from '../entity/clan-request.entity';
import { UserPublicDto } from '@modules/user/dto/user.dto';
import { ClanInfoResponseDto } from '@modules/clan/dto/clan.dto';

export class PendingRequestQueryDto extends OmitType(QueryParamsDto, [
  'sort_by',
  'limit',
]) {
  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'created_at',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 30;
}

export class ClanRequestListDto extends OmitType(ClanRequestEntity, [
  'clan',
  'user',
]) {
  @Exclude()
  processed_at: Date | null;

  @Exclude()
  processed_by: string | null;

  @Type(() => ClanInfoResponseDto)
  clan: ClanInfoResponseDto;

  @Type(() => UserPublicDto)
  user: UserPublicDto;
}

export interface RequestToJoinDto {
  success: boolean;
  canRequestAt?: string;
  request?: ClanRequestEntity;
}
