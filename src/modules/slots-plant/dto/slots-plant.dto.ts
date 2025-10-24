import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class SlotHistoryDto {
  @ApiProperty({ description: 'ID of the plant record on the slot' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'ID of the planted crop' })
  @IsUUID()
  plant_id: string;

  @ApiProperty({ description: 'Name of the plant' })
  @IsString()
  plant_name: string;

  @ApiProperty({ description: 'ID of the user who planted' })
  @IsUUID()
  planted_by: string;

  @ApiProperty({ description: 'Username of the user who planted' })
  @IsString()
  planted_by_name: string;

  @ApiProperty({ description: 'Timestamp when the plant was planted' })
  @IsDate()
  planted_at: Date;

  @ApiProperty({ description: 'Number of times harvested so far' })
  @IsNumber()
  harvest_count: number;

  @ApiProperty({ description: 'Maximum number of possible harvests' })
  @IsNumber()
  harvest_count_max: number;

  @ApiProperty({ description: 'Timestamp of the last harvest', required: false })
  @IsOptional()
  @IsDate()
  harvest_at?: Date| null;

  @ApiProperty({ description: 'ID of the last user who watered the plant', required: false })
  @IsOptional()
  @IsUUID()
  last_watered_by?: string;

  @ApiProperty({ description: 'ID of the last user who caught bugs', required: false })
  @IsOptional()
  @IsUUID()
  last_bug_caught_by?: string;

  @ApiProperty({ description: 'ID of the last user who harvested', required: false })
  @IsOptional()
  @IsUUID()
  last_harvested_by?: string;
}

export class SlotHarvesterDto {
  @ApiProperty({ description: 'ID of the user' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'Username of the user' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'ID of the user\'s clan' })
  @IsUUID()
  clan_id: string;

  @ApiProperty({ description: 'Points awarded for this harvest' })
  @IsNumber()
  points_added: number;

  @ApiProperty({ description: 'Timestamp of the harvest' })
  @IsDate()
  harvested_at: Date| null;
}

export class SlotActionDto {
  @ApiProperty({ description: 'ID of the plant' })
  @IsUUID()
  plant_id: string;

  @ApiProperty({ description: 'Name of the plant' })
  @IsString()
  plant_name: string | null;

  @ApiProperty({ description: 'ID of the user who planted' })
  @IsUUID()
  planted_by: string;

  @ApiProperty({ description: 'Timestamp when the plant was planted' })
  @IsDate()
  planted_at: Date;

  @ApiProperty({ description: 'ID of the last user who watered the plant', required: false })
  @IsOptional()
  @IsUUID()
  last_watered_by?: string;

  @ApiProperty({ description: 'Timestamp of the last watering', required: false })
  @IsOptional()
  @IsDate()
  last_watered_at?: Date| null;

  @ApiProperty({ description: 'ID of the last user who caught bugs', required: false })
  @IsOptional()
  @IsUUID()
  last_bug_caught_by?: string;

  @ApiProperty({ description: 'Timestamp of the last bug catch', required: false })
  @IsOptional()
  @IsDate()
  last_bug_caught_at?: Date| null;

  @ApiProperty({ description: 'ID of the last user who harvested', required: false })
  @IsOptional()
  @IsUUID()
  last_harvested_by?: string;

  @ApiProperty({ description: 'Timestamp of the last harvest', required: false })
  @IsOptional()
  @IsDate()
  harvest_at?: Date| null;
}

export class SlotScoreDto {
  @ApiProperty({ description: 'ID of the slot' })
  @IsUUID()
  slot_id: string;

  @ApiProperty({ description: 'Total points of the slot' })
  @IsNumber()
  total_points: number;

  @ApiProperty({ description: 'Points breakdown by user' })
  by_user: { user_id: string; points: number }[];
}

export class FarmScoreDto {
  @ApiProperty({ description: 'ID of the clan' })
  @IsUUID()
  clan_id: string;

  @ApiProperty({ description: 'Total points of the clan on the farm' })
  @IsNumber()
  total_points: number;
}
