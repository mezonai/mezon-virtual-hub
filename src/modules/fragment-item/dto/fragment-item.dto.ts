import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateFragmentItemDto {
  @ApiProperty({
    description: 'ID of the fragment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  fragment_id: string;

  @ApiProperty({
    description: 'ID of the item',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  item_id: string;

  @ApiProperty({
    description: 'Part number of the fragment item',
    example: 1,
  })
  @IsInt()
  @Min(1)
  part: number;

  @ApiProperty({
    description: 'Required quantity of the fragment item',
    example: 1,
  })
  @IsInt()
  @Min(1)
  required_quantity: number;
}

export class UpdateFragmentItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  part?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  required_quantity?: number;
}