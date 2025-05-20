import { InventoryModule } from '@modules/inventory/inventory.module';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { FoodEntity } from './entity/food.entity';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodEntity, UserEntity]),
    ClsModule,
    forwardRef(() => UserModule),
  ],
  providers: [FoodService],
  controllers: [FoodController],
  exports: [FoodService],
})
export class FoodModule {}
