import {
  CLAN_ROLES_KEY,
  SKIP_AUTH,
  SKIP_GLOBAL_GUARD,
} from '@constant/meta-key.constant';
import { ClanRole } from '@enum';
import { AdminGuard } from '@libs/guard/admin.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

export const Public = () => SetMetadata(SKIP_AUTH, true);

export function RequireAdmin() {
  return applyDecorators(
    UseGuards(AdminGuard),
    SetMetadata(SKIP_GLOBAL_GUARD, true),
  );
}

export const RequireClanRoles = (...roleKeys: (keyof typeof ClanRole)[]) => {
  const roles = roleKeys?.map((key) => ClanRole[key]);
  return SetMetadata(CLAN_ROLES_KEY, roles);
};
