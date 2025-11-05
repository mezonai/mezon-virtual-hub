import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class PlantStageResponseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stage_name: string;

  @ApiProperty({
    description:
      'Stage start ratio (0→1). Examples: SEED=0, SMALL=0.3, GROWN=0.8, HARVESTABLE=1',
    example: 0,
  })
  @IsNumber()
  ratio_start: number;

  @ApiProperty({
    description:
      'Stage end ratio (0→1). null means >=100%. Examples: SEED=0.3, SMALL=0.8, GROWN=1, HARVESTABLE=1',
    required: false,
    example: 0.3,
  })
  @IsNumber()
  @IsOptional()
  ratio_end: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string | null;
}

export class PlantStageDto {
  @ApiProperty()
  plant_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stage_name: string;

  @ApiProperty({
    description:
      'Stage start ratio (0→1). Examples: SEED=0, SMALL=0.3, GROWN=0.8, HARVESTABLE=1',
    example: 0,
  })
  @IsNumber()
  ratio_start: number;

  @ApiProperty({
    description:
      'Stage end ratio (0→1). null means >=100%. Examples: SEED=0.3, SMALL=0.8, GROWN=1, HARVESTABLE=1',
    required: false,
    example: 0.3,
  })
  @IsNumber()
  @IsOptional()
  ratio_end: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string | null;
}

export class UpdatePlantStageDto extends PartialType(PlantStageResponseDto) {}
