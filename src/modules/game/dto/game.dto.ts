import { RewardSlotType } from '@enum';
import { FoodDto } from '@modules/food/dto/food.dto';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { ItemDto } from '@modules/item/dto/item.dto';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { PetPlayersEntity } from '@modules/pet-players/entity/pet-players.entity';
import { PetDto } from '@modules/pets/dto/pets.dto';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
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
    type: () => PetDto,
    description: 'Food awarded (if applicable)',
  })
  pet?: PetDto;

  @ApiPropertyOptional({
    description: 'Quantity of item (if applicable)',
    example: 2,
  })
  quantity?: number;
}

export type RewardDataType = (ItemEntity | FoodEntity | 'coin' | null | PetsEntity)[]
