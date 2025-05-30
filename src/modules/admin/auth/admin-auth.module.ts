import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { OAuth2Service } from './oauth2.service';
import { UserModule } from '@modules/user/user.module';
import authConfig from '@config/env-config/auth-env.config';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
    ConfigModule.forFeature(authConfig),
  ],
  providers: [
    AdminAuthService,
    OAuth2Service,
    JwtStrategy,
  ],
  controllers: [AdminAuthController],
})
export class AdminAuthModule {}
