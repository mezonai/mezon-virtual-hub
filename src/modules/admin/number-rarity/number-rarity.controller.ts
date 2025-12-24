import {
  Body,
  Controller,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RequireAdmin } from '@libs/decorator';
import { AdminNumberRarityService } from '@modules/admin/number-rarity/number-rarity.service';
import { CreateNumberRarityDto, UpdateNumberRarityDto } from '@modules/admin/number-rarity/dto/number-rarity.dto';

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
  @ApiOperation({
    summary: 'Create number rarity config'
  })
  create(@Body() dto: CreateNumberRarityDto) {
    return this.service.createNumberRarity(dto);
  }

  @Put(':roomCode')
  @RequireAdmin()
  @ApiParam({
    name: 'roomCode',
    example: 'sg',
  })
  @ApiOperation({
    summary: 'Update number rarity by room code'
  })
  update(@Param('roomCode') roomCode: string, @Body() dto: UpdateNumberRarityDto) {
    return this.service.updateNumberRarity(roomCode, dto);
  }
}