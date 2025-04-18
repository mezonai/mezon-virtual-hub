import { generateExampleDateTz } from '@libs/utils';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import moment from 'moment-timezone';

export class SaveEventGameDto {
  @ApiProperty({
    description: 'Name of the event',
    example: 'Monster Hunt',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'Defeat the monsters and win rewards!',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Start time of the event',
    example: generateExampleDateTz(),
  })
  @IsDateString()
  @Transform(({ value }) => moment(value).utc().toISOString())
  start_time: Date;

  @ApiProperty({
    description: 'End time of the event',
    example: generateExampleDateTz(),
  })
  @IsDateString()
  @Transform(({ value }) => moment(value).utc().toISOString())
  end_time: Date;

  @ApiProperty({
    description: 'Username of the target user (the one being hunted)',
    example: 'an.nguyenvan',
  })
  @IsString()
  target_username: string;

  @ApiProperty({
    description: 'Maximum number of users allowed to complete the event',
    example: 10,
  })
  @IsNumberString()
  max_completed_users: number;

  @ApiProperty({
    description: 'Status whether the event is completed',
    example: false,
    default: false,
  })
  @IsBoolean()
  is_completed?: boolean;

  @ApiProperty({
    description: 'List of user IDs to be added to completed users',
    example: ['a1b2c3d4-e5f6-7890-1234-56789abcdef0'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  completed_user_ids?: string[];
}

export class CreateGameEventDto extends OmitType(SaveEventGameDto, [
  'is_completed',
]) {}

export class UserEventResDto {
  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;

  @Exclude()
  mezon_id: string;

  @Exclude()
  position_x: number;

  @Exclude()
  position_y: number;

  @Exclude()
  skin_set: string[];

  @Exclude()
  auth_provider: string;

  @Exclude()
  gold: number;
}

export class GameEventResDto {
  @Expose()
  @Type(() => UserEventResDto)
  target_user: UserEventResDto;

  @Expose()
  @Type(() => UserEventResDto)
  completed_users: UserEventResDto[];

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  external_id: string | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;
}
