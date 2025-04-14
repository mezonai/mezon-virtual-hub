import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Expose, Exclude, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

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
    example: '2025-04-13T10:00:00Z',
  })
  @IsDateString()
  start_time: Date;

  @ApiProperty({
    description: 'End time of the event',
    example: '2025-04-13T12:00:00Z',
  })
  @IsDateString()
  end_time: Date;

  @ApiProperty({
    description: 'ID of the target user (the one being hunted)',
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  })
  @IsUUID()
  target_user_id: string;

  @ApiProperty({
    description: 'Maximum number of users allowed to complete the event',
    example: 10,
  })
  @IsNumber()
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
  target_user: UserEventResDto

  @Expose()
  @Type(() => UserEventResDto)
  completed_users: UserEventResDto[];

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;
}
