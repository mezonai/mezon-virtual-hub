import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClanRequestService } from './clan-request.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { USER_TOKEN } from '@constant';
import { UpdateClanDto } from '@modules/clan/dto/clan.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { PendingRequestQueryDto } from './dto/clan-request.dto';
import { RequireClanRoles } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('ClanRequestController')
@Controller('clans/:clan_id/clan-requests')
@ApiParam({
  name: 'clan_id',
  example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
})
export class ClanRequestController {
  constructor(
    private readonly clanRequestService: ClanRequestService,
    private readonly clsService: ClsService,
  ) {}

  @Get('pending')
  @RequireClanRoles('LEADER', 'VICE_LEADER')
  @ApiOperation({ summary: 'Get requests join to clan' })
  async getPendingRequest(
    @Query() query: PendingRequestQueryDto,
    @Param('clan_id', ParseUUIDPipe) clanId: string,
  ) {
    return await this.clanRequestService.getPendingRequests(clanId, query);
  }

  @Patch(':clan_request_id/approve')
  @RequireClanRoles('LEADER', 'VICE_LEADER')
  @ApiParam({
    name: 'clan_request_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({ summary: 'Approve a request' })
  async approveRequest(
    @Param('clan_request_id', ParseUUIDPipe) requestId: string,
    @Query('is_approved', new DefaultValuePipe(true), ParseBoolPipe)
    isApproved: boolean,
  ) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return this.clanRequestService.approveRequest(
      user.id,
      requestId,
      isApproved,
    );
  }
}
