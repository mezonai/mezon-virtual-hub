import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { Public, RequireAdmin } from '@libs/decorator';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { ClansQueryDto, UpdateClanDescriptionDto, UpdateClanDto } from './dto/clan.dto';
import { ClanService } from './clan.service';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UsersClanQueryDto } from '@modules/user/dto/user.dto';

@ApiBearerAuth()
@Controller('clans')
@ApiTags('Clan')
export class ClanController {
  constructor(
    private readonly clsService: ClsService,
    private readonly clanService: ClanService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ClanController.name);
  }

  @Get('')
  @Public()
  @ApiOperation({
    summary: 'Get list all clans information',
  })
  async getAllClansWithMemberCount(@Query() query: ClansQueryDto) {
    return await this.clanService.getAllClansWithMemberCount(query);
  }

  @Get(':clan_id')
  @ApiOperation({
    summary: 'Get clan details by id',
  })
  async getClanById(@Param('clan_id', ParseUUIDPipe) id: string) {
    return await this.clanService.getClanById(id);
  }

  @Put(':clan_id')
  @ApiOperation({
    summary: 'Update an existing clan',
  })
  @ApiBody({
    description: 'Fields to update the clan',
    type: UpdateClanDto,
  })
  async updateClan(
    @Param('clan_id', ParseUUIDPipe) id: string,
    @Body() updateClanDto: UpdateClanDto,
  ) {
    return await this.clanService.updateClan(id, updateClanDto);
  }

  @Delete(':clan_id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Delete a clan',
  })
  async deleteClan(@Param('clan_id', ParseUUIDPipe) id: string) {
    return await this.clanService.deleteClan(id);
  }

  @Get(':clan_id/users')
  @Public()
  @ApiOperation({
    summary: 'Get all users from a clan',
  })
  async getUsersFromClan(
    @Param('clan_id', ParseUUIDPipe) id: string,
    @Query() query: UsersClanQueryDto,
  ) {
    return await this.clanService.getUsersByClanId(id, query);
  }

  @Post(':clan_id/request-join')
  @ApiOperation({ summary: 'Join a clan by id' })
  async joinClan(@Param('clan_id', ParseUUIDPipe) clanId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return await this.clanService.joinClan(user, clanId);
  }

  @Post(':clan_id/cancel-join')
  @ApiOperation({ summary: 'Cancel join a clan by id' })
  async cancelJoinClan(@Param('clan_id', ParseUUIDPipe) clanId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return await this.clanService.cancelJoinClan(user, clanId);
  }

  @Post(':clan_id/leave')
  @ApiOperation({ summary: 'Leave a clan by id' })
  async leaveClan(@Param('clan_id', ParseUUIDPipe) clanId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return await this.clanService.leaveClan(user, clanId);
  }

  @Post(':id/description')
  async updateDescription(
    @Param('id') clanId: string,
    @Body() dto: UpdateClanDescriptionDto,
  ) {
    return this.clanService.updateClanDescription(clanId, dto);
  }
}
