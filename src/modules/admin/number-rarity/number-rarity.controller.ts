import {
  Body,
  Controller,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminNumberRarityService } from './number-rarity.service';
import { CreateNumberRarityDto, UpdateNumberRarityDto } from '@modules/number-rarity/dto/number-rarity.dto';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@RequireAdmin()
@Controller('number-rarity')
@ApiTags('Admin - Number Rarity')
export class AdminNumberRarityController {
  constructor(
    private readonly service: AdminNumberRarityService,
  ) {}

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create number rarity config' })
  create(
    @Body() dto: CreateNumberRarityDto,
  ): Promise<NumberRarityEntity> {
    return this.service.createNumberRarity(dto);
  }

  @Put(':roomCode')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update number rarity by room code' })
  update(
    @Param('roomCode') roomCode: string,
    @Body() dto: UpdateNumberRarityDto,
  ): Promise<NumberRarityEntity> {
    return this.service.updateNumberRarity(roomCode, dto);
  }
}
