import { Controller, Get, Param, Query} from '@nestjs/common';
import { ClanActivityService } from './clan-activity.service';
import { ClansQueryDto } from './dto/clan.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('Clan Activitys')
export class ClanActivityController {
  constructor(private readonly clanActivityService: ClanActivityService) {}

  @Get(':clanId')
  async getFeed(
    @Param('clanId') clanId: string, @Query() query: ClansQueryDto
  ) {
    return this.clanActivityService.getClanActivity(clanId, query);
  }
}
