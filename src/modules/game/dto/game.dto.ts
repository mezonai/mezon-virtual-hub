import { RewardSlotType } from '@enum';
import { FoodDto } from '@modules/food/dto/food.dto';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { ItemDto } from '@modules/item/dto/item.dto';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AwardResponseDto {
  @ApiProperty({
    enum: RewardSlotType,
    description: 'Type of reward',
  })
  type: RewardSlotType;

  @ApiPropertyOptional({
    type: () => ItemDto,
    description: 'Item awarded (if applicable)',
  })
  item?: ItemDto;

  @ApiPropertyOptional({
    type: () => FoodDto,
    description: 'Food awarded (if applicable)',
  })
  food?: FoodDto;

  @ApiPropertyOptional({
    description: 'Quantity of item (if applicable)',
    example: 2,
  })
  quantity?: number;
}

export type RewardDataType = (ItemEntity | FoodEntity | 'coin' | null)[]
