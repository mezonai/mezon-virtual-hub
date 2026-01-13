
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFragmentDto {
  @ApiProperty({
    description: 'Pet ID associated with the fragment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  pet_id: string;
}

export class UpdateFragmentDto extends PartialType(CreateFragmentDto) {}
