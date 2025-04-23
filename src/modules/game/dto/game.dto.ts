import { ItemDto } from '@modules/item/dto/item.dto';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AwardResponseDto {
  @ApiProperty({
    enum: ['gold', 'item', 'none'],
    description: 'Type of reward',
  })
  type: 'gold' | 'item' | 'none';

  @ApiPropertyOptional({
    description: 'Amount of gold awarded (if applicable)',
    example: 10,
  })
  amount?: number;

  @ApiPropertyOptional({
    type: () => ItemDto,
    description: 'Item awarded (if applicable)',
  })
  item?: ItemDto;

  @ApiPropertyOptional({
    description: 'Quantity of item (if applicable)',
    example: 2,
  })
  quantity?: number;
}
