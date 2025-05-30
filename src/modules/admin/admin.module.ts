import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';

@Module({
  imports: [
    AdminAuthModule
  ],
})
export class AdminModule {}
