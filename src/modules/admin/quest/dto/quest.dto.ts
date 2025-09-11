// dto/quest-response.dto.ts
import { RewardType } from '@enum';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class QuestManagementDto {
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

export class QuestManagementsResponseDto {
  @ApiProperty({ type: [QuestManagementDto] })
  daily: QuestManagementDto[];

  @ApiProperty({ type: [QuestManagementDto] })
  weekly: QuestManagementDto[];
}

export class CreateQuestManagementDto extends OmitType(QuestEntity, [
  'id',
  'reward',
  'player_quests',
]) {
  @ApiProperty({
    description: 'Reward of the quest',
    enum: RewardType,
  })
  @IsEnum(RewardType)
  reward_type: RewardType;
}
