import { configEnv } from '@config/env.config';
import { USER_TOKEN } from '@constant/meta-key.constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  CanActivate,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AdminBypassGuard implements CanActivate {
  constructor(private readonly clsService: ClsService) {}

  async canActivate(): Promise<boolean> {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    try {
      const adminBypassUsers = configEnv().ADMIN_BYPASS_USERS?.split(',') || [];
      if (adminBypassUsers.includes(user.username)) return true;
      throw new ForbiddenException();
    } catch (error) {
      throw error;
    }
  }
}
