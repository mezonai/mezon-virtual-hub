// dto/quest-response.dto.ts
import { QuestFrequency, SortOrder } from '@enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class PlayerQuestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['daily', 'weekly'] })
  frequency: QuestFrequency;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  total_progress: number;

  @ApiProperty()
  is_completed: boolean;

  @ApiProperty()
  is_claimed: boolean;
}

export class UpdatePlayerQuestDto {
  @ApiProperty({ description: 'ID của PlayerQuest' })
  @IsUUID()
  quest_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  progress?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_claimed?: boolean;
}

export class PlayerQuestsResponseDto {
  @ApiProperty({ type: [PlayerQuestDto] })
  daily: PlayerQuestDto[];

  @ApiProperty({ type: [PlayerQuestDto] })
  weekly: PlayerQuestDto[];
}

export class PlayerQuestQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword to match across multiple fields',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'start_at',
    default: 'start_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'start_at';

  @ApiPropertyOptional({
    description: 'Sort order direction',
    example: 'ASC',
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;
}
