// dto/quest-response.dto.ts
import { QuestFrequency, QuestType, SortOrder } from '@enum';
import { RewardItemEntity } from '@modules/reward-item/entity/reward-item.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import moment from 'moment';

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

export class FinishQuestQueryDto {
  @ApiPropertyOptional({
    description: 'Timezone in IANA format (e.g. Asia/Ho_Chi_Minh, UTC)',
    example: 'Asia/Ho_Chi_Minh',
  })
  @IsOptional()
  @IsString()
  @Validate((value: string) => moment.tz.zone(value) !== null, {
    message: 'Invalid timezone',
  })
  timezone?: string = 'Asia/Ho_Chi_Minh';
}

export class NewbieRewardDto {
  id: string;
  end_at: Date | null;
  quest_id: string;
  name: string;
  description?: string | null;
  quest_type: QuestType;
  is_claimed: boolean;
  is_available: boolean;
  rewards: RewardItemEntity[];
}

export class PlayerQuestFrequencyDto {
  id: string;
  name: string;
  start_at?: Date | null;
  end_at?: Date | null;
  description: string | undefined;
  frequency: string;
  progress: number;
  total_progress: number;
  is_completed: boolean;
  is_claimed: boolean;
  rewards: RewardItemEntity[];
}
