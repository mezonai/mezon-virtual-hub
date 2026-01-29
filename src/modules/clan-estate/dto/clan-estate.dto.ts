import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ClanEstateQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by clan',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  clan_id?: string;
}
