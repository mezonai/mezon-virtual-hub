// dto/quest-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RewardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['daily', 'weekly'] })
  frequency: 'daily' | 'weekly';

  @ApiProperty()
  progress: number;

  @ApiProperty()
  required_count: number;

  @ApiProperty()
  is_completed: boolean;

  @ApiProperty()
  is_claimed: boolean;
}

export class RewardsResponseDto {
  @ApiProperty({ type: [RewardDto] })
  daily: RewardDto[];

  @ApiProperty({ type: [RewardDto] })
  weekly: RewardDto[];
}
