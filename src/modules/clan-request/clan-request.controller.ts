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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { USER_TOKEN } from '@constant';
import { UpdateClanDto } from '@modules/clan/dto/clan.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { PendingRequestQueryDto } from './dto/clan-request.dto';

@ApiBearerAuth()
@ApiTags('ClanRequestController')
@Controller('clan-requests')
export class ClanRequestController {
  constructor(
    private readonly clanRequestService: ClanRequestService,
    private readonly clsService: ClsService,
  ) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get requests join to clan' })
  async getPendingRequest(@Query() query: PendingRequestQueryDto) {
    return await this.clanRequestService.getPendingRequests(query);
  }

  @Patch(':clan_request_id/approve')
  @ApiOperation({ summary: 'Approve a request' })
  async approveRequest(
    @Param('clan_request_id') requestId: string,
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
