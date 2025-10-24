import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateUserClanScoreDto {
  @ApiProperty({ description: 'User ID', format: 'uuid' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'Clan ID', format: 'uuid' })
  @IsUUID()
  clan_id: string;
}

export class UpdateUserClanScoreDto {
  @ApiProperty({ description: 'Total score', example: 100, required: false })
  @IsOptional()
  @IsInt()
  total_score?: number;

  @ApiProperty({ description: 'Weekly score', example: 50, required: false })
  @IsOptional()
  @IsInt()
  weekly_score?: number;
}
