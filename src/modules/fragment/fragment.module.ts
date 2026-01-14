import { Module } from '@nestjs/common';
import { FragmentService } from './fragment.service';
import { FragmentController } from './fragment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FragmentEntity } from '@modules/fragment/entity/fragment.entity';
import { FragmentItemEntity } from '@modules/fragment-item/entity/fragment-item.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { PetPlayersModule } from '@modules/pet-players/pet-players.module';
import { ItemEntity } from '@modules/item/entity/item.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([FragmentEntity, FragmentItemEntity, Inventory, ItemEntity]),
      InventoryModule,
      ItemModule,
      PetPlayersModule,
    ],
  controllers: [FragmentController],
  providers: [FragmentService],
  exports: [FragmentService],
})
export class FragmentModule {}
