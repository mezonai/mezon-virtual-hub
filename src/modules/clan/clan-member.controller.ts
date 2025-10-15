import { USER_TOKEN } from '@constant';
import { RequireClanRoles } from '@libs/decorator';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Controller, Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { ClanMemberService } from './clan-member.service';

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
    @Param('target_user_id') userId: string,
  ) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return this.clanMemberService.transferLeadership(
      clanId,
      userId,
      user,
    );
  }

  @Patch(':target_user_id/assign-vice-leader')
  @RequireClanRoles('LEADER')
  @ApiOperation({ summary: 'Assign vice leader role to a clan member' })
  async assignViceLeader(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Param('target_user_id') userId: string,
  ) {
    return this.clanMemberService.assignViceLeader(clanId, userId);
  }

  @Patch(':target_user_id/remove-vice-leader')
  @RequireClanRoles('LEADER')
  @ApiOperation({ summary: 'Remove vice leader role (demote to member)' })
  async removeViceLeader(
    @Param('clan_id', ParseUUIDPipe) clanId: string,

    @Param('target_user_id') userId: string,
  ) {
    return this.clanMemberService.removeViceLeader(clanId, userId);
  }

  @Delete(':target_user_id')
  @RequireClanRoles('LEADER', 'VICE_LEADER')
  @ApiOperation({ summary: 'Remove a member from clan' })
  async removeMember(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Param('target_user_id', ParseUUIDPipe) userId: string,
  ) {
    return this.clanMemberService.removeMember(clanId, userId);
  }
}
