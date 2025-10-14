import { UserPublicDto } from '@modules/user/dto/user.dto';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ClanEntity } from '../entity/clan.entity';

export class CreateMapDto {
  readonly name: string;
  readonly map_key?: string;
  readonly width: number;
  readonly height: number;
}

export class UpdateClanDto {
  @ApiProperty({
    description: 'The name of the map',
    type: String,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({
    description: 'The width of the map',
    type: Number,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  width?: number | null;

  @ApiProperty({
    description: 'The height of the map',
    type: Number,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  height?: number | null;

  @ApiProperty({
    description: 'Lock the map',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;
}

export class ClanListDto extends ClanEntity {
  @Type(() => Number)
  member_count: number;
}

export class ClanInfoResponseDto extends OmitType(ClanEntity, [
  'leader',
  'vice_leader',
]) {
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

export class ClansQueryDto extends OmitType(QueryParamsDto, [
  'search',
  'limit',
]) {
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
