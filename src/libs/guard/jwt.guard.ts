import { SKIP_AUTH, SKIP_GLOBAL_GUARD } from "@/constant/meta-key.constant";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    const skipGlobalGuard = this.reflector.getAllAndOverride<boolean>(SKIP_GLOBAL_GUARD, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuth || skipGlobalGuard) return true;

    return super.canActivate(context);
  }
}
