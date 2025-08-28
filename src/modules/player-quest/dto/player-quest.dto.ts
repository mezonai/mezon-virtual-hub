// dto/quest-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class QuestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['daily', 'weekly'] })
  frequency: 'daily' | 'weekly';

  @ApiProperty()
  progress: number;

  @ApiProperty()
  total_progress: number;

  @ApiProperty()
  is_completed: boolean;

  @ApiProperty()
  is_claimed: boolean;
}

export class PlayerQuestsResponseDto {
  @ApiProperty({ type: [QuestDto] })
  daily: QuestDto[];

  @ApiProperty({ type: [QuestDto] })
  weekly: QuestDto[];
}
