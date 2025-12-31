import { UserPublicDto } from '@modules/user/dto/user.dto';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ClanEntity } from '../entity/clan.entity';
import { ClanActivityActionType, ClanRole } from '@enum';

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

  @ApiPropertyOptional({
    description: 'Filter by weekly score',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isWeekly?: boolean;

  @ApiPropertyOptional({
    enum: ClanActivityActionType,
    description: 'Filter clan activity by action type',
  })
  @IsOptional()
  @IsEnum(ClanActivityActionType)
  actionType?: ClanActivityActionType;
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

export class ClanActivityDto {
  userName: string; 
  actionType: string; 
  itemName?: string; 
  quantity?: number;
  amount?: number;
  time: string;
  createdAt:Date;
  officeName?: string; 
}

export class SetUserClanRoleDto {
  @ApiProperty({
    description: 'ID of the user to assign to the clan',
    example: '3decccf1-ce4a-4be5-9842-f92024deb09c',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Role to assign for the user in the clan',
    enum: ClanRole,
    example: ClanRole.LEADER,
  })
  @IsEnum(ClanRole)
  role: ClanRole;
}

export class AssignViceLeadersDto {
  @IsUUID('all', { each: true })
  targetUserIds: string[];
}
