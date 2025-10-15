import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { Public, RequireAdmin, RequireClanRoles } from '@libs/decorator';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
  ClansQueryDto,
  UpdateClanDescriptionDto,
  UpdateClanDto,
} from './dto/clan.dto';
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
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ClanController.name);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get list all clans information',
  })
  async getAllClansWithMemberCount(@Query() query: ClansQueryDto) {
    return await this.clanService.getAllClansWithMemberCount(query);
  }

  @Get('clan-requests')
  @ApiOperation({
    summary: 'Get all clans with member count and user join/request status',
  })
  async getAllClansWithMemberRequest(@Query() query: ClansQueryDto) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return await this.clanService.getAllClansWithMemberRequest(user, query);
  }

  @Get(':clan_id')
  @ApiOperation({
    summary: 'Get clan details by id',
  })
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async getClanById(@Param('clan_id', ParseUUIDPipe) id: string) {
    return await this.clanService.getClanById(id);
  }

  @Put(':clan_id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Update an existing clan',
  })
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
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
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Delete a clan',
  })
  async deleteClan(@Param('clan_id', ParseUUIDPipe) id: string) {
    return await this.clanService.deleteClan(id);
  }

  @Get(':clan_id/users')
  @ApiOperation({
    summary: 'Get all users from a clan',
  })
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async getUsersFromClan(
    @Param('clan_id', ParseUUIDPipe) id: string,
    @Query() query: UsersClanQueryDto,
  ) {
    return await this.clanService.getUsersByClanId(id, query);
  }

  @Post(':clan_id/request-join')
  @ApiOperation({ summary: 'Join a clan by id' })
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async joinClan(@Param('clan_id', ParseUUIDPipe) clanId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return await this.clanService.joinClan(user, clanId);
  }

  @Post(':clan_id/cancel-join')
  @ApiOperation({ summary: 'Cancel join a clan by id' })
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async cancelJoinClan(@Param('clan_id', ParseUUIDPipe) clanId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return await this.clanService.cancelJoinClan(user, clanId);
  }

  @Post(':clan_id/leave')
  @RequireClanRoles('MEMBER', 'LEADER', 'VICE_LEADER')
  @ApiOperation({ summary: 'Leave a clan by id' })
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async leaveClan(@Param('clan_id', ParseUUIDPipe) clanId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return await this.clanService.leaveClan(user);
  }

  @Post(':clan_id/description')
  @ApiParam({
    name: 'clan_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @RequireClanRoles('LEADER', 'VICE_LEADER')
  async updateDescription(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Body() dto: UpdateClanDescriptionDto,
  ) {
    return this.clanService.updateClanDescription(clanId, dto);
  }
}
