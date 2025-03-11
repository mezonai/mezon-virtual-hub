import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ItemController } from '@modules/item/item.controller';
import { ItemModule } from '@modules/item/item.module';
import { ItemService } from '@modules/item/item.service';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { UserEntity } from '@modules/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, UserEntity, ItemEntity]),
    ClsModule,
    ItemModule,
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
