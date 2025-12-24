import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserClanStatDto {
  @ApiProperty({ description: 'User ID', format: 'uuid' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'Clan ID', format: 'uuid' })
  @IsUUID()
  clan_id: string;
}

export class UpdateUserClanStatDto {
  @ApiProperty({ description: 'Total score', example: 100, required: false })
  @IsOptional()
  @IsInt()
  total_score?: number;

  @ApiProperty({ description: 'Weekly score', example: 50, required: false })
  @IsOptional()
  @IsInt()
  weekly_score?: number;
}

export class AddScoreDto {
  @ApiProperty({ description: 'User ID', format: 'uuid' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Clan ID', format: 'uuid' })
  @IsString()
  clanId: string;

  @ApiProperty({ description: 'Points to add', example: 10 })
  @IsInt()
  points: number;

  @ApiProperty({ description: 'Is limited score addition', example: false })
  @IsBoolean()
  isLimited: boolean;
}
