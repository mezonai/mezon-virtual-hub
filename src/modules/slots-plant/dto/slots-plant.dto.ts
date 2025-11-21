import { PlantState } from '@enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class ActivePlantsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user who planted' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by plant name' })
  @IsOptional()
  @IsString()
  plantName?: string;

  @ApiPropertyOptional({ description: 'Filter by plant stage' })
  @IsOptional()
  @IsEnum(PlantState)
  stage?: PlantState;
}
