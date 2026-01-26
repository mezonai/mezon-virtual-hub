import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from './entity/recipe.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeEntity, ClanWarehouseEntity, ClanFundEntity, Inventory])],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}
