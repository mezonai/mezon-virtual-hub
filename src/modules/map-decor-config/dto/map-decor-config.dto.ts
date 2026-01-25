import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateMapDecorConfigDto {
  @ApiProperty({
    description: 'Clan ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  clan_id: string;

  @ApiProperty({
    description: 'Map ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  map_id: string;

  @ApiProperty({
    description: 'Decor placeholder ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  placeholder_id: string;

  @ApiProperty({
    description: 'Decor item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  decor_item_id: string;
}

export class MapDecorConfigQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by clan id',
  })
  @IsOptional()
  @IsUUID()
  clan_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by map id',
  })
  @IsOptional()
  @IsUUID()
  map_id?: string;
}
