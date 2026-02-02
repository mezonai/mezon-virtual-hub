import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from './entity/recipe.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { PetClanEntity } from '@modules/pet-clan/entity/pet-clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { ClanAnimalEntity } from '@modules/clan-animals/entity/clan-animal.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ClanEstateEntity } from '@modules/clan-estate/entity/clan-estate.entity';
import { ClanDecorInventoryEntity } from '@modules/clan-decor-invetory/entity/clan-decor-inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecipeEntity,
      ClanWarehouseEntity,
      ClanFundEntity,
      Inventory,
      PetsEntity,
      ItemEntity,
      PlantEntity,
      PetClanEntity,
      MapEntity,
      DecorItemEntity,
      ClanAnimalEntity,
      ClanEntity,
      ClanEstateEntity,
      ClanDecorInventoryEntity,
    ])
  ],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}
