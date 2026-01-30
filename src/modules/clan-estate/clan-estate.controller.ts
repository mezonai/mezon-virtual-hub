import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequireAdmin } from '@libs/decorator';
import { ClanEstateService } from './clan-estate.service';
import { ClanEstateQueryDto } from './dto/clan-estate.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { ClsService } from 'nestjs-cls';

@ApiBearerAuth()
@ApiTags('Clan Estate')
@Controller('clan-estate')
export class ClanEstateController {
  constructor(
    private readonly clanEstateService: ClanEstateService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all clan estates',
  })
  getAllClanEstates(@Query() query: ClanEstateQueryDto) {
    return this.clanEstateService.getAllClanEstates(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get clan estate by id',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  getClanEstateById(@Param('id') id: string) {
    return this.clanEstateService.getClanEstateById(id);
  }

  @Post('buy-map/:recipe_id')
  @ApiOperation({
    summary: 'Buy map for clan',
  })
  @ApiParam({
    name: 'recipe_id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  buyMapForClan(@Param('recipe_id') recipe_id: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.clanEstateService.buyMapForClan(user, recipe_id);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Remove clan estate by id',
  })
  deleteClanEstateById(@Param('id') id: string) {
    return this.clanEstateService.deleteClanEstateById(id);
  }
}
