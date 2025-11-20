import { USER_TOKEN } from '@constant';
import { RequireClanRoles } from '@libs/decorator';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Query
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { ClanRequestService } from './clan-request.service';
import { PendingRequestQueryDto } from './dto/clan-request.dto';

@ApiBearerAuth()
@ApiTags('Clan Request Controller')
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
