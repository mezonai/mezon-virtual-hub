import { Module } from "@nestjs/common";

import { UserEntity } from "@modules/user/entity/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClsModule } from "nestjs-cls";
import { AdminAuthService } from "./auth.service";
import { OAuth2Service } from "./oauth2.service";
import { AdminJwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({}),
    PassportModule,
    ClsModule,
  ],
  providers: [AdminAuthService, AdminJwtStrategy, OAuth2Service],
  exports: [AdminAuthService],
})
export class AdminAuthModule { }
