import { AdminGuardModule } from '@libs/guard/admin-guard.module';
import { TransactionsController } from '@modules/admin/transactions/transactions.controller';
import { TransactionsModule } from '@modules/admin/transactions/transactions.module';
import { Module } from '@nestjs/common';
import { AdminAuthController } from './auth/auth.controller';
import { AdminAuthModule } from './auth/auth.module';
import { UserManagementController } from './users/user-management.controller';
import { UserManagementModule } from './users/user-management.module';
import { AdminPetPlayersModule } from './pet-players/pet-players.module';
import { AdminPetPlayersController } from './pet-players/pet-players.controller';

@Module({
  imports: [
    AdminGuardModule,
    TransactionsModule,
    UserManagementModule,
    AdminAuthModule,
    AdminPetPlayersModule,
  ],
  controllers: [
    TransactionsController,
    UserManagementController,
    AdminAuthController,
    AdminPetPlayersController,
  ],
})
export class AdminModule {}
