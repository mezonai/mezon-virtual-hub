import { configEnv } from '@config/env.config';
import { USER_TOKEN } from '@constant/meta-key.constant';
import { Role } from '@enum';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  CanActivate,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly clsService: ClsService) { }

  async canActivate(): Promise<boolean> {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    try {
      if (user.role === Role.ADMIN) return true;
      throw new ForbiddenException();
    } catch (error) {
      throw error;
    }
  }
}
