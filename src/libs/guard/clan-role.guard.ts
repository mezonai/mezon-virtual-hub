import { UserService } from '@/modules/user/user.service';
import { CLAN_ROLES_KEY, USER_TOKEN } from '@constant';
import { ClanRole } from '@enum';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ClanRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly clsService: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ClanRole[]>(
      CLAN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const user = this.clsService.get<UserEntity>(USER_TOKEN);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clanId = request.params?.clan_id;

    if (!clanId) {
      return true;
    }

    if (clanId !== user.clan_id) {
      throw new ForbiddenException(
        `Access denied: You are not a member of clan ${clanId}.`,
      );
    }

    if (!requiredRoles.includes(user.clan_role)) {
      const allowed = requiredRoles.join(', ');
      throw new ForbiddenException(
        `Permission denied: This action requires one of the following clan roles — [${allowed}]`,
      );
    }

    return true;
  }
}
