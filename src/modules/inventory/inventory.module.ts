import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
})
export class InventoryModule {}
