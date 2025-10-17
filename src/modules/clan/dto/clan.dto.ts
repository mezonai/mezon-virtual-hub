import { UserPublicDto } from '@modules/user/dto/user.dto';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ClanEntity } from '../entity/clan.entity';

export class CreateMapDto {
  readonly name: string;
  readonly map_key?: string;
  readonly width: number;
  readonly height: number;
}

export class UpdateClanDto {
  @ApiProperty({
    description: 'The name of the clan',
    type: String,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name: string | null;
}

export class ClanListDto extends ClanEntity {
  @Type(() => Number)
  member_count: number;
}

export class ClanInfoResponseDto extends OmitType(ClanEntity, []) {
  @ApiProperty({ type: () => UserPublicDto })
  @Type(() => UserPublicDto)
  leader: UserPublicDto | null;

  @ApiProperty({ type: () => UserPublicDto })
  @Type(() => UserPublicDto)
  vice_leader: UserPublicDto | null;

  @Expose()
  @Type(() => Number)
  member_count: number;
}

export class ClansQueryDto extends OmitType(QueryParamsDto, ['limit']) {
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

export class UpdateClanDescriptionDto {
  @ApiProperty({ description: 'Mô tả mới cho clan' })
  @IsString()
  @MaxLength(10000)
  description: string;
}

export class RemoveMembersDto {
  @IsArray()
  @IsUUID('all', { each: true })
  targetUserIds: string[];
}