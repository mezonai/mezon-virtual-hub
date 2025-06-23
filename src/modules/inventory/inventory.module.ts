import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { ItemModule } from '@modules/item/item.module';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { FoodModule } from '@modules/food/food.module';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, UserEntity, ItemEntity, FoodEntity]),
    ClsModule,
    ItemModule,
    FoodModule,
    UserModule,
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
