import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClanActivityService } from './clan-activity.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { ClansQueryDto } from '@modules/clan/dto/clan.dto';

@ApiBearerAuth()
@ApiTags('ClanActivity')
@Controller('clan-activitys')
export class ClanActivityController {
  constructor(
    private readonly clanActivityService: ClanActivityService,
    private readonly clsService: ClsService,
  ) {}

  @Get(':clanId')
  async getFeed(
    @Param('clanId') clanId: string,
    @Query() query: ClansQueryDto,
  ) {
    return this.clanActivityService.getClanActivity(clanId, query);
  }
}
