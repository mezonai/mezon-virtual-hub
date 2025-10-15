import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { ClanRoleGuard } from './clan-role.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClanRoleGuard,
    },
  ],
})
export class GuardModule {}
