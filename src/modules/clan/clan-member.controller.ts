import { USER_TOKEN } from '@constant';
import { RequireClanRoles } from '@libs/decorator';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { ClanMemberService } from './clan-member.service';
import { RemoveMembersDto } from './dto/clan.dto';

@ApiBearerAuth()
@Controller('clans/:clan_id/members')
@ApiTags('Clan Member Management')
@ApiParam({
  name: 'clan_id',
  example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
})
export class ClanMemberController {
  constructor(
    private readonly clanMemberService: ClanMemberService,
    private readonly clsService: ClsService,
  ) {}

  @Patch(':target_user_id/transfer-leadership')
  @RequireClanRoles('LEADER')
  @ApiOperation({ summary: 'Transfer clan leadership to another member' })
  async transferLeadership(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Param('target_user_id', ParseUUIDPipe) targetUserId: string,
  ) {
    const leader = this.clsService.get<UserEntity>(USER_TOKEN);
    return this.clanMemberService.transferLeadership(
      clanId,
      targetUserId,
      leader,
    );
  }

  @Patch(':target_user_id/assign-vice-leader')
  @RequireClanRoles('LEADER')
  @ApiOperation({ summary: 'Assign vice leader role to a clan member' })
  async assignViceLeader(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Param('target_user_id', ParseUUIDPipe) targetUserId: string,
  ) {
    return this.clanMemberService.assignViceLeader(clanId, targetUserId);
  }

  @Patch(':target_user_id/remove-vice-leader')
  @RequireClanRoles('LEADER')
  @ApiOperation({ summary: 'Remove vice leader role (demote to member)' })
  async removeViceLeader(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Param('target_user_id', ParseUUIDPipe) targetUserId: string,
  ) {
    return this.clanMemberService.removeViceLeader(clanId, targetUserId);
  }

  @Delete()
  @RequireClanRoles('LEADER', 'VICE_LEADER')
  @ApiOperation({ summary: 'Remove members from clan' })
  @ApiBody({
  type: RemoveMembersDto,
  examples: {
    example1: {
      value: {
        targetUserIds: [
          'd6f9a1b0-5b73-4c4e-90e5-14b7f3e5c8d1',
          'b5e6a3d9-2c4a-4879-bd2e-8f23c9d27c47',
        ],
      },
    },
  },
})
  async removeMembers(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Body() body: RemoveMembersDto,
  ) {
    return this.clanMemberService.removeMembers(clanId, body.targetUserIds);
  }

}
