import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientService } from './ingredient.service';
import { IngredientController } from './ingredient.controller';
import { IngredientEntity } from '@modules/ingredient/entity/ingredient.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { ItemModule } from '@modules/item/item.module';
import { PetPlayersModule } from '@modules/pet-players/pet-players.module';
import { RecipeModule } from '@modules/recipe/recipe.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        IngredientEntity,
        Inventory,
        ItemEntity,
      ]),
      InventoryModule,
      ItemModule,
      PetPlayersModule,
      RecipeModule,
    ],
  controllers: [IngredientController],
  providers: [IngredientService],
  exports: [IngredientService],
})
export class IngredientModule {}
