import { InventoryClanType } from '@enum';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, IsUUID, IsOptional, IsEnum, Max, IsArray } from 'class-validator';

export class BuyPlantDto {
  @ApiProperty({
    example: '0b071122-8ac2-4886-a8bd-64e1694f3ba7',
    description: 'Clan ID',
  })
  @IsUUID()
  clanId: string;

  @ApiProperty({
    example: '1c23a3d4-abc1-4d7a-b123-1a2b3c4d5e6f',
    description: 'Item Farm ID (UUID)',
  })
  @IsUUID()
  itemId: string;

  @ApiProperty({ example: 5, description: 'Quantity to buy', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(100000, { message: 'Quantity must not exceed 100000' })
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    name: 'type',
    enum: InventoryClanType,
    required: false,
    description: 'Type of inventory to buy',
    default: InventoryClanType.PLANT,
  })
  @IsOptional()
  @IsEnum(InventoryClanType)
  type: InventoryClanType = InventoryClanType.PLANT;
}

export class HarvestPlantStatusDto {
  @ApiProperty()
  @IsUUID()
  farmSlotId: string;

  @ApiProperty({ type: SlotsPlantEntity, nullable: true })
  @IsOptional()
  currentPlant: SlotsPlantEntity | null;

  @ApiProperty({ required: false })
  @IsOptional()
  harvestedQuantity?: number;
}

export class SeedClanWarehouseDto {
  @ApiProperty({
    description: 'ID của clan cần seed kho',
    example: '6f185442-7fe2-4dcf-b3ba-59e873225ec0',
  })
  @IsUUID()
  clanId: string;

  @ApiPropertyOptional({
    description: 'Số lượng mặc định cho mỗi item, nếu không truyền sẽ lấy 5',
    example: 5,
  })
  @IsInt()
  @IsOptional()
  defaultQuantity?: number = 5;

  @ApiPropertyOptional({
    description: 'Danh sách item IDs muốn seed, nếu bỏ trống sẽ seed tất cả plants',
    example: [
      '1a2b3c4d-1234-5678-9abc-def123456789',
      '2b3c4d5e-2345-6789-abcd-ef2345678901',
    ],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true }) // kiểm tra từng phần tử là UUID version 4
  itemIds?: string[];
}
