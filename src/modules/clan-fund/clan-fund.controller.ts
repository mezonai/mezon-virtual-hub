import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ClanFundService } from './clan-fund.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  ContributeClanFundDto,
  ContributorClanFundQueryDto,
} from './dto/clan-fund.dto';
import { USER_TOKEN } from '@constant';

@ApiBearerAuth()
@ApiTags('Clan Fund Controller')
@Controller('clan-funds')
export class ClanFundController {
  constructor(
    private readonly clanFundService: ClanFundService,
    private readonly cls: ClsService,
  ) {}

  @Get(':clan_id')
  @ApiOperation({ summary: 'Get fund info of a specific clan' })
  async getFundInfo(@Param('clan_id') clanId: string) {
    return this.clanFundService.getClanFundInfo(clanId);
  }

  @Post(':clan_id/contribute')
  @ApiOperation({ summary: 'Member contributes to clan fund' })
  async contribute(
    @Param('clan_id') clanId: string,
    @Body() dto: ContributeClanFundDto,
  ) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.clanFundService.contribute(clanId, user, dto);
  }

  @Get(':clan_id/contributors')
  @ApiOperation({ summary: 'Get all members who contributed to the clan fund' })
  async getClanContributors(
    @Param('clan_id') clanId: string,
    @Query() query: ContributorClanFundQueryDto,
  ) {
    return this.clanFundService.getClanContributors(clanId, query);
  }
}
