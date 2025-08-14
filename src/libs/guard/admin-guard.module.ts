import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClsModule } from "nestjs-cls";
import { AdminJwtAuthGuard } from "./admin-jwt.guard";

@Module({
  imports: [ClsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AdminJwtAuthGuard,
    },
  ],
})
export class AdminGuardModule { }
