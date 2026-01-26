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
import {
  CreateClanEstateDto,
  ClanEstateQueryDto,
} from './dto/clan-estate.dto';

@ApiBearerAuth()
@ApiTags('Clan Estate')
@Controller('clan-estate')
export class ClanEstateController {
  constructor(
    private readonly clanEstateService: ClanEstateService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all clan estates',
  })
  getAllClanEstates(
    @Query() query: ClanEstateQueryDto,
  ) {
    return this.clanEstateService.getAllClanEstates(
      query,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get clan estate by id',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  getClanEstateById(@Param('id') id: string) {
    return this.clanEstateService.getClanEstateById(
      id,
    );
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({
    summary: 'Assign map to clan (create clan estate)',
  })
  createClanEstate(@Body() dto: CreateClanEstateDto) {
    return this.clanEstateService.createClanEstate(
      dto,
    );
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Remove clan estate by id',
  })
  deleteClanEstateById(@Param('id') id: string) {
    return this.clanEstateService.deleteClanEstateById(
      id,
    );
  }
}
