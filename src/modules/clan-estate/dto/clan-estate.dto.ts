import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateClanEstateDto {
  @ApiProperty({
    description: 'Clan ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  clan_id: string;

  @ApiProperty({
    description: 'Map (real estate) ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  map_id: string;
}

export class ClanEstateQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by clan',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  clan_id?: string;
}
