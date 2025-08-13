import { TransactionsController } from '@modules/admin/transactions/transactions.controller';
import { TransactionsModule } from '@modules/admin/transactions/transactions.module';
import { Module } from '@nestjs/common';
import { UserManagementModule } from './users/user-management.module';
import { UserManagementController } from './users/user-management.controller';

@Module({
  imports: [TransactionsModule, UserManagementModule],
  controllers: [TransactionsController, UserManagementController],
})
export class AdminModule {}
