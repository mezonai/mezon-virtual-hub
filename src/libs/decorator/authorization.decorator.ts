import { SKIP_AUTH, SKIP_GLOBAL_GUARD } from "@constant/meta-key.constant";
import { AdminGuard } from "@libs/guard/admin.guard";
import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";

export const Public = () => SetMetadata(SKIP_AUTH, true);

export function RequireAdmin() {
  return applyDecorators(
    UseGuards(AdminGuard),
    SetMetadata(SKIP_GLOBAL_GUARD, true)
  );
}